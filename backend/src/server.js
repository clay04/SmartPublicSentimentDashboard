import dotenv from "dotenv"
import app from "./app"
import { connectMongo } from "./config/mongo"

dotenv.config();
const PORT = process.env.PORT || 3000;

connectMongo();

app.listen(PORT, () => {
    console.log(`Backend Running on ${PORT}`);
});