const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const userAdmin = require("../controller/user/index");
router.get("/", checkLogin.check, async (ctx, next) => {
  ctx.body = "Hello World1";
});
router.get("/add/user", userAdmin.add);
module.exports = router;
