import HomeService from '../service/home-service';
import { Context } from 'koa';
import { routeConfig, z, body, ParsedArgs } from 'koa-swagger-decorator';
export default class HomeController {
  @routeConfig({
    path: '/',
    method: 'get',
    summary: 'hello world',
    tags: ['HOME'],
  })
    async user(ctx:Context  ) {
    ctx.body = await HomeService.hello();
  }

}
