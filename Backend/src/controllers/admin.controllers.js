import { Plan } from "../models/plan.model.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import bcryptjs from "bcryptjs";

const generateAccessToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("User not found");
    }
    const accessToken = admin.createAccessToken();
    return accessToken;
  } catch (error) {
    console.error("Error generating access token:", error);
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already registered" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res
      .status(201)
      .json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error registering admin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await generateAccessToken(admin._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", token, options)
      .json({
        message: "Admin logged in successfully",

        admin: {
          _id: admin._id,
          email: admin.email,
        },
        token,
      });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Clear the cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    console.error("Error during admin logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdmin = async(req,res) => {
  try {
    const adminId = req.admin._id; // comes from JWT middleware

    // ✅ Get total user count
    const totalUsers = await User.countDocuments();

    // ✅ Get total storage occupied by all users
    const storageResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalOccupiedStorage: { $sum: "$storageOccupide" },
        },
      },
    ]);
    const totalStorage = storageResult[0]?.totalOccupiedStorage || 0;

    // ✅ Update admin document and return updated one
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { totalUsers, totalStorage },
      { new: true } // returns the updated document
    );

    return res.status(200).json({
      message: "Admin data fetched and updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();

    if (!plans) {
      return res.status(500).json({ message: "Can't find any Plans" });
    }

    return res.status(200).json({ messge: "Plan fetched Successfully", plans });
  } catch (error) {
    console.error("Can't fetch Plans", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { planName, planPrice, planDuration, storageLimit } = req.body;

    let updateField = {};
    if (planName !== undefined) updateField.planName = planName;
    if (planPrice !== undefined) updateField.planPrice = planPrice;
    if (planDuration !== undefined) updateField.planDuration = planDuration;
    if (storageLimit !== undefined) updateField.storageLimit = storageLimit;

    const updatedPlan = await Plan.findByIdAndUpdate(planId, updateField, {
      new: true,
    });

    if (!updatePlan) {
      return res.status(500).json({ message: "Can't Find your Plan" });
    }

    return res
      .status(200)
      .json({ message: "Plan updated successfully", updatedPlan });
  } catch (error) {
    console.error("Can't update your Plan", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    const deletePlan = await Plan.findByIdAndDelete(planId);

    if (!deletePlan) {
      return res.status(500).json({ message: "Can't find your plan" });
    }

    return res.status(200).json({ message: "plan deleted successfully" });
  } catch (error) {
    console.error("Can't delete your Plan", error);
    return res
      .status(500)
      .json({ message: "Server Error while deleting your plan" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    const totalStorage = users.reduce(
      (acc, user) => acc + (user.storageOccupide || 0),
      0
    );

    return res.status(200).json({
      message: "User fetched sucessfully",
      totalStorageInMB: (totalStorage / (1024 * 1024)).toFixed(2),
      users,
    });
  } catch (error) {
    console.error("Can't fetch users");
    return res
      .status(500)
      .json({ message: "Server Error while fecthing user" });
  }
};
