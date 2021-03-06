/*
 * @Author: Ue
 * @Date: 2022-04-19 03:02:05
 * @LastEditTime: 2022-06-11 20:45:12
 * @LastEditors: Ue
 * @FilePath: /backstage-management-server/routers/index.js
 */
const express = require("express");
const md5 = require("blueimp-md5");

const UserModel = require("../models/UserModel");
const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");
const RoleModel = require("../models/RoleModel");

const router = express.Router();
const filter = { password: 0, __v: 0 };

// 登录
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  UserModel.findOne({ username, password: md5(password) })
    .then(async (user) => {
      if (user) {
        // 设置一个有效期为24小时的cookie
        res.cookie("userid", user._id, { maxAge: 1000 * 60 * 60 * 24 });
        if (user.role_id) {
          const role = await RoleModel.findOne({ _id: user.role_id });
          user._doc.role = role;
          console.log("role user: ", user);
          res.send({ status: 0, data: user });
        } else {
          user._doc.role = { menus: [] };
        }
        // 登录成功
        res.send({ status: 0, data: user });
      } else {
        // 登录失败
        res.send({ status: 1, msg: "用户名或密码不正确！" });
      }
    })
    .catch((error) => {
      console.error("登录异常", error);
      res.send({ status: 1, msg: "登录异常，请稍后重试！" });
    });
});

// 添加用户
router.post("/manage/user/add", (req, res) => {
  const { username, password } = req.body;
  // 查询用户是否已存在
  UserModel.findOne({ username })
    .then((user) => {
      if (user) {
        res.send({ status: 1, msg: "此用户已存在！" });
        // 终止链式调用
        return new Promise(() => {});
      } else {
        return UserModel.create({
          ...req.body,
          password: md5(password || "Fraud"),
        });
      }
    })
    .then((user) => {
      res.send({ status: 0, data: user });
    })
    .catch((error) => {
      console.error("注册异常！", error);
      res.send({ status: 1, msg: "添加用户异常，请重试！" });
    });
});

// 更新用户
router.post("/manage/user/update", (req, res) => {
  const user = req.body;
  UserModel.findOneAndUpdate({ _id: user._id }, user);
  then((oldUser) => {
    const data = Object.assign(oldUser, user);
    res.send({ status: 0, data });
  }).catch((error) => {
    console.error("更新用户异常！", error);
    res.send({ status: 1, msg: "更新用户异常，请尝试！" });
  });
});

// 删除用户
router.post("/manage/user/delete", (req, res) => {
  const { userId } = req.body;
  UserModel.deleteOne({ _id: userId })
    .then((doc) => {
      res.send({ status: 0 });
    })
    .catch((error) => {
      console.error("删除用户异常！", error);
      res.send({ status: 1, msg: "删除用户异常，请重试！" });
    });
});

// 获取用户信息的路由(根据cookie中的userid)
router.get("/user", (req, res) => {
  const userid = req.cookies.userid;
  if (!userid) {
    res.send({ status: 1, msg: "请先登录！" });
    return;
  }
  UserModel.findOne({ _id: userid }, filter)
    .then((user) => {
      if (user) {
        res.send({ status: 0, data: user });
        return;
      }
      res.clearCookie("userid");
      res.send({ status: 1, msg: "请先登录！" });
    })
    .catch((error) => {
      console.error("获取用户异常", error);
      res.send({ status: 1, msg: "获取用户异常，请重试！" });
    });
});

// 获取所有用户列表
router.get("/manage/user/list", (req, res) => {
  UserModel.find({ username: { $ne: "admin" } })
    .then(async (users) => {
      const roles = await RoleModel.find();
      res.send({ status: 0, data: { users, roles } });
    })
    .catch((error) => {
      console.error("获取用户列表异常！", error);
      res.send({ status: 1, msg: "获取用户列表异常，请重试！" });
    });
});

// 添加分类
router.post("/manage/category/add", (req, res) => {
  const { categoryName, parentId } = req.body;
  CategoryModel.create({ name: categoryName, parentId: parentId || "0" })
    .then((category) => {
      res.send({ status: 0, data: category });
    })
    .catch((error) => {
      console.error("添加分类异常", error);
      res.send({ status: 1, msg: "添加分类异常，请重新尝试！" });
    });
});

// 获取分类列表
router.get("/manage/category/list", (req, res) => {
  const parentId = req.query.parentId || "0";
  CategoryModel.find({ parentId })
    .then((categorys) => {
      res.send({ status: 0, data: categorys });
    })
    .catch((error) => {
      console.error("获取分类列表异常", error);
      res.send({ status: 1, msg: "获取分类列表异常，请重试！" });
    });
});

// 更新分类名称
router.post("/manage/category/update", (req, res) => {
  const { categoryId, categoryName } = req.body;
  CategoryModel.findOneAndUpdate({ _id: categoryId }, { name: categoryName })
    .then((oldCategory) => {
      if (!oldCategory) {
        res.send({
          status: 1,
          msg: "未查询到对应id分类！请确认输入的id是否存在！",
        });
      } else {
        const data = Object.assign(oldCategory, { name: categoryName });
        res.send({ status: 0, data });
      }
    })
    .catch((error) => {
      console.error("更新分类名称异常！", error);
      res.send({ status: 1, msg: "更新分类名称异常，请重新尝试！" });
    });
});

