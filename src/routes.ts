import HomeController from './controller/home-controller';
import DonateController from './controller/donate-controller';
import { SwaggerRouter } from 'koa-swagger-decorator'

// swagger docs avaliable at http://localhost:3000/swagger-html

const router = new SwaggerRouter({
  spec: {
    info: {
      title: "Example API Server",
      version: "v1.0",
    },
  },
  swaggerHtmlEndpoint: '/swagger-html',
  swaggerJsonEndpoint: '/swagger-json',
});
router.prefix('/api')
// 查找对应目录下的controller类
router.swagger();

// register user defined routes implementation
router
  .applyRoute(DonateController)
  .applyRoute(HomeController);  

export default router
