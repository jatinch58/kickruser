const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const user = require("../controllers/userlogin");
router.post("/user/login_with_phone", user.loginUser);
router.post("/user/verifyOTP", user.verifyOTP);
router.put("/user/updateProfile", verifyToken, user.updateProfile);
router.get("/user/myProfile", verifyToken, user.getProfile);
module.exports = router;
