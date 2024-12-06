import 'reflect-metadata';
import { User } from '../entity/user';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root', // 数据库账号
  password: '123456', // 数据库密码
  database: 'koa', // 数据库名称
  synchronize: true,
  logging: false,
  driver: require("mysql2"),
  entities: [
    User
  ],
  migrations: [],
  subscribers: [],
});

export const UserRepository = AppDataSource.getRepository(User);

