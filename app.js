const http = require('http');
const https = require('https');
const Koa = require('koa');
const app = new Koa();
const IndexRouter = require('./router/index');
app.use(IndexRouter.routes());
app.use(IndexRouter.allowedMethods());
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);