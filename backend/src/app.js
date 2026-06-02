import express from "express"
import cors from "cors"

import aiRoutes from "./routes/ai.routes"
import chatRoutes from "./routes/chat.routes"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);
app.use("/chat", chatRoutes);

export default app;