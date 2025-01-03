const toolFunMiddleware = require("../../middleware/tool");
const Joi = require("joi");
const {
  SettingSchema,
  landlordSchema,
  collectRentSchema,
} = require("../../model/collectRents/collectRent");
class landlord {
  static validBody = async (json, ctx) => {
    try {
      let { valid, message } = await toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object(json)
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
    } catch (error) {
      ctx.body = {
        msg: error.message,
        result: 0,
      };
    }
  };
  authRoot = async (ctx, next) => {
    try {
      if (ctx.state.adminResult.roleGrade == 0) {
        await next();
      } else {
        ctx.body = {
          msg: "权限不足",
          result: 0,
        };
      }
    } catch (error) {
      ctx.body = {
        msg: error.message,
        result: 0,
      };
    }
  };
  rentHouseAdd = async (ctx, next) => {
    try {
      landlord.validBody(
        {
          address: Joi.string().required(),
          unit: Joi.string().required(),
          basic_rent: Joi.number().required(),
          depositType: Joi.number().required(),
        },
        ctx
      );
      let setting = await SettingSchema.findOne();
      if (!setting) {
        setting = await SettingSchema.create({
          water_rate: 5,
          electricity_rate: 1.8,
          deposit: [
            {
              name: "一押一付",
              id: 0,
              rate: 1,
            },
            {
              name: "两押一付",
              id: 1,
              rate: 2,
            },
            {
              name: "三押一付",
              id: 2,
              rate: 3,
            },
          ],
        });
      }
      console.log(setting);
      console.log(setting.deposit[ctx.request.paramsObj.depositType]);
      let depositType = setting.deposit[ctx.request.paramsObj.depositType].rate;
      let result = await landlordSchema.create({
        address: ctx.request.paramsObj.address,
        unit: ctx.request.paramsObj.unit,
        basic_rent: ctx.request.paramsObj.basic_rent,
        deposit: depositType * ctx.request.paramsObj.basic_rent,
        adminId: ctx.state.adminResult._id,
      });
      console.log(result);
      ctx.body = {
        msg: "新建房源成功",
        // data: result,
        result: 1,
      };
    } catch (error) {
      ctx.body = {
        msg: error.message,
        result: 0,
      };
    }
  };
}

module.exports = landlord;
