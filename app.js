import express from "express";
import cors from "cors";
import userAuth from "./routes/userAuth.js";
import collectionRoutes from "./routes/collectionRoute.js";
import taskRoutes from "./routes/taskRoute.js";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// make req.io available to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// socket.io connection
io.on("connection", (socket) => {
  console.log("New user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use("/auth", userAuth);
app.use("/api/collections", collectionRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/ping", (req, res) => {
  res.send("pong!");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
