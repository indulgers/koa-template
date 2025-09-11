import "reflect-metadata";
import Koa from "koa";
import { AppDataSource } from "./config/data-source";
import { config } from "./config";
import router from "./routes";
import bodyParser from "koa-bodyparser";
import { createServer } from "http";
import cors from "@koa/cors";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
// 初始化数据源
AppDataSource.initialize().then(() => {
  const port = config.port;

  // 创建 Koa 应用
  const app = new Koa();
  // 中间件
  app.use(cors());
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  const server = createServer(app.callback()); // 将 Koa 应用绑定到 HTTP 服务器

  // 配置 Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const chatUsers: string[] = [];
  // Socket.IO 事件逻辑
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // 用户登录
    socket.on("login", (msg) => {
      const { user } = msg;
      if (chatUsers.includes(user)) {
        socket.emit("respond", {
          user: "🏡系统",
          content: `😥对不起：${user} 昵称已存在！`,
        });
      } else {
        chatUsers.push(user);
        socket.emit("respond", {
          user: "🏡系统",
          content: `🔊嗨：${user} 欢迎你进入聊天室！`,
        });
        io.emit("users", { users: chatUsers });
      }
    });

    // 接收消息
    socket.on("message", (msg: any) => {
      console.log(`Message received: ${msg.content}`);
      socket.emit("respond", {
        user: msg.user,
        content: msg.content,
      });
      socket.broadcast.emit("respond", {
        user: msg.user,
        content: msg.content,
      });
    });

    // 用户断开连接
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
    socket.on("error", (error) => {
      console.error(`Socket error: ${error}`);
    });
  });

  // 启动服务器
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
