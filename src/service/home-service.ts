import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../config/data-source';
import { ResultData } from '../common/result';
export default class HomeService {
  static async hello(context?: Context) {
    const newCategory = UserRepository.create({
      username: 'test',
      password: '123456',
      id: uuidv4(),
    });

    await UserRepository.save(newCategory);

    return ResultData.success(await UserRepository.find());
  }
}
