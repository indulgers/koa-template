# ts-koa-starter

一个简单的 Koa + TypeScript + TypeORM 的起手式项目。

## 目录

- [简介](#简介)
- [安装](#安装)
- [配置](#配置)
- [运行](#运行)
- [项目结构](#项目结构)
- [贡献](#贡献)
- [许可证](#许可证)

## 简介

这个项目是一个使用 Koa 框架、TypeScript 和 TypeORM 的基础项目模板，旨在帮助开发者快速启动一个新的项目。

## 安装

1. 克隆仓库：

   ```sh
   git clone https://github.com/your-username/ts-koa-starter.git
   cd ts-koa-starter
   ```

2. 安装依赖：

   ```sh
   npm install
   ```

 配置

 1. 在 `.env` 文件中配置数据库连接信息：

    ```
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    DB_DATABASE=your_database
    ```

2. 在 `src/config/index.ts` 文件中配置其他配置项。

运行

1. 启动开发服务器：(nodemon 启动)

   ```sh
   npm run start
   ```
2. 构建并启动生产服务器：

   ```sh
   npm run build
   npm run start:prod
   ```
3. 停止服务器：

   ```sh
   npm run stop
   ```

项目结构

```
.
ts-koa-starter/
├── src/
│   ├── config/
│   │   ├── data-source.ts
│   │   └── [index.ts](http://_vscodecontentref_/0)
│   ├── entity/
│   │   └── user.ts
│   ├── routes.ts
│   ├── SocketServer.ts
│   └── [index.ts](http://_vscodecontentref_/1)
├── .env
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 贡献

欢迎提交 Issue 和 Pull Request。

 许可证
 ---

[MIT](URL_ADDRESS)

