class toolFun {
  getParams = async (ctx, next) => {
    try {
      // 安全性增强：对输入参数进行验证和清理
      // console.log(ctx.request.body, "=====getParams");
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
  checkRouterParams = (params, requiredFields = []) => {
    if (!params || typeof params !== "object" || Array.isArray(params)) {
      return { valid: false, message: "参数必须是一个有效的对象" };
    }

    if (!Array.isArray(requiredFields)) {
      return { valid: false, message: "需要检查的字段列表必须是一个数组" };
    }

    let isValid = true;
    let errorMessage = "";
    // 如果 requiredFields 为空数组，则检查所有字段
    const fieldsToCheck =
      requiredFields.length === 0 ? Object.keys(params) : requiredFields;
    for (const field of fieldsToCheck) {
      if (params.hasOwnProperty(field)) {
        const value = params[field];
        if (value === undefined || value === null || value === "") {
          isValid = false;
          errorMessage = `参数 ${field} 不能为空、null 或 undefined`;
          break; // 遇到无效参数立即停止检查
        }
      } else {
        isValid = false;
        errorMessage = `缺少必需参数`;
        console.log(`缺少必需参数 ${field}`);
        break; // 缺少必需参数立即停止检查
      }
    }

    return { valid: isValid, message: errorMessage };
  };
}

module.exports = new toolFun();
