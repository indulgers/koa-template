import { Context } from 'koa';
import {DataSource } from 'typeorm';
import{ User} from '../entity/user';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../config/data-source';
export default class HomeService {
  static async hello(context?: Context) {
    const newCategory = UserRepository.create({
      username: 'test',
      password: '123456',
      id: uuidv4(),
    });

    await UserRepository.save(newCategory);

    return UserRepository.find();
  }
}
