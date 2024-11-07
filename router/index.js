const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const userAdmin = require("../controller/user/index");
const { checkAuthorizationHeader } = require("../middleware/auth");
const homeWorkRouter = require("./homeWork");

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
router.get("/login", checkAuthorizationHeader, userAdmin.login);
// 注册
router.get("/register", userAdmin.register);
// 退出登录
router.get(
  "/loginOut",
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
// 获取当前管理员 权限

// 将 homeWork 路由挂载到 /homeWork 下
router.use("/homeWork", homeWorkRouter.routes(), homeWorkRouter.allowedMethods());

module.exports = router;
