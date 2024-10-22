const { Schema, db } = require("../../db");

class UserAdmin {
  add = async (ctx, next) => {
    console.log(db);
    ctx.body = {
      result: 1,
      msg: "添加成功",
      data: ctx.request.query,
    };
  };
}

module.exports = new UserAdmin();
