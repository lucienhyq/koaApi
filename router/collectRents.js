const Router = require("@koa/router");
const router = new Router();
// 检查登录
const checkLogin = require("../middleware/checkLogin");
// 验证token
const { checkAuthorizationHeader } = require("../middleware/auth");
// 房东控制器
const landlord = require("../controller/collectRents_controller/landlord");
const landlordController = new landlord();
// 会员中间件
const UserAdminController = require("../controller/user/index");
// const toolFunMiddleware = require("../middleware/tool");

// 新建房源
router.post(
  "/rentHouseAdd",
  checkAuthorizationHeader,
  checkLogin.check,
  UserAdminController.getAdmin,
  landlordController.authRoot,
  landlordController.rentHouseAdd
);
// 录入当前月电费水费 生成当前房源账单
router.post(
  "/enteringMonthData",
  checkAuthorizationHeader,
  checkLogin.check,
  UserAdminController.getAdmin,
  landlordController.authRoot,
  landlordController.enteringMonthData
);
module.exports = router;
