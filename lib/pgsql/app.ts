// src/app.ts
import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

// 中间件
app.use(cors());
app.use(bodyParser());

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || "Internal Server Error",
    };
    console.error("Error:", err);
  }
});

// 健康检查
router.get("/health", (ctx) => {
  ctx.body = { status: "ok", timestamp: new Date().toISOString() };
});

// 用户相关路由
router.get("/users", async (ctx) => {
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  ctx.body = users;
});

router.post("/users", async (ctx) => {
  const { email, name } = ctx.request.body as { email: string; name?: string };

  if (!email) {
    ctx.status = 400;
    ctx.body = { error: "Email is required" };
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  ctx.body = user;
});

router.get("/users/:id", async (ctx) => {
  const { id } = ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: true,
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  ctx.body = user;
});

router.put("/users/:id", async (ctx) => {
  const { id } = ctx.params;
  const { name, email } = ctx.request.body as { name?: string; email?: string };

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
  });

  ctx.body = user;
});

router.delete("/users/:id", async (ctx) => {
  const { id } = ctx.params;

  await prisma.user.delete({
    where: { id },
  });

  ctx.body = { message: "User deleted successfully" };
});

// 文章相关路由
router.get("/posts", async (ctx) => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  ctx.body = posts;
});

router.post("/posts", async (ctx) => {
  const { title, content, authorId, published } = ctx.request.body as {
    title: string;
    content?: string;
    authorId: string;
    published?: boolean;
  };

  if (!title || !authorId) {
    ctx.status = 400;
    ctx.body = { error: "Title and authorId are required" };
    return;
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId,
      published: published || false,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  ctx.body = post;
});

router.get("/posts/:id", async (ctx) => {
  const { id } = ctx.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    ctx.status = 404;
    ctx.body = { error: "Post not found" };
    return;
  }

  ctx.body = post;
});

router.put("/posts/:id", async (ctx) => {
  const { id } = ctx.params;
  const { title, content, published } = ctx.request.body as {
    title?: string;
    content?: string;
    published?: boolean;
  };

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      ...(published !== undefined && { published }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  ctx.body = post;
});

router.delete("/posts/:id", async (ctx) => {
  const { id } = ctx.params;

  await prisma.post.delete({
    where: { id },
  });

  ctx.body = { message: "Post deleted successfully" };
});

// 应用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/users`);
  console.log(`📝 Posts API: http://localhost:${PORT}/posts`);
});
