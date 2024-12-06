import { Context } from 'koa';
import { getManager } from 'typeorm';
import{ User} from '../entity/user';
import { v4 as uuidv4 } from 'uuid';
export default class HomeService {
  static async hello(context?: Context) {
    const userRepository = getManager().getRepository(User);  
    const newCategory = userRepository.create({
      username: 'test',
      password: '123456',
      id: uuidv4(),
    });

    await userRepository.save(newCategory);

    return userRepository.find();
  }
}
