const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const user = require("../controllers/userlogin");
router.post("/user/login_with_phone", user.loginUser);
router.post("/user/verifyOTP", user.verifyOTP);
router.put("/user/updateProfile", verifyToken, user.updateProfile);
router.get("/user/myProfile", verifyToken, user.getProfile);
router.get(
  "/user/getProductBySubCategory/:category/:subCategory",
  verifyToken,
  user.getProductBySubCategory
);
router.get("/user/getCategory", verifyToken, user.getCategory);
router.get("/user/getSubCategory/:category", verifyToken, user.getSubCategory);
router.get("/user/getProductById/:id", verifyToken, user.getProductById);
router.put("/user/giveReview/:id", verifyToken, user.giveReview);
router.put("/user/addToCart", verifyToken, user.addToCart);
router.get("/user/getCart", verifyToken, user.getCart);
router.put("/user/removeItemFromCart", verifyToken, user.removeItemFromCart);
router.put("/user/reduceItemFromCart", verifyToken, user.reduceItemFromCart);

module.exports = router;
