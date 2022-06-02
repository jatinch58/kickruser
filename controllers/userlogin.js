const Joi = require("joi");
const userdb = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
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
