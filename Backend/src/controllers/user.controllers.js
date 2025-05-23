import { User } from "../models/user.model.js";
import { sendOtpSMS } from "../utils/twillio.js";
import { redisClient } from "../utils/redisClient.js";
import { Plan } from "../models/plan.model.js";
import Razorpay from "razorpay";
import { Transaction } from "../models/transaction.model.js";
import Otp from "../models/otp.model.js";
import bcrypt from "bcryptjs";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.createAccessToken();
    return accessToken;
  } catch (error) {
    console.error("Error generating access token:", error);
  }
};

// import { sendOtpSMS } from "../utils/sendOtp.js"; // your SMS function

export const sendOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return res.status(400).json({ message: "Phone number is required" });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  
    try {
      await Otp.findOneAndUpdate(
        { phoneNo },
        { otp, expiresAt },
        { upsert: true, new: true }
      );
  
      await sendOtpSMS(phoneNo, otp);
  
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error("Error sending OTP", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
  
    if (!phoneNo || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }
  
    const otpEntry = await Otp.findOne({ phoneNo });
    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  
    await Otp.deleteOne({ phoneNo }); // Optional, delete OTP after verification
  
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying otp", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { phoneNo, password, fullName, email } = req.body;
  
    if (!phoneNo || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }
  
    const existingUser = await User.findOne({ phoneNo });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const freePlan = await Plan.findOne({ planName: "Free" });
    const now = new Date();
    const expiry = new Date(now.getTime() + freePlan.planDuration * 24 * 60 * 60 * 1000);
  
    const newUser = new User({
      fullName,
      phoneNo,
      email,
      password: hashedPassword,
      choosedPlan: freePlan._id,
      planStarting: now,
      planExpiry: expiry,
    });
  
    await newUser.save();
    const accessToken = await generateAccessToken(newUser._id);
  
    return res.status(201)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .json({ message: "User registered successfully", accessToken });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phoneNo, password } = req.body;

  if (!phoneNo || !password) {
    return res.status(400).json({ message: "Phone number and password are required" });
  }

  const user = await User.findOne({ phoneNo });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const accessToken = await generateAccessToken(user._id);

  return res.status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .json({ message: "Login successful", user,accessToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "UnAuthotized " });
    }


    const options = {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    };

    return res
      .status(200)
      .cookie("accessToken", "", options)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({ path: "rootFolders" })
      .populate("rootFiels")
      .populate("choosedPlan");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.fullName = name;
    if (email) user.email = email;
    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, userId, planId } = req.body;

    const options = {
      amount: amount * 100, // Razorpay accepts in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Store in DB with status "pending"
    await Transaction.create({
      userId,
      planId,
      amount,
      razorpayOrderId: order.id,
      status: "pending",
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// ✅ Create a transaction after successful payment verification
export const verifyPaymentAndCreateTransaction = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Generate signature to verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Update the existing transaction by order ID
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "success",
      },
      { new: true }
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Payment verified", transaction });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🔍 Optional: Get all transactions for a user
export const getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
