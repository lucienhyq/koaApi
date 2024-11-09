// 引入数据库模式和数据库连接
const { Schema, db, mongoose } = require("../utils/db");

// 引入bcrypt模块用于密码加密，此处已注释掉
// const bcrypt = require("bcrypt");

/**
 * 创建订单列表的数据库模式
 *
 * @property {String} orderId - 订单ID
 * @property {Number} totalAmount - 订单总金额
 * @property {String} orderStatus - 订单状态
 * @property {Date} orderTime - 订单时间
 * @property {String} paymentMethod - 支付方式
 * @property {String} paymentStatus - 支付状态
 * @property {String} shippingAddress - 收货地址
 * @property {String} shippingMethod - 物流方式
 * @property {String} shippingStatus - 物流状态
 */
const OrderListSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  totalAmount: {
    type: Number,
  },
  orderStatus: {
    type: Number,
    default: 0,
  },
  orderTime: {
    type: Date,
  },
  // 0充值
  paymentMethod: {
    type: Number,
    default: 0,
  },
  shippingAddress: {
    type: String,
  },
  shippingMethod: {
    type: String,
  },
  shippingStatus: {
    type: String,
  },
});
// 在保存文档之前，如果文档是新创建的，则设置orderTime为当前时间
OrderListSchema.pre("save", function (next) {
  if (this.isNew) {
    this.orderTime = new Date();
  }
  next();
});
const OrderList = db.model("Order", OrderListSchema);

// 导出订单列表的数据库模式
module.exports = OrderList;
