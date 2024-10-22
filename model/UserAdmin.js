const { Schema, db } = require("./db");
const adminSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
});
const Admin = db.model("Admin", adminSchema);
module.exports = Admin;
