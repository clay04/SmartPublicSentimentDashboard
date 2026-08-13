import express from "express"
import cors from "cors"

import aiRoutes from "./routes/ai.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import authRoutes from "./routes/auth.routes.js"
import newsRoutes from "./routes/news.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "backend"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy"
    });
});

app.use("/auth", authRoutes)
app.use("/ai", aiRoutes);
app.use("/chat", chatRoutes);
app.use("/news", newsRoutes);

export default app;