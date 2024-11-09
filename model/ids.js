const { Schema, db } = require("../utils/db");

const idsSchema = new Schema({
  type: { type: String, default: "adminId" },
  memberId: { type: Number, default: 0 },
  homeWorkMaidId: { type: Number, default: 0 },
  homeWorkAgencyId: { type: Number, default: 0 },
});

const ids = db.model("ids", idsSchema);

module.exports = ids;
