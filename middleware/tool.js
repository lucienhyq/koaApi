const Joi = require("joi");
class toolFun {
  getParams = async (ctx, next) => {
    try {
      // 安全性增强：对输入参数进行验证和清理
      const params =
        ctx.request.method === "GET"
          ? this.sanitizeQuery(ctx.request.query)
          : this.sanitizeBody(ctx.request.body);

      // 边界条件处理：确保 params 不为空
      ctx.request.paramsObj = params || {};
      await next();
    } catch (error) {
      // 异常处理：捕获并处理异常
      console.error("Error in getParams:", error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  };

  // 清理 query 参数
  sanitizeQuery = (query) => {
    if (!query || typeof query !== "object") {
      return {};
    }
    return Object.fromEntries(
      Object.entries(query).map(([key, value]) => [key, this.escapeHtml(value)])
    );
  };

  // 清理 body 参数
  sanitizeBody = (body) => {
    if (!body || typeof body !== "object") {
      return {};
    }
    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, this.escapeHtml(value)])
    );
  };

  // HTML 转义函数，防止 XSS 攻击
  escapeHtml = (value) => {
    if (typeof value !== "string") {
      return value;
    }
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // 使用 Joi 进行参数校验
  checkRouterParams = (params, schema) => {
    if (!params || typeof params !== "object" || Array.isArray(params)) {
      return { valid: false, message: "参数必须是一个有效的对象" };
    }
    if (!schema || !Joi.isSchema(schema)) {
      return { valid: false, message: "校验模式必须是一个有效的 Joi 对象模式" };
    }

    const { error } = schema.validate(params);
    if (error) {
      return {
        valid: false,
        message: error.details[0].context["key"] + "参数校验不通过",
      };
    }

    return { valid: true, message: "" };
  };
  checkUserRoles = async (ctx, next) => {
    try {
      const UserAdmin = ctx.state.adminResult;
      const landlord = await landlordSchema
        .findOne({ adminId: UserAdmin._id })
        .count();
      const tenant = await collectRentSchema
        .findOne({ adminId: UserAdmin._id })
        .count();
      if (landlord) {
        ctx.state.landlord = true;
      }
      if (tenant) {
        ctx.state.tenant = true;
      }
      await next();
    } catch (error) {
      ctx.body = {
        msg: "",
        data: error.message,
        result: 0,
      };
    }
  };
}

module.exports = new toolFun();