// 根据分类ID获取分类
router.get("/manage/category/info", (req, res) => {
  const categoryId = req.query.categoryId;
  CategoryModel.findOne({ _id: categoryId })
    .then((category) => {
      res.send({ status: 0, data: category });
    })
    .catch((error) => {
      console.error("获取分类信息异常", error);
      res.send({ status: 1, msg: "获取分类信息异常，请重试！" });
    });
});

// 删除分类
router.post("/manage/category/delete", (req, res) => {
  const { categoryId } = req.body;
  CategoryModel.findOneAndDelete({ _id: categoryId })
    .then((category) => {
      if (!category) {
        res.send({
          status: 1,
          msg: "未查询到对应id分类！请确认输入的id是否存在！",
        });
      } else {
        res.send({ status: 0, data: category });
      }
    })
    .catch((error) => {
      console.error("删除分类功能异常", error);
      res.send({ status: 1, msg: "删除分类功能异常，请重试！" });
    });
});

// 添加产品
router.post("/manage/product/add", (req, res) => {
  const product = req.body;
  ProductModel.create(product)
    .then((product) => {
      res.send({ status: 0, data: product });
    })
    .catch((error) => {
      console.error("添加产品异常！", error);
      res.send({ status: 1, msg: "添加产品异常，请重试！" });
    });
});

// 获取产品分页列表
router.get("/manage/product/list", (req, res) => {
  const { pageNum, pageSize } = req.query;
  ProductModel.find({})
    .then((products) => {
      res.send({ status: 0, data: pageFilter(products, pageNum, pageSize) });
    })
    .catch((error) => {
      console.error("获取商品列表异常！", error);
      res.send({ status: 1, msg: "获取商品列表异常，请重试！" });
    });
});

// 搜索产品列表
router.get("/manage/product/search", (req, res) => {
  const { pageNum, pageSize, productName, productDesc } = req.query;
  let condition = {};
  if (productName) {
    condition = { name: new RegExp(`^.*${productName}.*$`) };
  } else {
    condition = { desc: new RegExp(`^.*${productDesc}.*$`) };
  }
  ProductModel.find(condition)
    .then((products) => {
      res.send({ status: 0, data: pageFilter(products, pageNum, pageSize) });
    })
    .catch((error) => {
      console.error("搜索商品列表异常！", error);
      res.send({ status: 1, msg: "搜索商品列表异常，请重试！" });
    });
});

// 更新产品
router.post("/manage/product/update", (req, res) => {
  const product = req.body;
  ProductModel.findOneAndUpdate({ _id: product._id }, product)
    .then((oldProduct) => {
      const data = Object.assign(oldProduct, product);
      res.send({ status: 0, data });
    })
    .catch((error) => {
      console.error("更新商品异常", error);
      res.send({ status: 1, msg: "更新商品名称异常，请重试！" });
    });
});

// 更新产品状态(上架/下架)
router.post("/manage/product/updateStatus", (req, res) => {
  const { productId, status } = req.body;
  ProductModel.findOneAndUpdate({ _id: productId }, { status })
    .then((oldProduct) => {
      const data = Object.assign(oldProduct, { status });
      res.send({ status: 0, data });
    })
    .catch((error) => {
      console.error("更新产品状态异常！", error);
      res.send({ status: 1, msg: "更新产品状态异常，请重试！" });
    });
});

// 添加角色
router.post("/manage/role/add", (req, res) => {
  const { roleName } = req.body;
  RoleModel.create({ name: roleName })
    .then((role) => {
      res.send({ status: 0, data: role });
    })
    .catch((error) => {
      console.error("添加角色异常！", error);
      res.send({ status: 1, msg: "添加角色异常，请重试！" });
    });
});

// 获取角色列表
router.get("/manage/role/list", (req, res) => {
  RoleModel.find()
    .then((roles) => {
      res.send({ status: 0, data: roles });
    })
    .catch((error) => {
      console.error("获取角色列表异常！", error);
      res.send({ status: 1, msg: "获取角色列表异常，请重试！" });
    });
});

// 更新角色(设置权限)
router.post("/manage/role/update", (req, res) => {
  const role = req.body;
  role.auth_time = Date.now();
  RoleModel.findOneAndUpdate({ _id: role._id }, role)
    .then((oldRole) => {
      res.send({ status: 0, data: { ...oldRole._doc, ...role } });
    })
    .catch((error) => {
      console.error("更新角色异常!", error);
      res.send({ status: 1, msg: "更新角色异常，请重试！" });
    });
});

// 得到指定数组的分页信息对象
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1;
  pageSize = pageSize * 1;
  const total = arr.length;
  // 向下取整
  const pages = Math.floor((total + pageSize - 1) / pageSize);
  const start = pageSize * (pageNum - 1);
  const end = start + pageSize <= total ? start + pageSize : total;
  const list = [];
  for (let i = start; i < end; i++) {
    list.push(arr[i]);
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list,
  };
}

// 文件上传
require("./file_upload")(router);

module.exports = router;
