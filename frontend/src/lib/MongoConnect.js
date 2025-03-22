import { connect } from "mongoose";

export default function MongoConnect() {
  console.log("[MongoConnect] : Connecting to MongoDB...");
  connect(process.env.MONGODB_URI).catch((err) => {
    console.log("[MongoConnectError] : ", err?.message);
  });
}