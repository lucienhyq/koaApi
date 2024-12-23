const toolFunMiddleware = require("../../middleware/tool");
const Joi = require("joi");
const {
  SettingSchema,
  landlordSchema,
  collectRentSchema,
} = require("../../model/collectRents/collectRent");
class tenant {
  //新建租客信息
  create_tenant = async (ctx, next) => {
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
    } catch (error) {
      ctx.body = { msg: "新建租客失败" + error.message, result: 0 };
    }
  };
}

module.exports = tenant;
