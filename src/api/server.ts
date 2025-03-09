import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboardRoutes";
import schedulerRoutes from "./routes/schedulerRoutes";

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes with Prefix
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/scheduler", schedulerRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.send({ detail: "AutoSQL is working" });
});

// Start Server with Error Handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/api/v1`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Trying another port...`);
    setTimeout(() => {
      server.close();
      app.listen(0, () =>
        console.log(`✅ Server restarted on a different port`)
      );
    }, 1000);
  } else {
    console.error("❌ Server error:", err);
  }
});
