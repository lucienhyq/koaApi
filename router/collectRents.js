const Router = require("@koa/router");
const router = new Router();
// 检查登录
const checkLogin = require("../middleware/checkLogin");
// 验证token
const { checkAuthorizationHeader } = require("../middleware/auth");
// 会员中间件
const UserAdmin = require("../controller/user/index");
// 房东控制器
const landlord = require("../controller/collectRents_controller/landlord");
const landlordController = new landlord();
// landlord 房东 renter 租客
/**
 * @api {post} /collectRent/applyLandlord 申请成为房东
 * 
 * 检查是否登录 -> 传递用户id,门牌地址,层数,设置可出租房号 -> 创建房东申请 (待审核，审核中，审核失败，审核成功) -> 申请通过保存到landlord集合 -> 返回结果
 */
router.post(
  "/landlord/apply",
  checkAuthorizationHeader,
  checkLogin.check,
  UserAdmin.getAdmin,
  landlordController.apply,
);
/**
 * 审核房东申请
 */
router.get(
  "/landlord/audit",
  checkAuthorizationHeader,
  checkLogin.check,
  UserAdmin.getAdmin,
  landlordController.audit,
);
// 查看房东列表
router.get(
  "/landlord/list",
  checkAuthorizationHeader,
  checkLogin.check,
  UserAdmin.getAdmin,
  landlordController.checkUserRoles,
  landlordController.list,
);



module.exports = router;
