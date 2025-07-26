import { useEffect, useState, useRef } from 'react';
import { Device, types as mediasoupTypes } from 'mediasoup-client';
import type {
  RtpCapabilities,
  Transport,
  DtlsParameters,
  MediaKind,
  RtpParameters,
} from 'mediasoup-client/types';
import { useSocket } from '../lib/SocketProvider';

function Stream() {
  const socket = useSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [device, setDevice] = useState<Device | null>(null);

  // Load the mediasoup device
  const loadDevice = async (): Promise<Device> => {
    return new Promise((resolve) => {
      socket?.emit(
        'get-rtp-capabilities',
        {},
        async (rtpCapabilities: RtpCapabilities) => {
          const dev = new Device();
          await dev.load({ routerRtpCapabilities: rtpCapabilities });
          resolve(dev);
        }
      );
    });
  };

  // Create the send transport
  const createSendTransport = async (device: Device): Promise<Transport> => {
    return new Promise((resolve, reject) => {
      socket?.emit(
        'create-send-transport',
        {},
        async ({
          params,
          error,
        }: {
          params: mediasoupTypes.TransportOptions;
          error?: string;
        }) => {
          if (error) return reject(error);

          const transport = device.createSendTransport(params);

          // Connect DTLS
          transport.on(
            'connect',
            (
              { dtlsParameters }: { dtlsParameters: DtlsParameters },
              callback,
              errback
            ) => {
              socket.emit(
                'connect-transport',
                { dtlsParameters, transportId: transport.id },
                () => {
                  callback();
                }
              );
            }
          );

          // Produce media
          transport.on(
            'produce',
            (
              {
                kind,
                rtpParameters,
              }: { kind: MediaKind; rtpParameters: RtpParameters },
              callback,
              errback
            ) => {
              socket.emit(
                'produce',
                {
                  kind,
                  rtpParameters,
                  transportId: transport.id,
                },
                ({ id }: { id: string }) => {
                  callback({ id });
                }
              );
            }
          );

          resolve(transport);
        }
      );
    });
  };

  // Get camera/mic
  const getMediaStream = async () => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  };

  useEffect(() => {
    const startStreaming = async () => {
      if (!socket) return;

      const device = await loadDevice();
      setDevice(device);

      const transport = await createSendTransport(device);
      const stream = await getMediaStream();

      // Attach stream to local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Send tracks
      for (const track of stream.getTracks()) {
        await transport.produce({ track });
      }
    };

    startStreaming();
  }, [socket]);

  return (
    <div className="stream-container">
      <h2>You are streaming 🎥</h2>
      <video ref={localVideoRef} autoPlay playsInline muted />
    </div>
  );
}

export default Stream;
