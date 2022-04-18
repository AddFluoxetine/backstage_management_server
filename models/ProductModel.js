/*
 * @Author: Ue
 * @Date: 2022-04-18 15:11:12
 * @LastEditTime: 2022-04-18 16:48:19
 * @LastEditors: Ue
 * @FilePath: /work-space/backstage-management-server/models/ProductModel.js
 */
const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  categoryId: { type: String, required: true },
  pCategoryId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String },
  status: { type: Number, default: 1 },
  imgs: { type: Array, default: [] },
  detail: { type: String },
});

const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;
