/*
 * @Author: Ue
 * @Date: 2022-04-19 03:02:37
 * @LastEditTime: 2022-04-20 23:23:16
 * @LastEditors: Ue
 * @FilePath: /work-space/backstage-management-server/routers/file_upload.js
 */
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const fullPath = path.join(__dirname, "..", "public/upload");

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    if (!fs.existsSync(fullPath)) {
      fs.mkdir(fullPath, function (err) {
        if (err) {
          console.log("Upload Error: \n", err.message);
          cb(err, fullPath);
        } else {
          cb(null, fullPath);
        }
      });
    } else {
      cb(null, fullPath);
    }
  },
  filename: function (req, file, cb) {
    let filename = file.fieldname + "-" + Date.now + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage }).single("image");

module.exports = function (router) {
  router.post("/manage/image/upload", (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.log("Error: ", err.message);
        res.send({
          status: 1,
          msg: "上传文件失败！",
        });
        return;
      }
      res.send({
        status: 0,
        data: {
          name: req.file.filename,
          url: "http://localhost:5000/upload/" + req.file.filename,
        },
      });
    });
  });

  router.post("/manage/img/delete", (req, res) => {
    const { name } = req.body;
    fs.unlink(path.join(fullPath, name), (err) => {
      if (err) {
        console.log("Error: ", err.message);
        res.send({
          status: 1,
          msg: "删除文件失败！",
        });
        return;
      }
      res.send({
        status: 0,
      });
    });
  });
};
