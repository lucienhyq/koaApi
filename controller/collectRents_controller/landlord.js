const toolFunMiddleware = require("../../middleware/tool");
const Joi = require("joi");
const {
  SettingSchema,
  landlordSchema,
  collectRentSchema,
  montStatementSchema,
  unitSchema,
} = require("../../model/collectRents/collectRent");
class landlord {
  // 查找或创建 SettingSchema
  static getOrCreateSetting = async () => {
    try {
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
      return setting;
    } catch (error) {
      throw error; // 或者根据需要处理错误
    }
  };
  // 参数校验
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

  // 判断是不是管理员权限
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
  // 添加房源
  rentHouseAdd = async (ctx, next) => {
    try {
      landlord.validBody(
        {
          address: Joi.string().required(),
          floorHeight: Joi.number().required(),
          unit: Joi.array(),
        },
        ctx
      );
      let setting = await landlord.getOrCreateSetting();
      const findLandlordCount = await landlordSchema
        .find({
          address: ctx.request.paramsObj.address,
        })
        .count();
      if (findLandlordCount > 0) {
        ctx.body = { msg: "该地址已存在", result: 0 };
        return;
      } else {
        let res = await landlordSchema.create({
          adminId: ctx.state.adminResult._id,
          address: ctx.request.paramsObj.address,
          floorHeight: ctx.request.paramsObj.floorHeight,
        });
        if (res) {
          if (ctx.request.paramsObj.unit) {
            let createUnit = ctx.request.paramsObj.unit;
            for (let i = 0; i < createUnit.length; i++) {
              const depositItem = setting.deposit.find(
                (item) => item.id == createUnit[i].deposit
              );
              createUnit[i].landkird_id = res._id;
              createUnit[i].basic_rent = Number(createUnit[i].basic_rent);
              if (depositItem) {
                createUnit[i].deposit_type = depositItem.id;
              } else {
                createUnit[i].deposit_type = 0;
              }
            }
            await unitSchema.insertMany(createUnit);
          }
        }
        ctx.body = {
          msg: "新建房源成功",
          data: res,
          result: 1,
        };
      }
    } catch (error) {
      console.log("qqqqq");
      ctx.body = {
        msg: error.message,
        result: 0,
      };
    }
  };
  // 录入每月电费，水费
  enteringMonthData = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          water: Joi.string().required(),
          electricity: Joi.string().required(),
          unit_id: Joi.string().required(),
          year: Joi.number().required(),
          month: Joi.number().required(),
        })
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      const { year, month, unit_id, water, electricity } =
        ctx.request.paramsObj;

      const formattedMonth = new Date(
        `${year}-${month < 10 ? "0" + month : month}-01`
      );
      let findRes = await montStatementSchema.find({
        unit_id: unit_id,
        month: formattedMonth,
      });

      if (findRes.length > 0) {
        ctx.body = {
          code: 200,
          message: "该月已录入水电",
        };
        return;
      }
      // 构建要存储的数据
      const dataToStore = {
        water: water,
        electricity: electricity,
        unit_id: ctx.request.body.unit_id,
        month: formattedMonth,
      };
      let res = await montStatementSchema.create(dataToStore);
      ctx.body = {
        result: 1,
        message: "录入成功",
        data: res,
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
