// ./routes/homeWork.js
const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const homeWorkController = require("../controller/homeWork/index");
const { checkAuthorizationHeader } = require("../middleware/auth");

// 添加家政人员

/**
 * @swagger
 * /add/homeWorkMaid:
 *   post:
 *     description: 添加家政人员
 *     tags: [家政模块]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: real_name
 *         description: 用户名.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: id_card
 *         description: 身份证号.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phone
 *         description: 手机号.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: age
 *         description: 年龄.
 *         in: formData
 *         required: true
 *         type: Number
 *       - name: education
 *         description: 学历.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: education_certificate
 *         description: 学历图片路径.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: work_type
 *         description: 兼职0，全职1.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 创建成功.
 *
 */
router.post(
  "/add/homeWorkMaid",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.addHomeWorkMaid
);
// 添加家政代理
/**
 * @swagger
 * /add/homeWorkAgency:
 *   post:
 *     description: 家政代理申请
 *     tags: [家政模块]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: phone
 *         description: 手机号.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: agencyName
 *         description: 代理名称.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: register_address
 *         description: 居住地址.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: business_license
 *         description: 营业执照照片路径.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: id_card
 *         description: 身份证号码.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phone
 *         description: 手机号码.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 创建成功.
 *       500:
 *         description: 参数错误.
 *
 */
router.post(
  "/add/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.homeWorkAgency
);
/**
 * @swagger
 * /list/homeWorkAgency:
 *   get:
 *     description: 家政代理列表
 *     tags: [家政模块]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: adminId
 *         description: 会员id.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: adminName
 *         description: 会员名称.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: agencyName
 *         description: 代理名称.
 *         in: formData
 *         required: false
 *         type: string
 *       - name: page
 *         description: 分页名称.
 *         in: formData
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: 创建成功.
 *       500:
 *         description: 参数错误.
 *
 */
router.get(
  "/list/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAgencyAuditList
);
router.get(
  "/audit/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.auditAgency
);

module.exports = router;
