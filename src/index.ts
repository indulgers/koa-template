import "reflect-metadata";
import Koa from "koa";
import { AppDataSource } from "./config/data-source";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { createServer } from 'http';
import AppRoutes from "./routes";
import { config, db } from "./config";
import { createSocketServer } from './SocketServer';

AppDataSource.initialize();

const init = async () => {
  const router = new Router();
  const port = config.port;
  // create koa app
  const app = new Koa();
  const server = createServer(app.callback())
  // register all application routes
  AppRoutes.forEach((route) => router[route.method](route.path, route.action)
  );

  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());


  createSocketServer({ server });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

init().catch((error) => console.log("TypeORM connection error: ", error));