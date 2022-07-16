const Joi = require("joi");
const userdb = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const productdb = require("../models/products");
const subCategorydb = require("../models/subCategory");
const categorydb = require("../models/category");
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
      { category: req.params.category },
      { __v: 0, createdAt: 0, updatedAt: 0, categoryName: 0 }
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
      { __v: 0, createdAt: 0, updatedAt: 0 }
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
        comment: Joi.string(),
      })
      .required();
    const validate = reviewSchema.validate(req.body);
    if (validate.error) {
      return res
        .status(400)
        .send({ message: validate.error.details[0].message });
    } else {
      const product = await productdb.findOneAndUpdate(
        {
          _id: req.params.id,
          productReview: {
            $not: { $elemMatch: { reviewBy: req.user._id } },
          },
        },
        {
          $push: {
            productReview: {
              review: req.body.review,
              reviewBy: req.user._id,
              comment: req.body.comment,
            },
          },
        }
      );
      if (product) {
        return res.status(200).send({
          message: "Done",
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

exports.canReview = async (req, res) => {
  try {
    const product = await productdb.findOne({
      _id: req.params.id,
      productReview: {
        $not: { $elemMatch: { reviewBy: req.user._id } },
      },
    });
    if (product) {
      return res.status(200).send({
        message: "yes",
      });
    } else {
      return res.status(409).send({
        message: "no",
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.start || !req.query.end) {
      return res
        .status(400)
        .send({ message: "Please provide productId, start and end" });
    }
    const review = await productdb.findById(req.query.productId, {
      productReview: {
        $slice: [Number(req.query.start), Number(req.query.end)],
      },
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
      productName: 0,
      productOfferPrice: 0,
      productPrice: 0,
      productCategory: 0,
      productSubCategory: 0,
      productDescription: 0,
      productStock: 0,
      productMainImgUrl: 0,
      productImgUrl: 0,
      demolink: 0,
    });
    if (review) {
      res.status(200).send(review);
    } else {
      res
        .status(404)
        .send({ message: "No product found of id: " + req.params.productId });
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
};
exports.getProductRatings = async (req, res) => {
  try {
    const product = await productdb.findById(req.params.id);
    if (product) {
      const result = {
        star1: 0,
        star2: 0,
        star3: 0,
        star4: 0,
        star5: 0,
        overall: 0,
        numberOfReview: 0,
      };
      product.productReview.map((val) => {
        if (val.review === 1) result.star1 = result.star1 + 1;
        else if (val.review === 2) result.star2 = result.star2 + 1;
        else if (val.review === 3) result.star3 = result.star3 + 1;
        else if (val.review === 4) result.star4 = result.star4 + 1;
        else if (val.review === 5) result.star5 = result.star5 + 1;
        result.overall += val.review;
      });
      result.numberOfReview = product.productReview.length;
      result.overall = result.overall / product.productReview.length;
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "not found" });
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
};
