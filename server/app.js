import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./models/index.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import sellerDecisionRoutes from "./routes/sellerDecisionRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// console.log(path.join(__dirname, "../.env"));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __dir = path.dirname(__dirname);

dotenv.config({ path: path.join(__dir, ".env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId) socket.join(userId.toString());
  console.log(`User ${userId} connected to personal room`);

  socket.on("join_room", (auctionId) => {
    socket.join(auctionId);
    console.log(`User joined auction room: ${auctionId}`);
  });
  socket.on("leave_room", (auctionId) => {
    socket.leave(`User left auction room: ${auctionId}`);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected.");
  })
  .catch((error) => console.error(error));

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database models synced");
  })
  .catch((error) => console.error(error));

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/seller", sellerDecisionRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
