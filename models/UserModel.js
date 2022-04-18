/*
 * @Author: Ue
 * @Date: 2022-04-18 15:12:40
 * @LastEditTime: 2022-04-18 18:15:05
 * @LastEditors: Ue
 * @FilePath: /work-space/backstage-management-server/models/UserModel.js
 */
const mongoose = require("mongoose");
const md5 = require("blueimp-md5");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone: String,
  email: String,
  create_time: { type: Number, default: Date.now },
  role_id: String,
});

const UserModel = mongoose.model("users", userSchema);

UserModel.findOne({ username: "admin" }).then(
  (user) => {
    if (!user) {
      UserModel.create({ username: "admin", password: md5("admin") }).then(
        (user) => {
          const username = `username: ${user.username}\n`;
          const password = `password: ${user.password}`;
          const message = username + password;
          console.log(`初始化用户：\n${message}`);
        },
        (err) => {
          console.log("初始化用户失败！\n", err);
        }
      );
    }
  },
  (err) => {
    console.log("Error: ", err);
  }
);
