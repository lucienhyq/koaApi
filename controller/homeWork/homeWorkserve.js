const homeWork = require("./index");
const areaList = require("../../utils/areaList");
class homeWorkserve extends homeWork {
  serveCreate = (ctx, next) => {
    ctx.body = "服务创建";
  };
}
module.exports = new homeWorkserve();
