import { Context } from "koa";
import { routeConfig, z, body, ParsedArgs } from 'koa-swagger-decorator';
export default class DonateController {
    @routeConfig({
        path: '/index',
        method: 'get',
        summary: '首页',    
        tags: ['DONATE'],
    })
    async index(ctx: Context) {
        ctx.body = "Donate page"
    }
}