import {ApiRouteInit} from '../../../lib/1up'

export const { GET, POST, PATCH, PUT, DELETE } = await (async () => {
  const routes = await ApiRouteInit();
  return routes;
})();