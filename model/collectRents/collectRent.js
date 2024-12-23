// 引入数据库模式和数据库连接
const { Schema, db } = require("../../utils/db");
const Ids = require("../ids");
// 房源基本设置
const collectRentSetting = new Schema({});
// 房源表
const landlord = new Schema({
  id: { type: Number, default: 0, unique: true },
  // 关联的用户id
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  // 房源标题
  title: {
    type: String,
    required: true,
  },
  // 房源地址
  address: {
    type: String,
    required: true,
  },
  //审核状态 0待审核 1审核中 2审核通过 3审核失败
  auditStatus: {
    type: Number,
    default: 0,
  },
  // 房源状态
  status: {
    type: Number,
    default: 0,
  },
  // 房源房间号
  room_number: {
    type: Array,
    required: true,
  },
  // 房源图片
  room_pic: {
    type: Array,
    default: [],
  },
  updatedAt: {
    type: String,
    default: 0,
  },
});
// 租客表
const tenant = new Schema({
  // 房源id
  landkird_id: {
    type: [String, Number],
    require: true,
  },
  // 关联的用户id
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  // 房源地址
  address: {
    type: String,
    required: true,
  },
  // 审核状态
  status: {
    type: Number,
    default: 0,
  },
  rentTime: {
    type: Number,
    default: 0,
  },
});

landlord.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    const counter = await Ids.findOneAndUpdate(
      { type: "adminId" },
      { $inc: { landlord: 1 } },
      { upsert: true, new: true }
    );
    that.id = counter.landlord;
  }
  // 更新 updatedAt 字段
  that.updatedAt = Date.now();
  next();
});
// 创建并导出Admin模型
const SettingSchema = db.model("collectRent_Setting", collectRentSetting);
const landlordSchema = db.model("collectRent_landlord", landlord);
const collectRentSchema = db.model("collectRent_tenant", tenant);
module.exports = { SettingSchema, landlordSchema, collectRentSchema };
