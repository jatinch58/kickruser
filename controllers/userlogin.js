const Joi = require("joi");
const userdb = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const productdb = require("../models/products");
const subCategorydb = require("../models/subCategory");
const categorydb = require("../models/category");
////////////////===================user login======================///////////
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
      res.status(400).send({ message: result.error.details[0].message });
    } else {
      axios
        .get(
          "https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/" +
            req.body.phone +
            "/AUTOGEN"
        )
        .then(function (response) {
          res.status(200).send(response.data);
        })
        .catch((er) => {
          res.status(500).send({ message: er.name });
        });
    }
  } catch (er) {
    res.status(500).send({ message: er.name });
  }
};
///==================verify otp===============//
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
      res.status(400).send({ message: result.error.details[0].message });
    } else {
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
              res.status(200).send({ message: "Welcome back", token: token });
            } else {
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
                  res
                    .status(200)
                    .send({ message: "Registered successful", token: token });
                })
                .catch(() => {
                  res.status(500).send({ message: "Something bad happened" });
                });
            }
          } else if (response.data.Details === "OTP Expired") {
            res.status(403).send({ message: "OTP Expired" });
          }
        })
        .catch((e) => {
          res.status(400).send({ message: "OTP Invalid" });
        });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//=====================update profile====================//
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
        res.status(400).send({ message: result.error.details[0].message });
      } else {
        const updateUserProfile = await userdb.findByIdAndUpdate(req.user._id, {
          name: req.body.name,
          dob: req.body.dob,
          gender: req.body.gender,
          email: req.body.email,
        });
        if (updateUserProfile) {
          res.status(200).send({ message: "Profile updated sucessfully" });
        } else {
          res.status(500).send({ message: "Something bad happened" });
        }
      }
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//==========================get profile=====================================//
exports.getProfile = async (req, res) => {
  try {
    const myProfile = await userdb.findById(req.user._id);
    if (myProfile) {
      res.status(200).send(myProfile);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getProductBySubCategory = async (req, res) => {
  try {
    const product = await productdb.find({
      productCategory: req.params.category,
      productSubCategory: req.params.subCategory,
    });
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategorydb.find(
      { categoryName: req.params.category },
      { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    );
    if (subCategory) {
      res.status(200).send(subCategory);
    } else {
      res.status(404).send({
        message: "No sub-category found of category: " + req.params.category,
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getCategory = async (req, res) => {
  try {
    const category = await categorydb.find(
      {},
      { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    );
    if (category) {
      res.status(200).send(category);
    } else {
      res.status(500).send({
        message: "Something bad happened",
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
