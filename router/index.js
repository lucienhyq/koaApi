const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const userAdmin = require("../controller/user/index");
const { checkAuthorizationHeader } = require("../middleware/auth");
// router.get("/", async (ctx, next) => {
//   console.log("ctx.request.params:", ctx.request.params);
//   ctx.body = "Hello World1";
// });
// router.post("/", async (ctx, next) => {
//   console.log("ctx.request.params:", ctx.request.params);
//   ctx.body = "Hello World1";
// });

// 添加会员
router.get("/add/user", checkLogin.check, userAdmin.checkUser, userAdmin.add);
// 删除会员
router.delete(
  "/delete/user",
  userAdmin.checkUser,
  userAdmin.deleteUser
);
// 修改会员信息
router.post(
  "/update/user",
  userAdmin.checkUser,
  userAdmin.updateUser
);
// 登录
router.post("/login", checkAuthorizationHeader, userAdmin.login);

module.exports = router;
