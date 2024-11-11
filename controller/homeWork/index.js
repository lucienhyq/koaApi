const {
  homeWorkMaid_Model,
  AgencySchema_Model,
} = require("../../model/homeWorkMaid");
const { Admin, Role } = require("../../model/UserAdmin");
const toolFunMiddleware = require("../../middleware/tool");
 
// 连接字符串，确保包含所有副本集成员
const mongoose = require('mongoose');
const uri =
  "mongodb://127.0.0.1:27018/dev?replicaSet=rs0";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
class homeWork {
  controller() {}
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
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      // adminId 会员id
      // adminName 会员名称
      // agencyName 代理名称
      let { page = 1, agencyName, adminName, adminId } = ctx.request.paramsObj;
      const pageSize = 15;
      let skipCount = (page - 1) * pageSize;
      // 会员信息
      let adminResult;
      // 家政代理表的查询条件
      let querySearch = {};
      // 使用会员id查找
      if (adminId || adminName) {
        adminResult = await Admin.findOne({
          $or: [{ id: adminId }, { username: adminName }],
        });
      }
      if (agencyName) {
        querySearch.$and.push({
          adminId: adminResult._id,
          agencyName: agencyName,
        });
      }
      const AgencySchemaResult = await AgencySchema_Model.find(querySearch)
        .populate({
          path: "adminId",
          select: "id username phone roleGrade -_id",
        })
        .select("-__v")
        .skip(skipCount)
        .limit(pageSize);
      ctx.body = {
        msg: "success",
        data: AgencySchemaResult,
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

  // 后台 家政代理审核
  auditAgency = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        ["id"]
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      let { id } = ctx.request.paramsObj;

      // 获取当前登录人员信息
      const userInfo = await Admin.findOne({
        _id: ctx.session.userId,
      });
      if (userInfo.roleGrade != 1) {
        throw new Error("权限不足");
      }

      // 开始事务
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 代理信息
        const AgencyResult = await AgencySchema_Model.findOne({
          id: id,
        }).populate('adminId').session(session);
        if (!AgencyResult) {
          throw new Error("代理信息不存在");
        }

        // 获取当前代理的用户信息
        console.log(AgencyResult.adminId.id,'ddddddddd')
        const adminAgencyResult = await Admin.findOne({
          id: AgencyResult.adminId.id,
        }).session(session);
        console.log('dwwwww',adminAgencyResult)
        if (!adminAgencyResult) {
          throw new Error("代理用户信息不存在");
        }

        // 获取代理的角色_id
        const RoleResult = await Role.findOne({
          Level: "2",
        }).session(session);
        if (!RoleResult) {
          throw new Error("角色信息不存在");
        }

        // 更新代理信息
        const AgencyUpdateResult = await AgencySchema_Model.findOneAndUpdate(
          { id: id },
          { $set: { audit_status: true } },
          { new: true }
        ).session(session);
        if (!AgencyUpdateResult) {
          throw new Error("更新代理信息失败");
        }
        console.log('ssssssssss')
        // 更新用户信息
        const adminAgencyUpdateResult = await Admin.findOneAndUpdate(
          { _id: adminAgencyResult._id },
          { $set: { roles: RoleResult._id } },
          { new: true }
        ).session(session);
        if (!adminAgencyUpdateResult) {
          throw new Error("更新用户信息失败");
        }

        // 提交事务
        await session.commitTransaction();
        session.endSession();

        ctx.body = {
          result: 1,
          data: [],
          message: "修改成功",
        };
      } catch (error) {
        // 回滚事务
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        message: error.message,
      };
    }
  };
}
module.exports = new homeWork();
