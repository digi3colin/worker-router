const Router = require('../classes/Router');

describe('router', () => {
  test('addRoute', async ()=>{
    const r = new Router();
    r.get('/', req => ({body: 'hello world!!'}));
    const result = await r.lookup({url: 'https://example.com/', method : 'GET'});

    expect(result.body).toBe('hello world!!');
  });

  test('addRoutes', async ()=>{
    const r = new Router({defaultHandler: req => ({body : '404'})});
    r.get('/', req => ({body: 'hello world!!'}));
    r.get('/user/:id', req => ({body: 'Welcome Peter'}));

    let result;

    result = await r.lookup({url: 'http://example.com/', method : 'GET'});
    expect(result.body).toBe('hello world!!');

    result = await r.lookup({url: 'http://example.com/user/1', method : 'GET'});
    expect(result.body).toBe('Welcome Peter');

    result = await r.lookup({url: 'http://example.com/product/1', method : 'GET'});
    expect(result.body).toBe('404');
  })

  test('test route param', async ()=>{
    const r = new Router({defaultHandler: req => ({body : '404'})});
    r.get('/user/:id/:foo', req => ({body: `user ${req.params.id}, ${req.params.foo}`}));

    let result;

    result = await r.lookup({url: 'http://example.com/user/1/bar', method : 'GET'});
    expect(result.body).toBe('user 1, bar');

  })
});