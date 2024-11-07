const {
  homeWorkMaid_Model,
  AgencySchema_Model,
} = require("../../model/homeWorkMaid");
const { Admin, Role } = require("../../model/UserAdmin");
const toolFunMiddleware = require("../../middleware/tool");
const { db } = require("../../model/db");
class homeWork {
  //普通用户申请做家政阿姨
  addHomeWorkMaid = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message };
        return;
      }
      const {
        real_name,
        id_card,
        address,
        phone,
        age,
        education,
        education_certificate,
        work_type,
      } = ctx.request.paramsObj;
      const adminResult = await Admin.findOne({
        _id: ctx.session.userId,
      });
      const findHomeWorkMaid = await homeWorkMaid_Model
        .findOne({
          adminId: adminResult._id,
        })
        .populate({
          path: "adminId",
          select: "-_id id roleGrade avatar",
        });
      if (findHomeWorkMaid) {
        ctx.body = {
          result: 1,
          msg: findHomeWorkMaid.audit_status ? "该申请已通过" : "待审核",
        };
        return;
      }
      const homeWorkMaidCreate = await homeWorkMaid_Model.create({
        real_name,
        id_card,
        address,
        phone,
        age,
        education,
        education_certificate,
        work_type,
        adminId: adminResult._id,
      });
      ctx.body = {
        msg: "创建成功",
        data: [],
        result: 1,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.body = {
        msg: "服务器错误" + error,
      };
    }
  };
  //普通用户申请做家政代理
  homeWorkAgency = async (ctx, next) => {
    const adminResult = await Admin.findOne({
      _id: ctx.session.userId,
    });
    try {
      const AgencySchemaResult = await AgencySchema_Model.findOne({
        adminId: adminResult._id,
      });
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        [
          "phone",
          "agencyName",
          "register_address",
          "business_license",
          "id_card",
          "phone",
        ]
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      if (AgencySchemaResult) {
        ctx.body = {
          msg: AgencySchemaResult.audit_status
            ? "你已经是家政代理"
            : "代理申请审核中",
        };
        return;
      }
      let { agencyName, register_address, business_license, id_card, phone } =
        ctx.request.paramsObj;
      const AgencySchema_Model_result = await AgencySchema_Model.create({
        agencyName,
        register_address,
        business_license,
        id_card,
        phone,
        adminId: adminResult._id,
      });
      if (!AgencySchema_Model_result) {
        throw new Error("创建失败");
      }
      // // 注释掉，应该到审核中，等审核通过才修改用户角色
      // // 获取代理的角色_id
      // const RoleResult = await Role.findOne({
      //   Level: "2",
      // });
      // if (AgencySchema_Model_result) {
      //   // 注册成功后改用户的角色
      //   const adminUpdate = await Admin.findOneAndUpdate(
      //     { _id: adminResult._id },
      //     { $set: { roleGrade: 2, roles: RoleResult._id } }
      //   );
      //   console.log("=====homeWorkAgency", adminUpdate);
      // }
      ctx.body = {
        msg: "success",
        data: AgencySchema_Model_result,
        result: 1,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        msg: "err:" + error,
        data: [],
      };
    }
  };
  //后台 家政代理审核列表
  getAgencyAuditList = async (ctx, next) => {
    let { valid, message } = toolFunMiddleware.checkRouterParams(
      ctx.request.paramsObj
    );
    if (!valid) {
      // 参数校验不通过：返回前端提示
      ctx.status = 400;
      ctx.body = { message, result: 0 };
      return;
    }
  };
}
module.exports = new homeWork();
