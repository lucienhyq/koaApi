const { Schema, db } = require("./db");
const Ids = require("./ids");
// 家政阿姨模型
const homeWorkMaidSchema = new Schema({
  // 家政阿姨id
  id: { type: Number, default: 0, unique: true },
  // 关联的用户id
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  // 真实姓名
  real_name: {
    type: String,
    default: "",
  },
  // 身份证号码
  id_card: {
    type: String,
    required: true,
  },
  // 居住地址
  address: {
    type: String,
    default: "",
  },
  // 联系电话
  phone: {
    type: String,
    default: "",
  },
  //年龄
  age: {
    type: Number,
    default: 18,
  },
  //学历
  education: {
    type: String,
    default: "",
  },
  //学历证书
  education_certificate: {
    type: String,
    default: "",
  },
  // 兼职0，全职1
  work_type: {
    type: Number,
    default: 0,
  },
});
homeWorkMaidSchema.add({
  audit_status: {
    type: Boolean,
    default: false,
  },
});
homeWorkMaidSchema.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    const counter = await Ids.findOneAndUpdate(
      { type: "adminId" },
      { $inc: { homeWorkMaidId: 1 } },
      { upsert: true, new: true }
    );
    that.id = counter.homeWorkMaidId;
  }
  next();
});
const homeWorkMaid_Model = db.model("homeWorkMaid", homeWorkMaidSchema);

// 家政代理 模型
const AgencySchema = new Schema({
  id: { type: Number, default: 0, unique: true },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  agencyName: {
    type: String,
    default: "",
  },
  register_address: {
    type: String,
    default: "",
  },
  // 营业执照照片
  business_license: {
    type: String,
    default: "",
  },
  id_card: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  audit_status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Number,
    default: () => Date.now(),
  },
});
AgencySchema.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    const counter = await Ids.findOneAndUpdate(
      { type: "adminId" },
      { $inc: { homeWorkAgencyId: 1 } },
      { upsert: true, new: true }
    );
    that.id = counter.homeWorkAgencyId;
  }
  // 更新 updatedAt 字段
  that.updatedAt = Date.now();
  next();
});
const AgencySchema_Model = db.model("homeWorkAgency", AgencySchema);

module.exports = { homeWorkMaid_Model, AgencySchema_Model };
