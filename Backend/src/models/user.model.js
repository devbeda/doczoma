import mongoose from "mongoose";
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
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
    password:{
        type: String
    },
    rootFolders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    }],
    rootFiles:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"File"
    }],
    storageOccupide: {
        type: Number
    },
    choosedPlan:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan"
    },
    planExpiry: {
        type: Date
    },
    planStarting:{
        type: Date
    }

})

userSchema.methods.createAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
}

export const User = mongoose.model("User", userSchema);