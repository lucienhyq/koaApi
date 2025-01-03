const { Admin, Role } = require("../model/UserAdmin");
const Ids = require("../model/ids");
class roleManager {
  async rootAdmin() {
    const rootRole = await Role.findOne({ name: "root" });
    const adminRes = await Admin.findOne({ username: "root" });
    //已经有管理员不新建
    if (adminRes) return;
    const admin = new Admin({
      username: "root",
      account: "root",
      phone: "",
      password: "123456",
      roleGrade: rootRole.Level,
      roles: rootRole._id,
    });
    await admin.save();
  }
  async initRole() {
    const rootRole = await Role.findOne({ name: "root" });
    //已经有管理员角色不新建
    if (rootRole) return;
    console.log(rootRole, "rootRole");
    const role = new Role({
      name: "root",
      Level: "0",
    });
    await role.save();
  }
  async init() {
    await this.initRole();
    await this.rootAdmin();
  }
}
module.exports = new roleManager();
