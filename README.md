# worker-router
router for cloudflare worker using path-to-regexp

# usage
```
const Router = require('@komino/worker-router');
const r = new Router();
r.on('GET', '/', async request => new Response('Hello world'));

//or using short hands
r.get('/user/:id/:action', async request => new Response(`user ${request.params.id}, ${request.params.action}`));
```

# example
```
//cloudflare worker event listener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

//import package
const Router = require('@komino/worker-router');
async function handleRequest(request) {
  //tips: capture error for debugging.
  try{
    //create router
    const r = new Router();
    //create route
    r.on('GET', '/', async request => new Response('Hello world'));

    //create route using shorthand
    r.get('/user/:id/:action', async request => new Response(`user ${request.params.id}, ${request.params.action}`));

    //router lookup matching the request URL, then run the given handler. 
    return await r.lookup(request);
  } catch(err) {
    return new Response(err.stack || err);
  }
}

```

### Default handler
When no route can be matched, default handler will be used.

To override default router, initialise router with defaultHandler as option object.

```const r = new Router({defaultHandler : request => new Response('Oops, no route matched')});``` 
