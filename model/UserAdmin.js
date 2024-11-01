// 引入数据库模式和数据库连接
const { Schema, db } = require("./db");
// 引入bcrypt模块用于密码加密
const bcrypt = require("bcrypt");
// 定义管理员数据模式
const adminSchema = new Schema({
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  // 0 普通用户 1 总管理员 2 家政代理
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
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
adminSchema.pre("save", function (next) {
  const admin = this;
  // 判断是新创建的文档还是密码字段被修改
  if (this.isNew || this.isModified("password")) {
    bcrypt.hash(admin.password, 10, function (err, hashedPassword) {
      if (err) return next(err);
      // 将明文密码替换为加密后的密码
      admin.password = hashedPassword;
      next();
    });
  } else {
    // 如果不是新文档且密码未被修改，则直接进入下一个中间件
    next();
  }
});

// 创建并导出Admin模型
const Admin = db.model("Admin", adminSchema);

module.exports = Admin;
