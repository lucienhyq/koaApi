const KoaJWT = require("koa-jwt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

// 鉴权中间件
const authMiddleware = KoaJWT({
  secret,
  onError: (err, ctx) => {
    console.log("ddddddddddd");
    ctx.status = 401;
    ctx.body = { message: "Token 验证失败", msg: "请登录", result: 0 };
  },
});

// 生成 JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, secret, { expiresIn: "1h" });
};

const checkAuthorizationHeader = async (ctx, next) => {
  const authorization = ctx.headers.authorization;
  if (!authorization) {
    ctx.state.authBreak = false;
  } else {
    ctx.state.authBreak = authorization;
    try {
      await authMiddleware(ctx, next);
      return
    } catch (err) {}
  }
  await next();
};

module.exports = { authMiddleware, generateToken, checkAuthorizationHeader };
