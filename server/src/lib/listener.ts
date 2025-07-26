import { Server, Socket } from "socket.io";
import { connectTransport, createProducer, createWebRtcTransport, getRouter } from "../mediasoup/mediasoupServer";

export default function listener(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`✅ User Connected ${socket.id}`);
    socket.on("get-rtp-capabilities", (_, callback) => {
      const rtpCapabilities = getRouter().rtpCapabilities;
      callback(rtpCapabilities);
    });
    socket.on("create-send-transport", async (_, callback) => {
      try {
        const { params } = await createWebRtcTransport(socket.id);
        callback({ params });
      } catch (err) {
        console.error("Transport creation failed", err);
        callback({ error: err });
      }
    });
    socket.on("connect-transport", async ({ dtlsParameters }, callback) => {
      try {
        await connectTransport(socket.id, dtlsParameters);
        callback({ connected: true });
      } catch (err) {
        console.error("Error connecting transport", err);
        callback({ error: err });
      }
    });

    socket.on("produce", async ({ kind, rtpParameters }, callback) => {
      try {
        const { id } = await createProducer(socket.id, kind, rtpParameters);
        callback({ id });
      } catch (err) {
        console.error("Error creating producer", err);
        callback({ error: err });
      }
    });
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected ${socket.id}`);
    });
  });
}
