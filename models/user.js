const {type} = require("express/lib/response")
const mongoose = require("mongoose")
const {allowedGenders} = require("../utils/enums")
const validator = require("validator")
let userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 8,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate: [
        (value) => {
          return validator.isEmail(value)
        },
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      validate: [
        (value) => {
          return validator.isStrongPassword(value)
        },
        "Please enter a valid password",
      ],
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enums: allowedGenders,
      validate(value) {
        if (!allowedGenders.includes(value)) {
          throw new Error("Entered gender is not allowed")
        }
      },
    },
    about: {
      type: String,
      default: "default about",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      validate: [
        (value) => {
          return value.length <= 3
        },
        `only 3 skills allowed`,
      ],
    },
  },
  {
    timestamps: true,
  }
)

const UserModel = mongoose.model("user", userSchema)
module.exports = {
  UserModel,
}
