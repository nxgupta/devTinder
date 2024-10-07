const jwt = require("jsonwebtoken")
const {UserModel} = require("../models/user")
let userAuth = async (req, res, next) => {
  try {
    let {token} = req.cookies
    if (!token) {
      throw new Error("user is not authenticated")
    }
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET)
    let {_id} = decodedData
    if (_id) {
      let user = await UserModel.findById(_id)
      if (!user) {
        throw new Error("user is not found")
      }
      req.user = user
      next()
    } else {
      throw new Error("user is not authenticated")
    }
  } catch (error) {
    res.status(400).send("Error:" + error.message)
  }
}

module.exports = {
  userAuth,
}
