// 引入数据库模式和数据库连接
const { Schema, db } = require("../../utils/db");
const Ids = require("../ids");

// 房源基本设置
const collectRentSetting = new Schema({
  // 水费率
  water_rate: {
    type: String,
    default: 5,
  },
  // 电费费率
  electricity_rate: {
    type: String,
    default: 1.8,
  },
  // 押金
  deposit: {
    type: Array,
    default: [
      {
        name: "一押一付",
        id: 0,
        rate: 1,
      },
    ],
  },
});

// 房源表
const landlord = new Schema({
  id: { type: Number, unique: true },
  // 关联的用户id
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  // 房源地址
  address: {
    type: String,
    required: true,
    unique: true,
  },
  // 层高
  floorHeight: {
    type: Number,
    required: true,
  },
  // 房源图片
  room_pic: {
    type: Array,
    default: [],
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: "unit",
  },
  updatedAt: {
    type: String,
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

// 租客表
const tenant = new Schema({
  // 房源id
  landkird_id: {
    type: Schema.Types.ObjectId,
    ref: "landlord",
  },
  // 关联的用户id
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  updatedAt: {
    type: String,
    default: 0,
  },
});
tenant.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    that.updatedAt = Date.now();
  }
  next();
});

// 出租单元
const unit = new Schema({
  // 房源id
  landkird_id: {
    type: Schema.Types.ObjectId,
    ref: "landlord",
  },
  // 押金选项id
  deposit_type: {
    type: Number,
    required: true,
  },
  // 押金金额数量
  deposit_money: {
    type: Number,
    required: true,
  },
  // 基本租金
  basic_rent: {
    type: Number,
    required: true,
  },
  Roomname: {
    type: String,
    required: true,
  },
  // 当前电表度数
  electricity_now: {
    type: String,
    default: 0,
  },
  // 当前水表度数
  water_now: {
    type: String,
    default: 0,
  },
  // 是否租售 0未租，1已租
  rent_status: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: String,
    default: String(Date.now()),
  },
});
unit.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    that.updatedAt = Date.now();
  }
  next();
});

const SettingSchema = db.model("collectRent_Setting", collectRentSetting);
const landlordSchema = db.model("collectRent_landlord", landlord);
const collectRentSchema = db.model("collectRent_tenant", tenant);
const unitSchema = db.model("collectRent_unit", unit);
module.exports = {
  SettingSchema,
  landlordSchema,
  collectRentSchema,
  unitSchema,
};
