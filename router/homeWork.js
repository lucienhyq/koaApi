// ./routes/homeWork.js
const Router = require("@koa/router");
const router = new Router();
const checkLogin = require("../middleware/checkLogin");
const homeWorkController = require("../controller/homeWork/index");
const { checkAuthorizationHeader } = require("../middleware/auth");
/**
 * @swagger
 * definitions:
 *   homeWorkAgency:
 *     required:
 *       - id
 *       - adminId
 *     properties:
 *       id:
 *         type: string
 *         example: '321'
 *       adminId:
 *         type: object
 *         properties:
 *           id:
 *             type: number
 *             example: 1
 *           username:
 *             type: string
 *             example: 1
 *           phone:
 *             type: string
 *             example: 1
 *           roleGrade:
 *             type: number
 *             example: 0
 *       agencyName:
 *         type: string
 *         example: '代理名称'
 *       register_address:
 *         type: string
 *         example: '注册地址'
 *       business_license:
 *         type: string
 *         example: '营业执照图片路径'
 *       id_card:
 *         type: string
 *         example: '身份证号码'
 *       phone:
 *         type: string
 *         example: '联系电话'
 *       audit_status:
 *         type: string
 *         example: '审核状态'
 */
/**
 * @swagger
 * definitions:
 *   Fail:
 *     required:
 *       - result
 *       - message
 *     properties:
 *       result:
 *         type: number
 *         description: 0
 *       message:
 *         type: string
 *         description: 失败
 *         example: '参数错误'
 */

//普通用户申请做家政阿姨
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
 */
router.post(
  "/add/homeWorkMaid",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAdmin,
  homeWorkController.addHomeWorkMaid
);
//普通用户申请做家政代理
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
 *         schema:
 *           type: object
 *           $ref: '#/definitions/homeWorkAgency'
 *       400:
 *         description: 创建失败.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Fail'
 *       500:
 *         description: 服务器错误
 *
 */
router.post(
  "/add/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAdmin,
  homeWorkController.homeWorkAgency
);
//家政代理列表
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
 *         schema:
 *           type: object
 *           $ref: '#/definitions/homeWorkAgency'
 *       500:
 *         description: 服务器错误.
 */
router.get(
  "/list/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAgencyAuditList
);
// 后台 家政代理审核
/**
 * @swagger
 * /audit/homeWorkAgency:
 *   get:
 *     description: 家政代理审核
 *     tags: [家政模块]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: 修改的会员id.
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: 创建成功.
 *         schema:
 *           type: object
 *           properties:
 *             result:
 *               type: number
 *               example: 1
 *             data:
 *               type: array
 *               example: []
 *             msg:
 *               type: string
 *               example: 修改成功
 *       404:
 *          schema:
 *            type: object
 *            $ref: '#/definitions/Fail'
 *       500:
 *         description: 服务器错误.
 */
router.get(
  "/audit/homeWorkAgency",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAdmin,
  homeWorkController.auditAgency
);
// 查看 家政阿姨列表
/**
 * @swagger
 * /maidList/homeWorkAgency:
 *   get:
 *     description: 获取家政阿姨列表
 *     tags: [家政模块]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: page
 *         description: 页码.
 *         type: number
 *       - name: id
 *         description: 家政阿姨ID.
 *         type: string
 *       - name: agencyID
 *         description: 代理objecid.
 *         type: string
 *       - name: age
 *         description: 年龄.
 *         type: number
 *       - name: sex
 *         description: 性别.
 *         type: number
 *       - name: isAgen
 *         description: 是否代理只查看下属家政阿姨.
 *         type: boolean
 *     responses:
 *       200:
 *         description: 创建成功.
 *         schema:
 *           type: object
 *           properties:
 *             result:
 *               type: number
 *               example: 1
 *             currentPage:
 *               type: object
 *               example: 1
 *             data:
 *               type: object
 *               properties:
 *                 id:
 *                   type: object
 *                   example: 1
 *                 real_name:
 *                   type: string
 *                   example: 姓名
 *             msg:
 *               type: string
 *               example: 修改成功
 *       404:
 *          schema:
 *            type: object
 *            $ref: '#/definitions/Fail'
 *       500:
 *         description: 服务器错误.
 */
router.get(
  "/maidList/homeWork",
  checkAuthorizationHeader,
  checkLogin.check,
  homeWorkController.getAdmin,
  homeWorkController.maidList
);


module.exports = router;
