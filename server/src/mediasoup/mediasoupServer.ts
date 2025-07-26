import { createWorker } from "mediasoup";
import type {
  Worker,
  Router,
  WebRtcTransport,
  WebRtcTransportOptions,
  DtlsParameters,
  RtpParameters,
  MediaKind,
  Producer,
  Consumer,
} from "mediasoup/node/lib/types";

let worker: Worker;
let router: Router;

export async function startMediasoup() {
  worker = await createWorker({
    rtcMinPort: 20000,
    rtcMaxPort: 20200,
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died. Restarting...");
    setTimeout(() => process.exit(1), 2000);
  });

  console.log("✅ Mediasoup worker created");

  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
    ],
  });

  console.log("✅ Mediasoup router created");
}

export function getRouter() {
  return router;
}

const transports = new Map<string, WebRtcTransport>();
const producers = new Map<string, Producer>();
const consumers = new Map<string, Consumer>();

const transportOptions: WebRtcTransportOptions = {
  listenIps: [{ ip: "127.0.0.1", announcedIp: "127.0.0.1" }],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1000000,
};

// Shared helper
function getTransport(socketId: string) {
  return transports.get(socketId);
}

export async function createWebRtcTransport(socketId: string, direction: 'send' | 'recv') {
  const transport = await router.createWebRtcTransport(transportOptions);
  transports.set(`${socketId}-${direction}`, transport);

  return {
    transport,
    params: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  };
}

export async function connectTransport(socketId: string, dtlsParameters: DtlsParameters, direction: 'send' | 'recv') {
  const transport = transports.get(`${socketId}-${direction}`);
  if (!transport) throw new Error("Transport not found");
  await transport.connect({ dtlsParameters });
}

export async function createProducer(socketId: string, kind: MediaKind, rtpParameters: RtpParameters) {
  const transport = transports.get(`${socketId}-send`);
  if (!transport) throw new Error("Send transport not found");

  const producer = await transport.produce({ kind, rtpParameters });
  producers.set(socketId, producer);

  return { id: producer.id };
}

export async function createConsumer(consumerSocketId: string, producerSocketId: string) {
  const producer = producers.get(producerSocketId);
  if (!producer) throw new Error("Producer not found");

  const transport = transports.get(`${consumerSocketId}-recv`);
  if (!transport) throw new Error("Recv transport not found");

  const consumer = await transport.consume({
    producerId: producer.id,
    rtpCapabilities: router.rtpCapabilities,
    paused: false,
  });

  consumers.set(`${consumerSocketId}-${producerSocketId}`, consumer);

  return {
    id: consumer.id,
    producerId: producer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
  };
}
export function getAllProducersExcept(socketId: string) {
  const others = [];
  for (const [id, producer] of producers.entries()) {
    if (id !== socketId) {
      others.push({ socketId: id });
    }
  }
  return others;
}