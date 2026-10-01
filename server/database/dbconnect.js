import mongoose from "mongoose";
import { env } from "../config/env.js";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: env.mongoMaxPool, // connections per process (workers x pool must fit your Mongo plan)
      serverSelectionTimeoutMS: 10_000, // fail fast when Mongo is unreachable instead of hanging
      socketTimeoutMS: 45_000,
    });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => console.warn("[mongo] disconnected"));
mongoose.connection.on("reconnected", () => console.log("[mongo] reconnected"));

export default connectDB;
