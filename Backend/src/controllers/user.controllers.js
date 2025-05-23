import { User } from "../models/user.model.js";
import { sendOtpSMS } from "../utils/twillio.js";
import {redisClient} from "../utils/redisClient.js";
import { Plan } from "../models/plan.model.js";
import Razorpay from 'razorpay';
import { Transaction } from "../models/transaction.model.js";

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

export const sendOtp = async (req, res) => {
  const { phoneNo } = req.body;
  if (!phoneNo) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(otp);
  
  try {
    await redisClient.set(phoneNo, otp, {EX: 300});

    await sendOtpSMS(phoneNo, otp);

    return res.status(200).json({ message: "OTP sent Successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
    if (!phoneNo || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    const existingUser = await User.findOne({ phoneNo });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const storedOtp = await redisClient.get(phoneNo);

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const freePlan = await Plan.findOne({ planName: "Free" });

     if (!freePlan) {
      return res.status(500).json({ message: "Free plan is not available in the system." });
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + freePlan.planDuration);

    const newUser = new User({
      phoneNo,
      choosedPlan: freePlan._id,
      planStarting: now,
      planExpiry: expiry,
    });
    await newUser.save();
    const accessToken = await generateAccessToken(newUser._id);
    await redisClient.del(phoneNo);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .json({ message: "User registered successfully", newUser , accessToken });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
    if (!phoneNo || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    const user = await User.findOne({ phoneNo });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const storedOtp = await redisClient.get(phoneNo);

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const accessToken = await generateAccessToken(user._id);
    await redisClient.del(phoneNo);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({ message: "User logged in successfully", accessToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id
    const userPhoneNo = req.user.phoneNo
    if (!userId) {
      return res.status(400).json({ message: "UnAuthotized " });
    }

    await redisClient.del(userPhoneNo);

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
    .populate({path:"rootFolders"})
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
})

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Generate signature to verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
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
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, message: "Payment verified", transaction });
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

