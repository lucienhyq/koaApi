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
router.get(
  "/add/user",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.checkUser,
  userAdmin.add
);
// 删除会员
router.delete(
  "/delete/user",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.checkUser,
  userAdmin.deleteUser
);
// 更新会员信息
router.post(
  "/update/user",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.checkUser,
  userAdmin.updateUser
);
// 查询会员信息
router.get(
  "/find/user",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.checkUser,
  userAdmin.findOneUser
);
// 登录
router.post("/login", checkAuthorizationHeader, userAdmin.login);
// 退出登录
router.get(
  "/loginOut",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.loginOut
);
// 充值余额
router.post(
  "/balance/add",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.addBalance
);
// 查找订单记录
router.post(
  "/orderRecord",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.orderRecord
);
module.exports = router;
