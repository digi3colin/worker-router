/**
 * Copyright (c) 2020 Colin Leung (Komino)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const REQUEST_METHOD = {
  CONNECT : 'CONNECT',
  DELETE : 'DELETE',
  GET : 'GET',
  HEAD : 'HEAD',
  OPTIONS : 'OPTIONS',
  PATCH : 'PATCH',
  POST : 'POST',
  PUT : 'PUT',
  TRACE : 'TRACE'
};

const { pathToRegexp } = require("path-to-regexp");

class Router {
  constructor(options = {}) {
    this.defaultHandler = options.defaultHandler ||
      (request => new Response('Not found.', {status : 404}));
    //create routes.GET , routes.POST, routes.PUT ... etc
    //each routes have static route, store as object, and route with parameter, store as array
    this.routes = {};
    Object.keys(REQUEST_METHOD).forEach(x => {
      this.routes[x] = [{},[]];
    })
  }

  on(method, path, handler){
    const isStaticPath = !(/\:|\*/.test(path));
    if(isStaticPath) {
      //add to static route
      this.routes[method][0][path] = handler;
      return;
    }

    //add to route with parameter
    const keys = [];
    const re = pathToRegexp(path, keys);
    this.routes[method][1].push({re: re, keys:keys, path:path, handler: handler});
  }

  //shorthands
  get(path, handler){
    this.on(REQUEST_METHOD.GET, path, handler);
  }

  post(path, handler){
    this.on(REQUEST_METHOD.POST, path, handler);
  }

  put(path, handler){
    this.on(REQUEST_METHOD.PUT, path, handler);
  }

  delete(path, handler){
    this.on(REQUEST_METHOD.DELETE, path, handler);
  }

  async lookup(request){
    //append params to request.
    request.params = request.params || {};
    if(!request.params){
      throw new Error('Router: Request cannot add params.');
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    //matching route,
    //path match static routes
    if(!!this.routes[method][0][path]){
      //return the response
      return await this.routes[method][0][path](request);
    }

    //check parametric routes
    //loop each route, test with regexp
    const routes = this.routes[method][1];
    for(let i = 0; i < routes.length; i++){
      const route = routes[i];

      if(route.re.test(path)){
        //extract params from path
        const values = route.re.exec(path);

        //inject request.params
        route.keys.forEach((x, i) => {
          if(x.name ==='__proto__' || x.name === 'prototype' || x.name === 'constructor')throw new Error(`Invalid key: ${x.name}`);
          request.params[ x.name ] = values[ i + 1 ];
        });

        //return the response
        return await route.handler(request);
      }
    }

    //no matched route, use default handler
    return this.defaultHandler(request);
  }
}
Router.REQUEST_METHOD = REQUEST_METHOD;

Object.freeze(Router);
Object.freeze(Router.prototype);
module.exports = Router;