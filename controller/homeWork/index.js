const {
  homeWorkMaid_Model,
  AgencySchema_Model,
} = require("../../model/homeWorkMaid");
const { Admin, Role } = require("../../model/UserAdmin");
const toolFunMiddleware = require("../../middleware/tool");
const Joi = require("joi");
// 连接副本集进行事务提交
const mongoose = require("mongoose");
const uri = "mongodb://127.0.0.1:27018/dev?replicaSet=rs0";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
class homeWork {
  controller() {}
  getAdmin = async (ctx, next) => {
    // 获取登录用户信息和代理信息
    try {
      const adminResult = await Admin.findOne({
        _id: ctx.session.userId,
      }).populate("roles");
      ctx.state.adminResult = adminResult;
      const agencyResult = await AgencySchema_Model.findOne({
        adminId: ctx.session.userId,
      });
      ctx.state.agencyResult = agencyResult;
      await next();
    } catch (error) {
      ctx.body = {
        msg: "获取用户信息失败" + error,
        data: [],
        result: 0,
      };
    }
  };
  //普通用户申请做家政阿姨
  addHomeWorkMaid = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          real_name: Joi.string().required(),
          id_card: Joi.string().required(),
          address: Joi.string().required(),
          phone: Joi.string().required(),
          age: Joi.number().required(),
          education: Joi.string().required(),
          education_certificate: Joi.string().required(),
          work_type: Joi.number(),
        })
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
      const adminResult = ctx.state.adminResult;
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
    const adminResult = ctx.state.adminResult;
    try {
      const AgencySchemaResult = await AgencySchema_Model.findOne({
        adminId: adminResult._id,
      });
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          agencyName: Joi.string().required(),
          register_address: Joi.string().required(),
          business_license: Joi.string().required(),
          id_card: Joi.string().required(),
          phone: Joi.string().required(),
        })
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
    const adminResult = ctx.state.adminResult;
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          id: Joi.string().required(),
        })
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      let { id } = ctx.request.paramsObj;
      if (adminResult.roleGrade != 1) {
        throw new Error("权限不足");
      }

      // 开始事务
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 需要更改审核的列表代理信息
        const AgencyResult = await AgencySchema_Model.findOne({
          id: id,
        })
          .populate("adminId")
          .session(session);
        if (!AgencyResult) {
          throw new Error("代理信息不存在");
        }

        // 获取当前代理的用户信息
        const adminAgencyResult = await Admin.findOne({
          id: AgencyResult.adminId.id,
        }).session(session);
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
        // 更新用户信息
        if (adminAgencyResult.roleGrade != 1) {
          //如果当前代理是管理员，则不用更新roles和roleGrade
          const adminAgencyUpdateResult = await Admin.findOneAndUpdate(
            { _id: adminAgencyResult._id },
            { $set: { roles: RoleResult._id } },
            { new: true }
          ).session(session);
          if (!adminAgencyUpdateResult) {
            throw new Error("更新用户信息失败");
          }
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
        result: 0,
        data: [],
      };
    }
  };
  // 后台 家政阿姨列表
  maidList = async (ctx, next) => {
    try {
      // const adminResult = ctx.state.adminResult;
      const agencyResult = ctx.state.agencyResult;
      console.log(ctx.state);
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          id: Joi.string(),
          agencyID: Joi.string(),
          age: Joi.number(),
          sex: Joi.number(),
          page: Joi.number(),
          isAgen: Joi.boolean(),
        })
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      let { page = 1, id, agencyID, age, sex, isAgen } = ctx.request.paramsObj;
      let querySearch = {
        $or: [],
      };
      const pageSize = 15;
      let skipCount = (page - 1) * pageSize;
      if (id) {
        querySearch.$or.push({ id: id });
      }
      if (age) {
        querySearch.$or.push({ age: age });
      }
      if (sex) {
        querySearch.$or.push({ sex: sex });
      }
      if (querySearch.$or.length === 0) {
        querySearch = {};
      }
      if (isAgen) {
        // 带这个传参说明是代理查看下属阿姨
        if (!agencyResult) {
          throw new Error("代理信息不存在");
        }
        querySearch.$and = [];
        querySearch.$and.push({
          agencyID: String(agencyResult.adminId),
        });
      } else {
        if (agencyID) {
          querySearch.$or.push({ agencyID: agencyID });
        }
      }
      // 查找 homeWorkMaid 表的数据
      const findMaid = await homeWorkMaid_Model
        .find(querySearch)
        .populate({
          path: "adminId",
          select: "-_id id roleGrade avatar",
        })
        .select("-__v")
        .skip(skipCount)
        .limit(pageSize);
      // 将 Mongoose 文档转换为普通 JavaScript 对象
      const maidArray =
        findMaid.length > 0 ? findMaid.map((maid) => maid.toObject()) : [];
      if (maidArray.length > 0) {
        // 处理查询结果，添加 audit_status_txt 字段
        maidArray.forEach((maid) => {
          maid.audit_status_txt = maid.audit_status ? "已审核" : "审核中";
        });
      }
      ctx.body = {
        message: "success",
        result: 1,
        data: {
          currentPage: page,
          data: maidArray,
        },
      };
    } catch (error) {
      ctx.response.status = 200;
      ctx.body = {
        msg: String(error),
        result: 0,
        data: [],
      };
    }
  };
  // 代理中心绑定家政阿姨员工 agencyResult代理信息 当前登录信息adminResult
  agencyBindMaid = async (ctx, next) => {
    let { adminResult, agencyResult } = ctx.state;
    if (
      adminResult.roleGrade == 0 &&
      agencyResult &&
      !agencyResult.audit_status
    ) {
      ctx.response.status = 200;
      ctx.body = {
        msg: "您没有权限",
        result: 0,
        data: [],
      };
    }
    try {
      let maidBindAgency = await homeWorkMaid_Model.updateOne(
        { adminId: adminResult._id },
        { $set: { agencyID: agencyResult._id } }
      );
      ctx.status = 200;
      ctx.body = {
        data: maidBindAgency,
        msg: "绑定成功",
        result: 1,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: "服务器错误", error };
    }
  };
  // 设置家政阿姨工作时间
  setMaidWorkTime = async (ctx, next) => {
    let { valid, message } = toolFunMiddleware.checkRouterParams(
      ctx.request.paramsObj,
      Joi.object({
        wage: Joi.number().required(),
        working_hours: Joi.array()
          .items(
            Joi.object({
              day: Joi.string().required(), // 具体日期格式，如 "2024/11/13"
              start_time: Joi.number().required(), // 时间戳
              end_time: Joi.number().required(), // 时间戳
            })
          )
          .required(),
      })
    );
    if (!valid) {
      // 参数校验不通过：返回前端提示
      ctx.status = 400;
      ctx.body = {
        msg: message,
        result: 0,
      };
      return;
    }
    let { wage, working_hours } = ctx.request.paramsObj;
    try {
      const maid = await homeWorkMaid_Model.findByIdAndUpdate(
        maidId,
        { wage, working_hours },
        { new: true }
      );

      if (!maid) {
        throw new Error("Maid not found");
      }

      ctx.body = {
        data: maid,
        result: 1,
        message: "修改成功",
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: "服务器错误", error };
    }
  };
  // 预约家政 创建订单 测试中未
  async createOrder(ctx) {
    let { valid, message } = toolFunMiddleware.checkRouterParams(
      ctx.request.paramsObj,
      Joi.object({
        customerId: Joi.string().required(),
        maidId: Joi.string().required(),
        date: Joi.string().required(),
        start_time: Joi.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        end_time: Joi.string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
      })
    );
    if (!valid) {
      // 参数校验不通过：返回前端提示
      ctx.status = 400;
      ctx.body = { message, result: 0 };
      return;
    }
    const { customerId, maidId, date, start_time, end_time } = ctx.request.body;

    // 确保 start_time 不晚于 end_time
    if (
      new Date(`${date}T${start_time}:00`).getTime() >=
      new Date(`${date}T${end_time}:00`).getTime()
    ) {
      ctx.body = {
        result: 0,
        msg: "开始时间不能晚于结束时间",
      };
      return;
    }

    try {
      // 开始事务
      const session = await mongoose.startSession();
      session.startTransaction();

      // 检查家政阿姨是否有空闲时间
      const maid = await homeWorkMaid_Model
        .findOne({ _id: maidId })
        .session(session);
      if (!maid) {
        return (ctx.status = 404), (ctx.body = { message: "家政阿姨未找到" });
      }

      // 将时间字符串转换为时间戳
      const startDate = new Date(`${date}T${start_time}:00`).getTime();
      const endDate = new Date(`${date}T${end_time}:00`).getTime();

      const isAvailable = maid.working_hours.some((wh) => {
        const workingDay = new Date(wh.day).setHours(0, 0, 0, 0);
        return (
          wh.day === date &&
          startDate >= wh.start_time &&
          startDate < wh.end_time &&
          endDate > wh.start_time &&
          endDate <= wh.end_time
        );
      });

      if (!isAvailable) {
        throw new Error("家政阿姨在该时间段内没有空闲时间");
      }

      // 创建订单
      const order = new OrderModel({
        customerId,
        maidId,
        date,
        start_time: startDate,
        end_time: endDate,
      });

      await order.save({ session });

      // 提交事务
      await session.commitTransaction();
      session.endSession();

      ctx.status = 201;
      ctx.body = order;
    } catch (error) {
      // 回滚事务
      await session.abortTransaction();
      session.endSession();
      ctx.status = 500;
      ctx.body = { message: "服务器错误", error };
    }
  }
}
module.exports = new homeWork();
