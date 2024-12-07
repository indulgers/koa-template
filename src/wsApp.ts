import Koa from "koa";
import { WebSocketServer } from "ws";

const app = new Koa();
const port = 3000;
const wsPort = 3001;

// 创建 WebSocket 服务器
const websocket = new WebSocketServer({ host: "localhost", port: wsPort });

// 客户端向服务端发起连接，进入此回调
websocket.on("connection", (ws) => {
  console.log("连接成功");

  // 监听客户端发送的消息
  ws.on("message", (data) => {
    console.log(`Received message: ${data}`);
    // 广播消息给所有连接的客户端
    websocket.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    console.log("客户端断开连接");
  });

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
});

app.listen(port, () => {
  console.log(`The Service is running on http://localhost:${port}`);
  console.log(`WebSocket server is running on ws://localhost:${wsPort}`);
});