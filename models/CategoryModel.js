/*
 * @Author: Ue
 * @Date: 2022-04-18 15:07:45
 * @LastEditTime: 2022-04-18 15:33:46
 * @LastEditors: Ue
 * @FilePath: /work-space/backstage-management-server/models/CategoryModel.js
 */
const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  parentId: { type: String, required: true, default: "0" },
});

const CategoryModel = mongoose.model("categorys", categorySchema);

module.exports = CategoryModel;
