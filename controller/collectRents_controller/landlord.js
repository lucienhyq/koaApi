const toolFunMiddleware = require("../../middleware/tool");
const Joi = require("joi");
const {
  SettingSchema,
  landlordSchema,
  collectRentSchema,
} = require("../../model/collectRents/collectRent");
class landlord {
  /**
   *
   * @param {
   *   title 房源标题
   *   address 地址门牌号
   *   可出租房号作为标识id
   *   room_number:array[101,102,103,104,105,201,202,203]
   *   status 房源状态 0:未出租 1:已出租
   *   room_pic 房源图片数组
   * } ctx
   * @description 申请房东
   */
  apply = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          address: Joi.string().required(),
          number: Joi.number().required(),
          room_number: Joi.array().required(),
          rename: Joi.string().required(),
          title: Joi.string().required(),
        })
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      const findLandlord = await landlordSchema
        .findOne({
          address: ctx.request.paramsObj.address,
        })
        .count();
      if (findLandlord) {
        return (ctx.body = { msg: "该地址已申请", result: 0 });
      }
      let landlord = await landlordSchema.create({
        title: ctx.request.paramsObj.title,
        address: ctx.request.paramsObj.address,
        number: ctx.request.paramsObj.number,
        room_number: ctx.request.paramsObj.room_number,
        rename: ctx.request.paramsObj.rename,
        adminId: ctx.state.adminResult._id,
      });
      // 使用 Mongoose 查询方法来获取筛选后的数据
      landlord = await landlordSchema
        .findById(landlord._id)
        .select("-_id -__v")
        .populate({
          path: "adminId",
          select: "id phone username",
        });
      ctx.body = {
        msg: "",
        data: landlord,
        result: 1,
      };
    } catch (error) {
      ctx.body = { msg: "申请失败，请稍后再试", result: 0 };
      console.error(`房东申请失败: ${error.message}`);
    }
  };
  /**
   *
   * @param {
   *   id: 管理员的id, // 审核人id
   *   status: Number, // 审核状态
   * }
   * @param {*} next
   * @returns
   */
  audit = async (ctx, next) => {
    try {
      const UserAdmin = ctx.state.adminResult;
      if (UserAdmin.roleGrade !== 1) {
        ctx.body = { msg: "权限不足", result: 0 };
        return;
      }
      let findIDs = await landlordSchema.findOne({
        id: ctx.request.paramsObj.id,
      });
      // 只有管理员才可以审核，管理员roleGrade===1
      // status: 0 待审核 1审核中 2审核通过 3审核失败
      let updateRes = await landlordSchema.updateOne(
        { _id: findIDs._id },
        { status: 0 }
      );
      console.log(updateRes);
      if (updateRes) {
        ctx.body = { msg: "操作成功", result: 1 };
      }
    } catch (error) {
      ctx.body = { msg: "审核失败" + error.message, result: 0 };
    }
  };
  
  list = async (ctx, next) => {
    try {
      if (!ctx.state.landlord) {
        ctx.body = {
          msg: "",
          data: "您还未成为房东，请先申请成为房东",
          result: 0,
        };
        return;
      }
      let listRecord = await landlordSchema.find({
        adminId: ctx.state.adminResult._id,
      });
      ctx.body = { msg: "操作成功", result: 1, data: listRecord };
    } catch (error) {
      console.log(error.message);
      ctx.body = { msg: "操作失败", result: 0, data: error.message }; // 添加这一行
    }
  };
}

module.exports = landlord;
