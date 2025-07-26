import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import listener from "./lib/listener";
import { startMediasoup } from "./mediasoup/mediasoupServer";

const app = express();
const server = http.createServer(app);
const PORT = 4000;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.get("/", (req: any, res: any) => {
  res.send("Hello!");
});
startMediasoup()
listener(io);


server.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
