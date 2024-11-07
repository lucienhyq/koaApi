// ./routes/homeWork.js
const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const homeWorkController = require("../controller/homeWork/index");
const { checkAuthorizationHeader } = require("../middleware/auth");

// 添加家政人员
router.post(
  "/add/homeWorkMaid",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.addHomeWorkMaid
);
// 添加家政代理
router.post(
  "/add/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.homeWorkAgency
);


module.exports = router;