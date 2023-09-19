const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../model/Auth")
const LoginAttempt = require("../model/LoginAttemptLimit"); 
const TempUser = require("../model/TempUser")
const { sendEmail } = require("../service_container/MailService");
const otpMailTemplate = require("../helpers/otpMailTemplate");
const mailTemplate = require("../helpers/emailTemplate");
const Otp = require("../model/Otp");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");


class AuthController {


  //// login
  async login(req, res){

    try {

      const ip = req.ip.split(":").pop();
      let block = false;
      let limit;

      const { email, password } = req.body;

      const auth = await Auth.findOne({ email,ban:false })

      if(!auth){
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not registered",
          true
        );
      }

      ////////////// rate Limiter check
      if (auth) {
        limit = await LoginAttempt.findOne({
          email,
          ip,
          limit: { $gte: process.env.LIMIT },
        });

        if (limit) {
          const timestamp = new Date(limit.timestamp);
          const timeDifference = new Date() - timestamp;

          // hit is crossing the limit during a time period
          if (timeDifference < 1 * 60 * 1000) {
            // The time difference is less than 1 minutes
            block = true;
          } else {
            const unblockTime = new Date(
              limit.timestamp.getTime() + 1 * 60 * 1000
            ); // Unblock after 20 minutes
            if (unblockTime <= new Date()) {
              await LoginAttempt.deleteOne({ email, ip });
            }
          }
        }

        if (block) {
          // User has exceeded the login attempts limit
          return sendResponse(
            res,
            HTTP_STATUS.FORBIDDEN,
            "Login attempts limit exceeded. Try again later.",
            true
          );
        }
      }

      // compare password with hashedpassword
      if (auth && (await bcrypt.compare(password, auth.password))) {
        const {role, email, _id, user} = auth;

        const accessToken = jwt.sign(
          {
            user_data: {
              email,
              _id,
              role,
              user,
            },
          },
          process.env.ACCESS_TOKEN_SECERT,
          {expiresIn:"1h"}
        );

        // const { user } = auth;
        if (block) {
          block.finOneAndDelete({ email, ip });
        }

        res.cookie('token', accessToken, {
          maxAge: 3600000, // 1 hour in milliseconds
          httpOnly: true, // Cookie can only be accessed via HTTP(S)
          secure: process.env.NODE_ENV === 'production', // Enable in production
        });

        

        const authUser = await User.findOne({_id:user}).select('first_name last_name user_name email role amount');
        return sendResponse(res, HTTP_STATUS.OK, "Successfully Logged in",authUser);
      } else {
        await LoginAttempt.findOneAndUpdate(
          { email, ip },
          { $setOnInsert: { email, ip }, $inc: { limit: 1 } },
          { upsert: true, new: true }
        );

        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "email or password is not valid",
          true
        );
     
      }

      
    } catch (error) {
       return sendResponse(
         res,
         HTTP_STATUS.INTERNAL_SERVER_ERROR,
         "Internal server error",
         true
       );
    }
     
  }


  ///// registration
 async registration(req, res){

      try {

        const { first_name, last_name, user_name, email, password } = req.body;

        const userAvailable = await Auth.findOne({ email });

        //// chek if user is already exist or not
        if (userAvailable) {
          return sendResponse(
            res,
            HTTP_STATUS.CONFLICT,
            "Email is already registered",
            true
          );
        }

        ////Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


    /// insert into database with temporary table
    const tempUser = new TempUser({
      first_name,
      last_name,
      user_name,
      email,
      password: hashedPassword,
      role: req.role,
    });

    
    const temp = await tempUser.save();

    //// create token
    req.token = jwt.sign(
      {
        user: {
          email,
          id:temp._id
        },
      },
      process.env.ACCESS_TOKEN_SECERT,
      { expiresIn: "1h" }
    );

    //// send email
    const result = await sendEmail(email,"Registration", mailTemplate(req.token));

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      "Mail has been sent Please check your email to verify your account",
      true
    );

      } catch (error) {

        return sendResponse(
          res,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Internal server error",
          true
        );
      }


  }


  /////////// Logout 
  async logout(req, res){
        try {
          res.clearCookie("token");
          res.clearCookie("google-auth-session");
          return sendResponse(
            res,
            HTTP_STATUS.OK,
            "Successfully LoggedOut",
          );

        } catch (error) {
          return sendResponse(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "Internal server error",
            true
          );
        }
  }



  /////////// verification 
  async verification(req, res){

    /////////////////// find if temporary user exist or not

    try {
      const tempUser = await TempUser.findOne({ _id:req.id });

      if (!tempUser) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not authorized token is invalid"
        );
      }
  
      /////////////////// find if real user exist or not
      const userAvailable = await Auth.findOne({ email: req.email });
  
      if (userAvailable) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered",
          true
        );
      }
  
      /// insert into database with user table
      const { _id,first_name, last_name, user_name, email, password,role } = tempUser;
  
      const user = new User({
        first_name,
        last_name,
        user_name,
        email,
        password,
        role,
      });
  
      await user.save();
  
      const auth = new Auth({
        email,
        password,
        role,
        user: user._id
      })
  
      await auth.save();
  
      /// Delete temporary data
      await TempUser.findByIdAndDelete(_id);
  
      //// confirmation response
      return sendResponse(res, HTTP_STATUS.OK, "Successfully signed up");

    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
      
    }
    

  }


  async otp(req,res){

    try {

      const { email } = req.body;

      const user = await Auth.findOne({email});

      if(user){
        const ip = req.ip.split(":").pop();

        // Check if there is an OTP record created in the last 5 minutes
        const lastOtp = await Otp.findOne({ email, ip })
          .sort({ createdAt: -1 })
          .exec();

        if (lastOtp) {
          const currentTime = new Date();
          const otpCreationTime = lastOtp.createdAt;
          const timeDifferenceInMinutes =
            (currentTime - otpCreationTime) / (1000 * 60);

          if (timeDifferenceInMinutes < 5) {
            return sendResponse(
              res,
              HTTP_STATUS.BAD_REQUEST,
              "Please wait at least 5 minutes before requesting another OTP.",
              true
            );
          }
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const data = new Otp({ email, ip, otp });
        await data.save();
        await sendEmail(email, "OTP", otpMailTemplate(otp));
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "OTP has been sent and it will be valid for 5 min"
        );
      }else{

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User doesnot found",
          true
        );
      }
    
      
    } catch (error) {
   console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }

  }

  async reset(req, res){

    try {
      const { email, otp, password } = req.body;

      const user = Auth.findOne(email);

      if(user){
        const ip = req.ip.split(":").pop();
       
        const data = await Otp.findOne({ email, ip, otp });
        if (data) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const update = await Auth.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } }
          ).exec();

          const del = await Otp.findByIdAndDelete(data._id);

          if (update) {
            return sendResponse(
              res,
              HTTP_STATUS.OK,
              "Password has been updated",
              user
            );
            
          } else {
            return sendResponse(res, HTTP_STATUS.NOT_MODIFIED, "Not modified",true);
          }
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data does not found",
            true
          );
         
        }
      }else{
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not Exist",
          true
        );
      }

      
      
    } catch (error) {
     
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }

  }



}

module.exports = new AuthController();
