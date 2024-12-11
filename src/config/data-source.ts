import 'reflect-metadata';
import { User } from '../entity/user';
import { DataSource } from 'typeorm';
import { db } from './index';
export const AppDataSource = new DataSource(db);

export const UserRepository = AppDataSource.getRepository(User);

