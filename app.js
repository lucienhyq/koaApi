const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();
const IndexRouter = require("./router/index");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session");
const toolFunMiddleware = require("./middleware/tool");
// 配置 session start
app.keys = ["your-session-secret"]; // 用于签名 session ID 的密钥
const CONFIG = {
  key: "koa:sess", // cookie 的 key，默认为 `koa:sess`
  maxAge: 86400000, // session 的有效期，单位为毫秒，默认为 1 天
  overwrite: true, // 是否允许覆盖已存在的 session，默认为 true
  httpOnly: true, // 是否将 session cookie 设置为 httpOnly，默认为 true
  signed: true, // 是否签名 session cookie，默认为 true
  rolling: false, // 是否每次响应时都重新设置 session cookie，默认为 false
  renew: false, // 是否在 session 即将过期时自动续期，默认为 false
};
app.use(session(CONFIG, app));
// 配置 session end
// 使用 body parser 中间件
app.use(bodyParser());
app.use(toolFunMiddleware.getParams);
app.use(IndexRouter.routes());
app.use(IndexRouter.allowedMethods());
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
