const Admin = require("../../model/UserAdmin");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../middleware/auth");
class UserAdmin {
  // 是否存在手机号会员 中间件
  checkUser = async (ctx, next) => {
    let { phone } = ctx.request.paramsObj;
    let findAdmin = await Admin.findOne({ phone: phone }).countDocuments();
    if (findAdmin > 0) {
      ctx.state.adminExists = true;
    } else {
      ctx.state.adminExists = false;
    }
    await next();
  };
  // 登录
  login = async (ctx, next) => {
    let { phone, password } = ctx.request.paramsObj;
    let findAdmin = await Admin.findOne({
      phone: phone,
    });
    if (!findAdmin) {
      ctx.response.status = 500;
      ctx.body = {
        msg: "用户不存在",
      };
      return;
    }
    if (ctx.state?.user?.userId) {
      ctx.session.userId = ctx.state?.user?.userId;
      ctx.body = {
        code: 200,
        msg: "登录成功",
        data: ctx.state.authBreak ? ctx.state.authBreak : "",
      };
      return;
    }
    let bcryptResult = await bcrypt.compare(password, findAdmin.password);
    if (bcryptResult) {
      const token = generateToken({ id: findAdmin._id });
      ctx.body = {
        msg: "登录成功",
        data: token,
      };
    } else {
      ctx.response.status = 500;
      ctx.body = {
        msg: "密码错误",
      };
    }
  };
  // 添加会员 中间件
  add = async (ctx, next) => {
    try {
      let { phone, password } = ctx.request.paramsObj;
      if (ctx.state.adminExists) {
        ctx.body = {
          result: 0,
          msg: "已存在会员",
          data: "",
        };
        return;
      } else if (!ctx.state.adminExists) {
        let _json = { phone: phone, password: password };
        let res = await Admin.create(_json);
        ctx.body = {
          result: 1,
          msg: "添加成功",
          data: res,
        };
      }
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
      let { phone } = ctx.request.paramsObj;
      if (!ctx.state.adminExists) {
        ctx.body = {
          result: 0,
          msg: "删除失败，不存在该会员",
        };
        return;
      }
      let result = await Admin.deleteOne({ phone: phone });
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
      if (!ctx.state?.adminExists) {
        return (ctx.body = {
          result: 0,
          msg: "更新失败，不存在该会员",
        });
      }

      let { phone, password, gender } = ctx.request.paramsObj;
      let _json = { phone, gender };

      if (password) {
        // 手动加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        _json.password = hashedPassword;
      }

      await Admin.findOneAndUpdate({ phone: phone }, _json, {
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
}

module.exports = new UserAdmin();
