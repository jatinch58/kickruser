const Joi = require("joi");
const userdb = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const productdb = require("../models/products");
const subCategorydb = require("../models/subCategory");
const categorydb = require("../models/category");
const cartdb = require("../models/cart");
//===================================================user login========================================//
exports.loginUser = (req, res) => {
  try {
    const { body } = req;
    const phoneSchema = Joi.object()
      .keys({
        phone: Joi.string()
          .regex(/^[6-9]{1}[0-9]{9}$/)
          .required(),
      })
      .required();
    const result = phoneSchema.validate(body);
    if (result.error) {
      return res.status(400).send({ message: result.error.details[0].message });
    }
    axios
      .get(
        "https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/" +
          req.body.phone +
          "/AUTOGEN"
      )
      .then((response) => {
        return res.status(200).send(response.data);
      })
      .catch((er) => {
        return res.status(500).send({ message: er.name });
      });
  } catch (er) {
    return res.status(500).send({ message: er.name });
  }
};
///==========================================verify otp====================================//
exports.verifyOTP = async (req, res) => {
  try {
    const { body } = req;
    const otpSchema = Joi.object()
      .keys({
        details: Joi.string().required(),
        otp: Joi.number().max(999999).required(),
        phone: Joi.string()
          .regex(/^[6-9]{1}[0-9]{9}$/)
          .required(),
      })
      .required();
    const result = otpSchema.validate(body);
    if (result.error) {
      return res.status(400).send({ message: result.error.details[0].message });
    }
    axios
      .get(
        "https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/VERIFY/" +
          req.body.details +
          "/" +
          req.body.otp
      )
      .then(async (response) => {
        if (response.data.Details === "OTP Matched") {
          const isAlreadyRegistered = await userdb.findOne({
            phone: req.body.phone,
          });
          if (isAlreadyRegistered) {
            const p = isAlreadyRegistered._id.toString();
            const token = jwt.sign({ _id: p }, "123456", {
              expiresIn: "24h",
            });
            return res
              .status(200)
              .send({ message: "Welcome back", token: token });
          }
          const createUser = new userdb({
            phone: req.body.phone,
          });
          createUser
            .save()
            .then((a) => {
              const p = a._id.toString();
              const token = jwt.sign({ _id: p }, "123456", {
                expiresIn: "24h",
              });
              return res
                .status(200)
                .send({ message: "Registered successful", token: token });
            })
            .catch(() => {
              return res
                .status(500)
                .send({ message: "Something bad happened" });
            });
        } else if (response.data.Details === "OTP Expired") {
          return res.status(403).send({ message: "OTP Expired" });
        }
      })
      .catch((e) => {
        return res.status(400).send({ message: "OTP Invalid" });
      });
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=============================================update profile======================================//
exports.updateProfile = async (req, res) => {
  try {
    const user = await userdb.findById(req.user._id);
    if (user) {
      const { body } = req;
      const profileSchema = Joi.object()
        .keys({
          name: Joi.string().required(),
          dob: Joi.date().less("now").greater("01-01-1920").required(),
          gender: Joi.string().valid("male", "female", "other").required(),
          email: Joi.string().email().required(),
        })
        .required();
      const result = profileSchema.validate(body);
      if (result.error) {
        return res
          .status(400)
          .send({ message: result.error.details[0].message });
      }
      const updateUserProfile = await userdb.findByIdAndUpdate(req.user._id, {
        name: req.body.name,
        dob: req.body.dob,
        gender: req.body.gender,
        email: req.body.email,
      });
      if (updateUserProfile) {
        return res.status(200).send({ message: "Profile updated sucessfully" });
      } else {
        return res.status(404).send({ message: req.user._id + " not found" });
      }
    } else {
      return res.status(404).send({ message: req.user._id + " not found" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//====================================get profile================================================//
exports.getProfile = async (req, res) => {
  try {
    const myProfile = await userdb.findById(req.user._id, {
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
      _id: 0,
    });
    if (myProfile) {
      return res.status(200).send(myProfile);
    } else {
      return res.status(404).send({ message: req.user._id + " not found" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//===============================get product by sub category========================================//
exports.getProductBySubCategory = async (req, res) => {
  try {
    const product = await productdb.find(
      {
        productCategory: req.params.category,
        productSubCategory: req.params.subCategory,
      },
      {
        __v: 0,
        reviewedBy: 0,
        productReview: 0,
        numberOfReviews: 0,
        createdAt: 0,
        updatedAt: 0,
        demolink: 0,
        productDescription: 0,
        productSubCategory: 0,
        productImgUrl: 0,
        productCategory: 0,
        productStock: 0,
      }
    );
    if (product) {
      return res.status(200).send(product);
    } else {
      return res.status(404).send({ message: "Not found" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=======================================get sub category==========================================//
exports.getSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategorydb.find(
      { categoryName: req.params.category },
      { _id: 0, __v: 0, createdAt: 0, updatedAt: 0, categoryName: 0 }
    );
    if (subCategory) {
      return res.status(200).send(subCategory);
    } else {
      return res.status(404).send({
        message: "No sub-category found of category: " + req.params.category,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//===========================================get category============================================//
exports.getCategory = async (req, res) => {
  try {
    const category = await categorydb.find(
      {},
      { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    );
    if (category) {
      return res.status(200).send(category);
    } else {
      return res.status(404).send({
        message: "Not found",
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//========================================get product by id==========================================//
exports.getProductById = async (req, res) => {
  try {
    const product = await productdb.findById(req.params.id, {
      reviewedBy: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
      productCategory: 0,
      productSubCategory: 0,
    });
    if (product) {
      return res.status(200).send(product);
    } else {
      return res.status(404).send({
        message: "No product found of id: " + req.params.id,
      });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=====================================give review to product=========================//
exports.giveReview = async (req, res) => {
  try {
    const reviewSchema = Joi.object()
      .keys({
        review: Joi.number().max(5).min(1).required(),
      })
      .required();
    const validate = reviewSchema.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .send({ message: validate.error.details[0].message });
    } else {
      const product = await productdb.findOneAndUpdate(
        { _id: req.params.id, reviewedBy: { $nin: [req.user._id] } },
        {
          $inc: { numberOfReviews: 1, productReview: req.body.review },
          $push: { reviewedBy: req.user._id },
        }
      );
      if (product) {
        return res.status(200).send({
          message: "You have given " + req.body.review + " star sucessfully",
        });
      } else {
        return res.status(409).send({
          message: "You have already given review to this product",
        });
      }
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
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
