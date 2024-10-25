const { Schema, db } = require("./db");
const bcrypt = require("bcrypt");
const adminSchema = new Schema({
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  role: { type: Number, default: 0 },
  // 0 男 1 女
  gender: { type: Number, default: 0 },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
});
adminSchema.add({
  balance: { type: Number, default: 0 },
});
// 对模型方法进行扩展，例如添加验证密码的方法。
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

const Admin = db.model("Admin", adminSchema);

module.exports = Admin;
