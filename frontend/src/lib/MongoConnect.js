import { connect } from "mongoose";

export default async function MongoConnect() {
  try {
    console.log("[MongoConnect] Attempting to connect to MongoDB...");
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await connect(process.env.MONGODB_URI);
    console.log("[MongoConnect] Successfully connected to MongoDB");
  } catch (err) {
    console.error("[MongoConnectError]:", err.message);
    console.error("[MongoConnectStack]:", err.stack);
    throw err; // Re-throw to handle in the calling function
  }
}