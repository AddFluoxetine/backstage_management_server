/*
 * @Author: Ue
 * @Date: 2022-04-18 15:12:27
 * @LastEditTime: 2022-04-18 16:59:47
 * @LastEditors: Ue
 * @FilePath: /work-space/backstage-management-server/models/RoleModel.js
 */
const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
  name: { type: String, required: true },
  auth_name: String,
  auth_time: Number,
  create_time: { type: Number, default: Date.now },
  menus: Array,
});

const RoleModel = mongoose.model("roles", roleSchema);

module.exports = RoleModel;
