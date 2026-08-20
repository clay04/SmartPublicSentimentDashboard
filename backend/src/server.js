import dotenv from "dotenv"
import app from "./app.js"
import { connectMongo } from "./config/mongo.js"

dotenv.config();
const PORT = process.env.PORT || 3000;

connectMongo();

app.listen(PORT, () => {
    console.log(`Backend Running on ${PORT}`);
});