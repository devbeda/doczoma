import mongoose from "mongoose";
import jwt from "jsonwebtoken"


const adminSchema = new mongoose.Schema({
    fullName:{
        type:String,
    },
    phoneNo:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        unique:true,
    },
    totalStorage:{
        type: Number,
    },
    totalUsers:{
        type: Number,
    }
})

adminSchema.methods.createAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
}

export const Admin = mongoose.model("Admin", adminSchema);