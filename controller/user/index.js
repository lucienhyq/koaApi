const Admin = require("../../model/UserAdmin");
const Order = require("../../model/Order");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../middleware/auth");
const { mongoose } = require("../../model/db");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
class UserAdmin {
  constructor() {
    eventEmitter.on("orderCreated", this.handleOrderCreated.bind(this));
  }
  // 是否存在手机号会员 中间件
  checkUser = async (ctx, next) => {
    const { phone } = ctx.request.paramsObj;
    try {
      const findAdmin = await Admin.countDocuments({ phone });
      ctx.state.adminExists = findAdmin > 0;
    } catch (error) {
      ctx.response.status = 500;
      ctx.body = {
        msg: "服务器错误",
      };
    }
    await next();
  };

  // 登录
  login = async (ctx, next) => {
    const { phone, password } = ctx.request.paramsObj;
    try {
      const findAdmin = await Admin.findOne({ phone });
      if (!findAdmin) {
        ctx.response.status = 404;
        ctx.body = {
          msg: "用户不存在",
        };
        return;
      }

      if (ctx.state?.user?.userId) {
        ctx.session.userId = ctx.state.user.userId;
        ctx.body = {
          code: 200,
          msg: "登录成功",
          data: ctx.state.authBreak ? ctx.state.authBreak : "",
        };
        return;
      }

      const bcryptResult = await bcrypt.compare(password, findAdmin.password);
      if (bcryptResult) {
        const token = generateToken({ id: findAdmin._id });
        ctx.session.userId = String(findAdmin._id);
        console.log(ctx.session, "登录后 session");
        ctx.body = {
          msg: "登录成功1",
          data: token,
        };
      } else {
        ctx.response.status = 401;
        ctx.body = {
          msg: "密码错误",
        };
      }
    } catch (error) {
      ctx.response.status = 500;
      ctx.body = {
        msg: "服务器错误" + error,
      };
    }
  };

  // 添加会员 中间件
  add = async (ctx, next) => {
    try {
      const { phone, password } = ctx.request.paramsObj;
      if (ctx.state.adminExists) {
        ctx.body = {
          result: 0,
          msg: "已存在会员",
          data: "",
        };
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const res = await Admin.create({ phone, password: hashedPassword });
      ctx.body = {
        result: 1,
        msg: "添加成功",
        data: res,
      };
    } catch (error) {
      ctx.body = {
        result: 0,
        msg: "添加失败",
        data: "",
      };
    }
  };

  // 删除会员 中间件
  deleteUser = async (ctx, next) => {
    try {
      const { phone } = ctx.request.paramsObj;
      if (!ctx.state.adminExists) {
        ctx.body = {
          result: 0,
          msg: "删除失败，不存在该会员",
        };
        return;
      }

      const result = await Admin.deleteOne({ phone });
      ctx.body = {
        result: 1,
        msg: "删除成功",
        data: result,
      };
    } catch (error) {
      ctx.body = {
        result: 0,
        msg: "删除失败",
        data: error,
      };
    }
  };

  // 更新会员
  /**
   * @param {String} phone 必传
   */
  updateUser = async (ctx, next) => {
    try {
      if (!ctx.state.adminExists) {
        ctx.body = {
          result: 0,
          msg: "更新失败，不存在该会员",
        };
        return;
      }

      const { phone, password, gender } = ctx.request.paramsObj;
      const updateData = { phone, gender };

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      await Admin.findOneAndUpdate({ phone }, updateData, {
        new: true,
        runValidators: true,
      });

      ctx.body = {
        result: 1,
        msg: "更新成功",
        data: "",
      };
    } catch (error) {
      console.error(error);
      ctx.body = {
        result: 0,
        msg: "更新失败",
      };
    }
  };
  // 查询条件实例方法
  buildQuery(params) {
    const { username, phone } = params;
    const query = {};

    if (username) {
      query.$or = [{ username: { $regex: new RegExp(username, "i") } }];
    }
    if (phone) {
      if (query.$or) {
        query.$or.push({ phone: { $regex: new RegExp(phone, "i") } });
      } else {
        query.$or = [{ phone: { $regex: new RegExp(phone, "i") } }];
      }
    }

    return query;
  }
  /**
   * 查找会员
   * @param {String} phone 必传
   */
  findOneUser = async (ctx, next) => {
    try {
      const { phone, username } = ctx.request.paramsObj;

      if (!phone && !username) {
        ctx.response.status = 400;
        ctx.body = {
          result: 0,
          msg: "查找失败，参数不正确",
        };
        return;
      }

      const query = this.buildQuery({ phone, username });
      const result = await Admin.findOne(query).select("-password -__v");

      ctx.body = {
        result: result ? 1 : 0,
        msg: result ? "查找成功" : "查找失败",
        data: result,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.body = {
        result: 0,
        msg: "查找失败",
      };
    }
  };
  // 退出登录
  loginOut = async (ctx, next) => {
    try {
      ctx.session = null;
      ctx.state = {};
      ctx.set("Authorization", "");
      ctx.body = {
        result: 1,
        msg: "退出成功",
      };
    } catch (error) {
      ctx.body = {
        result: 0,
        msg: "服务器错误" + error,
      };
    }
  };
  handleOrderCreated = (order) => {
    console.log(order, "订单创建了");
  };
  orderListCreated(amount) {
    // 监听
    // eventEmitter.emit("orderCreated", { amount });
    let orderJson = {
      orderId: "sn" + Date.now(),
      totalAmount: amount,
      userId: ctx.session.userId,
      orderStatus: 0,
      createdAt: new Date(),
    };
    console.log(orderId);
  };
  // 充值
  addBalance = async (ctx, next) => {
    try {
      let { amount } = ctx.request.paramsObj;
      amount = Number(amount);

      // 输入验证
      if (!amount || typeof amount !== "number" || amount <= 0) {
        ctx.body = {
          result: 0,
          msg: "充值金额必须为正数",
        };
        return;
      }

      // 验证 userId 格式
      if (!mongoose.Types.ObjectId.isValid(ctx.session.userId)) {
        ctx.body = {
          result: 0,
          msg: "无效的用户ID",
        };
        return;
      }

      try {
        this.orderListCreated(amount);
        const user = await Admin.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(ctx.session.userId) },
          { $inc: { balance: amount } },
          { new: true }
        );

        if (!user) {
          throw new Error("用户不存在");
        }

        ctx.body = {
          result: 1,
          msg: "充值成功",
          data: [],
        };
      } catch (error) {
        console.error("内部错误", {
          error,
          amount,
          userId: ctx.session.userId,
        });
        ctx.body = {
          result: 0,
          msg: "服务器错误: " + error.message,
        };
      }
    } catch (error) {
      console.error("外部错误", {
        error,
        request: ctx.request.body,
        session: ctx.session,
      });
      ctx.body = {
        result: 0,
        msg: "服务器错误: " + error.message,
      };
    }
  };
}

module.exports = new UserAdmin();
