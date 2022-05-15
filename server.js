/*
 * @Author: Ue
 * @Date: 2022-04-06 11:39:29
 * @LastEditTime: 2022-05-15 10:06:21
 * @LastEditors: Ue
 * @FilePath: /backstage-management-server/server.js
 */
const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routers");

const app = express();
const URL = "mongodb://localhost:27017/Server_DB";

app.use(express.static("public"));
// {extend: true}使用qs模块解析查询字符串 (false表示使用qurrystring模块)
app.use(express.urlencoded({ extend: true }));
app.use(express.json());
app.use(cookieParser());
app.use(indexRouter);

// 非法路由统一处理
app.use((req, res) => {
  fs.readFile(__dirname + "/no_matches/index.html", (err, data) => {
    if (err) {
      console.log("Error: ", err.message);
      res.status(404).end("File Not Found!");
      return;
    }
    res.status(404).end(data);
  });
});

// 监听数据库连接状态
mongoose.connection.on("connecting", () => {
  console.log("Connecting to the database ...");
});

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to the database!");
});

mongoose.connection.on("disconnecting", () => {
  console.log("Disconnecting to the database ...");
});

mongoose.connection.on("disconnected", () => {
  console.log("Failed to connect to the database!");
});

// 数据库首次连接开启服务器
mongoose.connection.once("open", () => {
  app.listen("5000", () => {
    console.log("Server running at http://localhost:5000/");
  });
});

// 连接数据库
mongoose.connect(URL, { useNewUrlParser: true }).catch((err) => {
  console.warn("First trying to connect to the database failed!");
  console.log("Error: ", err.message);
});
