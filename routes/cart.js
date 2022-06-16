const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const cart = require("../controllers/cart");
router.put("/user/addToCart", verifyToken, cart.addToCart);
router.get("/user/getCart", verifyToken, cart.getCart);
router.put("/user/removeItemFromCart", verifyToken, cart.removeItemFromCart);
router.put("/user/reduceItemFromCart", verifyToken, cart.reduceItemFromCart);

module.exports = router;
