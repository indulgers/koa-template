import * as dotenv from 'dotenv';
import { User } from '../entity/user';
import { DataSourceOptions } from 'typeorm';
dotenv.config();

const config = {
  port: process.env.PORT || 3000,

};
const db:DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "koa",
  entities: [
    User
  ],
  migrations: [],
  subscribers: [],
  driver: require("mysql2"),

}
export {
  config,
  db
};