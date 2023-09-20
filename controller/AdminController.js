const User = require("../model/User");
const Auth = require("../model/Auth");
const Order = require("../model/Order");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class AdminController {
  
  async profile(req, res) {
    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if (data) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
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

  async all_vendors(req, res) {
    try {
      const data = await User.find({}, "-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
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

  async users_with_user_role(req, res) {
    try {
      const data = await User.where("role")
        .eq("u")
        .select("-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
        
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
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

  async users_with_admin_role(req, res) {
    try {
      const data = await User.where("role")
        .eq("a")
        .select("-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
       
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
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

  async membership(req, res) {
    try {
      const { userId, user_type } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
        
      } else {
        data.user_type = user_type;
        const result = await data.save();
        if (result) {
          return sendResponse(res, HTTP_STATUS.OK, "user membership updated successfully");
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data Does not found",
            true
          );
          
        }
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

  async ban(req, res) {
    try {
      const { userId,ban } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        data.ban = ban;
        const result = await data.save();
        if (result) {
          return sendResponse(res, HTTP_STATUS.OK, "user ban updated successfully");
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data Does not found",
            true
          );
        }
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



  async receipt(req, res) {
    try {
      
      const data = await Order.find({ role: "u" }).populate("user");
      if (data.length < 1) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        return sendResponse(res, HTTP_STATUS.OK, "user ban updated successfully", data);
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




module.exports = new AdminController()