import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    planName:{
        type:String,
        required:true
    },
    planPrice:{
        type:Number,
        required:true
    },
    planDuration:{
        type:Number,
        required:true
    },
    storageLimit:{
        type:Number,
        required:true
    }
})

export const Plan = mongoose.model("Plan", planSchema);