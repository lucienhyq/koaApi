class checkLogin {
  check = async (ctx, next) => {
    console.log(ctx.session);
    if (ctx.session?.user) {
      await next({login:true});
    } else {
      ctx.body = {
        code: 401,
        msg: "请先登录",
      };
    }
  };
}

module.exports = new checkLogin();
