const http = require("http");
const https = require("https");
const Koa = require("koa");
const app = new Koa();
const IndexRouter = require("./router/index");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session");
const toolFunMiddleware = require("./middleware/tool");
const RoleManager = require("./controller/roleManager");
const swagger = require("./utils/swagger");
const koaSwagger = require("koa2-swagger-ui");

// 配置 session start
app.keys = ["your-session-secret"]; // 用于签名 session ID 的密钥
const CONFIG = {
  key: "koa:sess", // cookie 的 key，默认为 `koa:sess`
  maxAge: 86400000, // session 的有效期，单位为毫秒，默认为 1 天
  overwrite: true, // 是否允许覆盖已存在的 session，默认为 true
  httpOnly: true, // 是否将 session cookie 设置为 httpOnly，默认为 true
  signed: true, // 是否签名 session cookie，默认为 true
  rolling: false,
  renew: false,
};
app.use(session(CONFIG, app));

// 配置 session end
// 使用 body parser 中间件
app.use(bodyParser());
app.use(toolFunMiddleware.getParams);

// 初始化权限和角色管理器
const roleManager = RoleManager.getInstance();
roleManager
  .init()
  .then(() => {
    console.log("Roles and permissions initialized successfully");
  })
  .catch((err) => {
    console.error("Failed to initialize roles and permissions:", err);
  });

// 使用 Swagger 路由
app.use(swagger.routes(), swagger.allowedMethods());

// 使用 koa2-swagger-ui
app.use(
  koaSwagger.koaSwagger({
    routePrefix: "/swagger", // host at /swagger instead of default /docs
    swaggerOptions: {
      url: "/swagger.json", // example path to json 其实就是之后swagger-jsdoc生成的文档地址
    },
  })
);

// 使用主路由
app.use(IndexRouter.routes());
app.use(IndexRouter.allowedMethods());

// 启动 HTTP 和 HTTPS 服务器
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
