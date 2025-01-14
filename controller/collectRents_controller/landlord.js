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
        },
        ctx
      );
      // let setting = await landlord.getOrCreateSetting();
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
        // if (res) {
        //   if (ctx.request.paramsObj.unit) {
        //     let createUnit = ctx.request.paramsObj.unit;
        //     for (let i = 0; i < createUnit.length; i++) {
        //       const depositItem = setting.deposit.find(
        //         (item) => item.id == createUnit[i].deposit
        //       );
        //       createUnit[i].landkird_id = res._id;
        //       createUnit[i].basic_rent = Number(createUnit[i].basic_rent);
        //       if (depositItem) {
        //         createUnit[i].deposit_type = depositItem.id;
        //       } else {
        //         createUnit[i].deposit_type = 0;
        //       }
        //     }
        //     await unitSchema.insertMany(createUnit);
        //   }
        // }
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
  // 新建出租单元
  unitAdd = async (ctx, next) => {
    try {
      let { valid, message } = toolFunMiddleware.checkRouterParams(
        ctx.request.paramsObj,
        Joi.object({
          landkird_id: Joi.string().required(),
          // 押金选项的id值
          deposit: Joi.number().required(),
          // 基本租金
          basic_rent: Joi.number().required(),
          // 出租单元名称 如：201 ，301
          Roomname: Joi.string().required(),
          electricity_now: Joi.string().required(),
          water_now: Joi.string().required(),
        })
      );
      if (!valid) {
        // 参数校验不通过：返回前端提示
        ctx.status = 400;
        ctx.body = { message, result: 0 };
        return;
      }
      let findUnitNum = await unitSchema
        .find({
          landkird_id: ctx.request.paramsObj.landkird_id,
          Roomname: ctx.request.paramsObj.Roomname,
        })
        .count();
      if (findUnitNum > 0) {
        ctx.body = { msg: "该单元已存在", result: 0 };
        return;
      }
      let { deposit, electricity_rate, water_rate } =
        await landlord.getOrCreateSetting();
      let indDeposit = deposit.filter((item) => {
        return item.id == ctx.request.paramsObj.deposit;
      });
      // 押金比例 * 基本租金 = 押金
      let depositRate = indDeposit[0].rate;
      let depositOpt = indDeposit[0].id;
      // 新建单元
      let createUnit = {
        landkird_id: ctx.request.paramsObj.landkird_id,
        deposit_type: depositOpt,
        deposit_money: Number(ctx.request.paramsObj.basic_rent) * depositRate,
        basic_rent: ctx.request.paramsObj.basic_rent,
        Roomname: ctx.request.paramsObj.Roomname,
        electricity_now: ctx.request.paramsObj.electricity_now,
        water_now: ctx.request.paramsObj.water_now,
        water_price: ctx.request.paramsObj.water_price,
        electricity_price: ctx.request.paramsObj.electricity_price,
        water_now: ctx.request.paramsObj.water_now,
      };
      let createUnit_resul = await unitSchema.create(createUnit);
      ctx.body = {
        msg: "添加成功",
        data: createUnit_resul,
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
