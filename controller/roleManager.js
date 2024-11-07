const { Role, Permission, Admin } = require("../model/UserAdmin");

/**
 * RoleManager类用于管理角色和权限
 */
class RoleManager {
  // 私有静态属性，存储唯一实例
  static instance;

  // 构造函数私有化，防止外部直接创建实例
  constructor() {
    if (RoleManager.instance) {
      throw new Error(
        "Use RoleManager.getInstance() to get the singleton instance."
      );
    }
    this.permissions = [];
    this.roles = [];
  }

  /**
   * 获取RoleManager的唯一实例
   * @returns {RoleManager} - 唯一的RoleManager实例
   */
  static getInstance() {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  /**
   * 初始化角色和权限
   */
  async init() {
    await this.initPermissions();
    await this.initRoles();
    await this.rootAdmin();
  }
  // 新增默认管理员
  async rootAdmin() {
    const rootAdmin = await Admin.findOne({ roleGrade: 1 });
    const rootRole = await Role.findOne({ name: "admin" });
    if (!rootAdmin) {
      const admin = new Admin({
        username: "root",
        phone: "",
        password: "123456",
        roleGrade: 1,
        roles: rootRole._id,
      });
      await admin.save();
    } else {
      console.log("有管理员");
      return;
    }
  }
  /**
   * 初始化权限，根据预定义的权限数组创建或更新权限文档
   */
  async initPermissions() {
    const permissions = [
      // 定义权限数组，包含各个权限的详细信息
      {
        name: "admin",
        description: "管理员权限",
        subRoutes: [
          {
            name: "home",
            pageName: "首页",
            child: [
              {
                name: "pcHomeIndex",
                route: "/pcHome/index",
                title: "首页",
              },
            ],
          },
          {
            name: "memberPage",
            pageName: "会员",
            child: [
              {
                name: "memberIndex",
                route: "/member/index",
                title: "会员",
              },
            ],
          },
        ],
      },
      {
        name: "user",
        description: "普通会员权限",
        subRoutes: [],
      },
      {
        name: "homework",
        description: "家政代理权限",
        subRoutes: [],
      },
      // 其他权限
    ];

    // 遍历权限数组，创建或更新数据库中的权限文档
    for (const permission of permissions) {
      await Permission.findOneAndUpdate({ name: permission.name }, permission, {
        upsert: true,
        new: true,
      });
    }

    // 从数据库中获取所有权限
    this.permissions = await Permission.find();
  }

  /**
   * 初始化角色，根据预定义的角色数组创建或更新角色文档，并关联权限
   */
  async initRoles() {
    const roles = [
      // 定义角色数组，包含角色名称和关联的权限
      {
        name: "admin",
        permissions: ["admin"],
        Level: 1,
      },
      {
        name: "user",
        permissions: [""],
        Level: 0,
      },
      {
        name: "homework",
        permissions: ["view_dashboard"],
        Level: 2,
      },
      // 其他角色
    ];

    // 遍历角色数组，创建或更新数据库中的角色文档，并关联相应的权限
    for (const role of roles) {
      const roleDoc = await Role.findOne({ name: role.name });
      if (!roleDoc) {
        // 如果角色不存在，则创建新角色并关联权限
        const newRole = new Role({ name: role.name });
        const savedRole = await newRole.save();

        const permissionDocs = await Permission.find({
          name: { $in: role.permissions },
        });
        savedRole.permissions.push(...permissionDocs);
        savedRole.Level = role.Level;
        await savedRole.save();
      } else {
        // 如果角色存在，则更新关联的权限
        const permissionDocs = await Permission.find({
          name: { $in: role.permissions },
        });
        roleDoc.permissions = permissionDocs;
        roleDoc.Level = role.Level;
        await roleDoc.save();
      }
    }

    // 从数据库中获取所有角色，并填充其关联的权限
    this.roles = await Role.find().populate("permissions");
  }

  /**
   * 根据角色名称获取角色对象
   * @param {string} name - 角色名称
   * @returns {Object} - 角色对象
   */
  getRoleByName(name) {
    return this.roles.find((role) => role.name === name);
  }

  /**
   * 根据权限名称获取权限对象
   * @param {string} name - 权限名称
   * @returns {Object} - 权限对象
   */
  getPermissionByName(name) {
    return this.permissions.find((permission) => permission.name === name);
  }

  /**
   * 获取指定角色拥有的权限
   * @param {string} roleName - 角色名称
   * @returns {Array} - 权限数组
   */
  getPermissionsForRole(roleName) {
    const role = this.getRoleByName(roleName);
    if (role) {
      return role.permissions.map((permission) => ({
        name: permission.name,
        subRoutes: permission.subRoutes,
      }));
    }
    return [];
  }
}

module.exports = RoleManager;
