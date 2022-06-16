const express = require("express");
const router = express.Router();
const userRoutes = require("./user");
const cartRoutes = require("./cart");
router.use(userRoutes);
router.use(cartRoutes);
module.exports = router;
