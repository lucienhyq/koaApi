const homeWork = require("./index");

class homeWorkOrder extends homeWork {
  // 创建订单，是根据家政服务来创建
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

module.exports = new homeWorkOrder();