// 引入数据库模式和数据库连接
const { Schema, db } = require("../utils/db");
// 引入bcrypt模块用于密码加密
const bcrypt = require("bcrypt");
const Ids = require("./ids");
// 定义管理员数据模式
const adminSchema = new Schema({
  id: {
    type: Number,
    default: 0,
    unique: true,
  },
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "", unique: true },
  account: { type: String, default: "", unique: true },
  roleGrade: {
    type: Number,
    default: 0,
  },
  roles: { type: Schema.Types.ObjectId, ref: "Role" },
  // 0 男 1 女
  gender: { type: Number, default: 0 },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
});
adminSchema.add({
  balance: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: "",
  },
});

// 角色表
const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  Level: { type: String },
  id: {
    type: Number,
    unique: true,
    required: true,
  },
});

// // 权限表
// const permissionSchema = new Schema({
//   name: { type: String, required: true, unique: true },
//   description: { type: String, default: "0" },
//   subRoutes: [
//     // 子路由及其页面名称
//     {
//       name: { type: String, default: "" },
//       route: { type: String, default: "" },
//       child: [this], // 嵌套子路由
//     },
//   ],
// });

// 对模型方法进行扩展，例如添加验证密码的方法。
/**
 * 验证密码是否正确
 * @param {string} password - 用户输入的密码
 * @returns {boolean} - 密码验证结果
 */
adminSchema.methods.ValidatesPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// 在保存文档之前，对密码进行加密。
adminSchema.pre("save", async function (next) {
  const admin = this;
  // 只在创建新文档时增加 id
  if (this.isNew) {
    const counter = await Ids.findOneAndUpdate(
      { type: "adminId" },
      { $inc: { memberId: 1 } },
      { upsert: true, new: true }
    );
    admin.id = counter.memberId;
  }
  // 判断是新创建的文档还是密码字段被修改
  if (this.isNew || this.isModified("password")) {
    try {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      admin.password = hashedPassword;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    // 如果不是新文档且密码未被修改，则直接进入下一个中间件
    next();
  }
});
roleSchema.pre("save", async function (next) {
  const that = this;
  if (that.isNew) {
    const counter = await Ids.findOneAndUpdate(
      { type: "adminId" },
      { $inc: { roleId: 1 } },
      { upsert: true, new: true }
    );
    that.id = counter.roleId;
  }
  next();
});

// 创建并导出Admin模型
const Admin = db.model("Admin", adminSchema);
const Role = db.model("Role", roleSchema);
// const Permission = db.model("Permission", permissionSchema);
module.exports = { Admin, Role };
