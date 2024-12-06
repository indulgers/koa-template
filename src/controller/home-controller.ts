import HomeService from '../service/home-service';
import { Context } from 'koa';
export default class HomeController {
  static async user(ctx:Context  ) {
    ctx.body = await HomeService.hello();
  }
  
}
