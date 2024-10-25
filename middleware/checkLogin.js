class checkLogin {
  check = async (ctx, next) => {
    console.log(ctx.session,'dddddddddd')
    if (ctx.session?.userId) {
      // 已登录
      await next();
    } else {
      ctx.response.status = 401;
      ctx.body = {
        msg: "请先登录",
        result: 0,
      };
    }
  };
}

module.exports = new checkLogin();
