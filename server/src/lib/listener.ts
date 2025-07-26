import { Server, Socket } from "socket.io";
import {
  getRouter,
  createWebRtcTransport,
  connectTransport,
  createProducer,
  createConsumer,
  getAllProducersExcept,
} from "../mediasoup/mediasoupServer";

export default function listener(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`✅ User Connected ${socket.id}`);

    socket.on("get-rtp-capabilities", (_, callback) => {
      const rtpCapabilities = getRouter().rtpCapabilities;
      callback(rtpCapabilities);
    });

    socket.on("create-send-transport", async (_, callback) => {
      const { transport, params } = await createWebRtcTransport(
        socket.id,
        "send"
      );
      callback({ params });
    });

    socket.on("create-recv-transport", async (_, callback) => {
      const { transport, params } = await createWebRtcTransport(
        socket.id,
        "recv"
      );
      callback({ params });
    });

    socket.on(
      "connect-transport",
      async ({ dtlsParameters, direction }, callback) => {
        await connectTransport(socket.id, dtlsParameters, direction);
        callback();
      }
    );

    socket.on("produce", async ({ kind, rtpParameters }, callback) => {
      const { id } = await createProducer(socket.id, kind, rtpParameters);
      callback({ id });

      // Notify all clients that a new producer is available
      socket.broadcast.emit("new-producer", { producerSocketId: socket.id });
    });

    socket.on("consume", async ({ producerSocketId }, callback) => {
      try {
        const consumerData = await createConsumer(socket.id, producerSocketId);
        callback(consumerData);
      } catch (err) {
        console.error("Consume error:", err);
        callback({ error: err.message });
      }
    });
    socket.on("get-producers", (_, callback) => {
      const producers = getAllProducersExcept(socket.id);
      callback(producers.map((p) => p.socketId));
    });
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected ${socket.id}`);
    });
  });
}
