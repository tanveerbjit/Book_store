const asyncHandler = require("express-async-handler");
const Product = require("../model/Product");
const User = require("../model/User");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const Auth = require("../model/Auth");
const Order = require("../model/Order");

class AdminController {
  async profile(req, res) {
    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if (data) {
        return res.status(200).json(success("Data Has Found", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async all_vendors(req, res) {
    try {
      const data = await User.find({}, "-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return res.status(200).json(success("Data Has Found", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async users_with_user_role(req, res) {
    try {
      const data = await User.where("role")
        .eq("u")
        .select("-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return res.status(200).json(success("Data Has Found", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async users_with_admin_role(req, res) {
    try {
      const data = await User.where("role")
        .eq("a")
        .select("-_id -__v -createdAt -updatedAt");
      if (data.length > 0) {
        return res.status(200).json(success("Data Has Found", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async membership(req, res) {
    try {
      const { userId, user_type } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return res.status(404).json(failure("Data Does not found"));
      } else {
        data.user_type = user_type;
        const result = await data.save();
        if (result) {
          return res
            .status(200)
            .json(success("user membership updated successfully"));
        } else {
          return res.status(404).json(failure("Data Does not found"));
        }
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async ban(req, res) {
    try {
      const { userId,ban } = req.body;

      const data = await Auth.findOne({ _id: userId, role: "u" });
      if (!data) {
        return res.status(404).json(failure("Data Does not found"));
      } else {
        data.ban = ban;
        const result = await data.save();
        if (result) {
          return res
            .status(200)
            .json(success("user ban updated successfully"));
        } else {
          return res.status(404).json(failure("Data Does not found"));
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(failure("Internal Server Error"));
    }
  }



  async receipt(req, res) {
    try {
      
      const data = await Order.find({ role: "u" }).populate("user");
      if (data.length < 1) {
        return res.status(404).json(failure("Data Does not found"));
      } else {
        return res
            .status(200)
            .json(success("data found",data));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(failure("Internal Server Error"));
    }
  }
}




module.exports = new AdminController()