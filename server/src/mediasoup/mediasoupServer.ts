import { createWorker } from "mediasoup";

import type {
  Worker,
  Router,
  WebRtcTransport,
  RouterOptions,
  WebRtcTransportOptions,
  DtlsParameters,
  RtpParameters,
  MediaKind,
  Producer,
} from "mediasoup/node/lib/types";
let worker: Worker;
let router: Router;

export async function startMediasoup() {  
  worker = await createWorker({
    rtcMinPort: 20000,
    rtcMaxPort: 20200,
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died. Restarting in 2 seconds...");
    setTimeout(() => process.exit(1), 2000);
  });

  console.log("Mediasoup Worker created ✅");

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
        parameters: {},
      },
    ],
  });

  console.log("Mediasoup Router created ✅");
}

export function getRouter() {
  return router;
}

const transports = new Map<string, WebRtcTransport>();
const producers = new Map<string, Producer>();


const transportOptions: WebRtcTransportOptions = {
  listenIps: [{ ip: "127.0.0.1", announcedIp: "127.0.0.1" }],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1000000,
};

export async function createWebRtcTransport(socketId: string): Promise<{
  transport: WebRtcTransport;
  params: {
    id: string;
    iceParameters: any;
    iceCandidates: any;
    dtlsParameters: any;
  };
}> {
  const router = getRouter();
  const transport = await router.createWebRtcTransport(transportOptions);
  console.log("Transport started")
  transports.set(socketId, transport);

  transport.on("dtlsstatechange", (state) => {
    if (state === "closed") {
      transport.close();
    }
  });

  transport.on("@close", () => {
    console.log("Transport closed");
  });

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


export function getTransport(socketId: string) {
  return transports.get(socketId);
}

export async function connectTransport(socketId: string, dtlsParameters: DtlsParameters) {
  const transport = getTransport(socketId);
  if (!transport) throw new Error("Transport not found");
  await transport.connect({ dtlsParameters });
}

export async function createProducer(
  socketId: string,
  kind: MediaKind,
  rtpParameters: RtpParameters
): Promise<{ id: string }> {
  const transport = getTransport(socketId);
  if (!transport) throw new Error("Transport not found");

  const producer = await transport.produce({ kind, rtpParameters });
  producers.set(socketId, producer);

  return { id: producer.id };
}