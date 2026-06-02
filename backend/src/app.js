import express from "express"
import cors from "cors"

import aiRoutes from "./routes/ai.routes.js"
import chatRoutes from "./routes/chat.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);
app.use("/chat", chatRoutes);

export default app;