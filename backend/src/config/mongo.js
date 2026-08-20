import mongoose from "mongoose";

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo Connected");
    } catch (err) {
        console.error("Mongo ERROR:", err.message);
    }
};