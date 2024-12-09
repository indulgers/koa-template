import "reflect-metadata";
import Koa from "koa";
import { AppDataSource } from "./config/data-source";
import Router from "koa-router";
import router from "./routes";
import bodyParser from "koa-bodyparser";
import { createServer } from 'http';
import AppRoutes from "./routes";
import cors from "@koa/cors";
import { config, db } from "./config";
import { createSocketServer } from './SocketServer';


AppDataSource.initialize().then(() => {

    const port = config.port;
    // create koa app
    const app = new Koa();
    const server = createServer(app.callback())
  
    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(cors());
    createSocketServer({ server });
  
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    
});


