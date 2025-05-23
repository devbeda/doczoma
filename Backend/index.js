import express from "express";
import dotenv from "dotenv";
import { DBConnect } from "./src/database/DBconnect.js";
import cors from "cors";
import authRoutes from "./src/routers/auth.router.js";
import adminRoutes from "./src/routers/admin.routers.js"
import fileRoutes from "./src/routers/file.router.js"
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile with no origin and known dev hosts
      const allowedOrigins = [
        "http://localhost:8081",
        "exp://192.168.0.5:8081",
        "http://192.168.0.5:8081",
        undefined, // React Native requests may send no origin
      ];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));


const startServer = async () => {
  try {

    await DBConnect();

    app.use("/api/v1/user", authRoutes);
    app.use("/api/v1/admin",adminRoutes);
    app.use("/api/v1/file", fileRoutes)

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Initialization Error:", error);
    process.exit(1);
  }
}

startServer()
