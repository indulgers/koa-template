import HomeController from './controller/home-controller';
export type Route = {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  action: any;
};

const Routes: Route[] = [
  {
    path: '/',
    method: 'get',
    action: HomeController.user
  },
  // {
  //   path: '/user',
  //   method: 'get',
  //   action: HomeController.user
  // }
];

export default Routes;
