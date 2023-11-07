import {ApiRouteInit} from '../../../lib/1up'

// export const { GET, POST, PATCH, PUT, DELETE } = await (async () => {
//   const routes = await ApiRouteInit();
//   return routes;
// })();
let GET, POST, PATCH, PUT, DELETE;

const initRoutes = async () => {
  const routes = await ApiRouteInit();
  GET = routes.GET;
  POST = routes.POST;
  PATCH = routes.PATCH;
  PUT = routes.PUT;
  DELETE = routes.DELETE;
};

initRoutes();

export { GET, POST, PATCH, PUT, DELETE };