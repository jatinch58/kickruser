const Joi = require("joi");
const cartdb = require("../models/cart");
//=============================add to cart==========================================//
exports.addToCart = async (req, res) => {
  try {
    const cartSchema = Joi.object()
      .keys({
        productId: Joi.string().hex().length(24).required(),
      })
      .required();
    const validate = cartSchema.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .send({ message: validate.error.details[0].message });
    } else {
      cartdb
        .findOneAndUpdate(
          { cartBy: req.user._id },
          { cartBy: req.user._id },
          { upsert: true, new: true }
        )
        .exec(function (err, doc) {
          if (err) {
            return res.status(500).send({ message: err.name });
          } else {
            const item = doc.cart.findIndex(
              (item) => item.productId == req.body.productId
            );
            if (item !== -1) {
              doc.cart[item].quantity += 1;
            } else {
              doc.cart.push({ productId: req.body.productId, quantity: 1 });
            }

            doc.save().then((e) => {
              return res.status(200).send({
                message: "Item added to the cart sucessfully",
              });
            });
          }
        });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=========================================get Cart========================================//
exports.getCart = async (req, res) => {
  try {
    const cart = await cartdb
      .findOne(
        { cartBy: req.user._id },
        { __v: 0, _id: 0, cartBy: 0, "cart._id": 0 }
      )
      .populate("cart.productId", {
        productImgUrl: 0,
        totalReview: 0,
        productCategory: 0,
        productSubCategory: 0,
        demolink: 0,
        reviewedBy: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });
    if (cart) {
      return res.status(200).send(cart);
    }
  } catch (e) {
    return res.status(400).send({ message: e.name });
  }
};

//=========================================remove item from the cart=========================//
exports.removeItemFromCart = async (req, res) => {
  try {
    const removeItem = Joi.object()
      .keys({
        productId: Joi.string().hex().length(24).required(),
      })
      .required();
    const validate = removeItem.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .send({ message: validate.error.details[0].message });
    } else {
      const remove = await cartdb.findOneAndUpdate(
        { cartBy: req.user._id },
        {
          $pull: { cart: { productId: req.body.productId } },
        }
      );
      if (remove) {
        return res.status(200).send({ message: "item removed sucessfully" });
      } else {
        return res.status(500).send({ message: "Something bad happenned" });
      }
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=================================reduce item from the cart===================================//
exports.reduceItemFromCart = async (req, res) => {
  try {
    const reduceItem = Joi.object()
      .keys({
        productId: Joi.string().required(),
      })
      .required();
    const validate = reduceItem.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .send({ message: validate.error.details[0].message });
    }
    cartdb
      .findOne({ cartBy: req.user._id, "cart.productId": req.body.productId })
      .exec(function (err, cart) {
        if (err) {
          return res.status(500).send({ message: "Something bad happenned" });
        }
        if (!cart) {
          return res
            .status(404)
            .send({ message: "Given Id not found in cart" });
        }
        const val = cart.cart.findIndex(
          (item) => item.productId == req.body.productId
        );
        if (val === -1) {
          return res.status(404).send({ message: "Product not found" });
        }
        if (cart.cart[val].quantity == 1) {
          cart.cart.splice(val, 1);
        } else {
          cart.cart[val].quantity--;
        }
        cart.save().then((e) => {
          return res.status(200).send({
            message: "Item reduced sucessfully",
          });
        });
      });
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
