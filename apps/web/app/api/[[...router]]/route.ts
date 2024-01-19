import { ApiRouteInit } from '../../../lib/router'

export const { GET, POST, PATCH, PUT, DELETE } = await (async () => {
  const routes = await ApiRouteInit();
  return routes;
})();
