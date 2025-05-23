import mongoose from "mongoose";
import { type } from "os";

const fileSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    parentfolder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
    },
    name:{
        type: String,
        required: true,
    },
    size:{
        type: Number,
        required: true,
    },
    fileUrl:{
        type: String,
        required: true,
    },
    fileType: {
    type: String,
    required: true, // e.g., "pdf", "jpg", "docx"
  },
    isRoot:{
        type: Boolean,
        default: false,
    },
    schedule:{
        type: Date
    }
},{timestamps: true});

export const File = mongoose.model("File", fileSchema);