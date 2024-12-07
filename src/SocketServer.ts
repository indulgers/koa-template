import { IncomingMessage } from 'http';
import WebSocket, { Server, ServerOptions } from 'ws';

const sockets: WebSocket[] = [];

export function createSocketServer(
    options: ServerOptions,
    onConnection?: (
        this: Server,
        socket: WebSocket,
        request: IncomingMessage
    ) => any
) {
    const server = new Server(options);
    server.on('listening', () => {
        console.log(`[WebSocket] Server is running on port ${server.options.port}`);
    });
    server.on('connection', (socket, request) => {
        sockets.push(socket);

        socket.on('close', () => sockets.splice(sockets.indexOf(socket), 1));

        console.log(`[WebSocket] ${sockets.length} connections`);

        onConnection?.call(server, socket, request);

        socket.on('message', (data) => {
            console.log(`Received message: ${data}`);
            // 广播消息给所有连接的客户端
            sockets.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(data);
                }
            });
        });

        socket.on('error', (error) => {
            console.error("WebSocket error:", error);
        });
    });

    server.on('error', console.error);

    return server;
}

export async function sendSocket(data: any) {
    if (!sockets[0]) console.warn('No socket connected');

    for (const socket of sockets)
        await new Promise<void>((resolve, reject) =>
            socket.send(data, error => (error ? reject(error) : resolve()))
        );
}