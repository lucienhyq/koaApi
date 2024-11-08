const Router = require('koa-router'); // 引入路由模块
const router = new Router(); // 使用 new 关键字实例化 Router

const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
  info: {
    title: "个人网站api接口文档",
    version: "1.0.0",
    description: "API",
  },
  host: "localhost:3000",
  basePath: "/", // Base path (optional)
};
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../router/*.js")], // 写有注解的router的存放地址, 最好path.join()
};
const swaggerSpec = swaggerJSDoc(options);
// 通过路由获取生成的注解文件
router.get("/swagger.json", async function (ctx) {
  ctx.set("Content-Type", "application/json");
  ctx.body = swaggerSpec;
});
module.exports = router;