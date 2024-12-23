const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const userAdmin = require("../controller/user/index");
const { checkAuthorizationHeader } = require("../middleware/auth");
const homeWorkRouter = require("./homeWork");
const collectRentsRouter = require("./collectRents");

/**
 * @swagger
 * /add/user:
 *   get:
 *     summary: 添加会员
 *     description: 通过手机号和密码添加新的会员。
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: 会员的手机号。
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: 会员的密码。
 *     responses:
 *       '200':
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 1
 *                 msg:
 *                   type: string
 *                   example: "添加成功"
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 0
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: string
 *                   example: ""
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 0
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: string
 *                   example: ""
 */
router.get(
  "/add/user",
  checkAuthorizationHeader,
  checkLogin.check,
  userAdmin.checkUser,
  userAdmin.add
);
/**
 * @swagger
 * /delete/user/{phone}:
 *   delete:
 *     summary: 删除会员
 *     description: 通过手机号删除指定的会员。
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: 会员的手机号。
 *     responses:
 *       '200':
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 1
 *                 msg:
 *                   type: string
 *                   example: "删除成功"
 *                 data:
 *                   type: object
 *                   example: {}
 *       '400':
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 0
 *                 msg:
 *                   type: string
 *                   example: "删除失败，不存在该会员"
 *                 data:
 *                   type: string
 *                   example: ""
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: integer
 *                   example: 0
 *                 msg:
 *                   type: string
 *                   example: "删除失败"
 *                 data:
 *                   type: object
 *                   example: {}
 */
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
router.get("/loginOut", userAdmin.loginOut);
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
router.use(
  "/homeWork",
  homeWorkRouter.routes(),
  homeWorkRouter.allowedMethods()
);
router.use(
  "/collectRent",
  collectRentsRouter.routes(),
  collectRentsRouter.allowedMethods()
);

module.exports = router;
