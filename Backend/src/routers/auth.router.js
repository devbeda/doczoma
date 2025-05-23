import express, { Router } from "express"
import { createOrder, getTransactionsByUser, getUser, loginUser, logoutUser, registerUser, sendOtp, updateUser, verifyPaymentAndCreateTransaction } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/sendotp", sendOtp)
router.post("/signup", registerUser)
router.post("/login", loginUser)
router.post("/logout",verifyJWT, logoutUser)
router.get("/getuser", verifyJWT, getUser)
router.put("/updateuser", verifyJWT, updateUser)
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPaymentAndCreateTransaction);
router.get("/user/:userId", getTransactionsByUser);

export default router