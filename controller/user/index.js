const Admin = require("../../model/UserAdmin")
class UserAdmin {
  add = async (ctx, next) => {
    ctx.body = {
      result: 1,
      msg: "添加成功",
      data: ctx.request.query,
    };
  };
}

module.exports = new UserAdmin();
