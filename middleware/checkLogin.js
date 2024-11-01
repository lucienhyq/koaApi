class checkLogin {
  check = async (ctx, next) => {
    if (ctx.state?.user?.userId) {
      ctx.session.userId = ctx.state?.user?.userId;
    }
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
