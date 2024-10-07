const express = require("express")
const {connectDb} = require("./config/database")
const {UserModel} = require("./models/user")
const {excludeUpdates} = require("./utils/enums")
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt")
require("dotenv").config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req)
    let {firstName, lastName, emailId, password, age, gender} = req.body
    let hashedPassword = await bcrypt.hash(password, 10)
    const user = new UserModel({firstName, lastName, emailId, password: hashedPassword})
    await user.save()
    res.status(201).send("user created successfuly")
  } catch (err) {
    res.status(400).send("ERROR : " + err.message)
  }
})

app.post("/login", async (req, res) => {
  try {
    let {emailId, password} = req.body
    let user = await UserModel.findOne({emailId})
    if (!user) {
      res.status(400).send("invalid credentials")
    }
    let isValidPassoword = await bcrypt.compare(password, user.password)
    if (!isValidPassoword) {
      res.status(400).send("invalid credentials")
    }
    res.status(200).send("user logged in")
  } catch {
    ;(err) => res.status(400).send("Error: " + err.message)
  }
})

app.get("/user", async (req, res) => {
  try {
    let {emailId} = req.body
    let user = await UserModel.findOne({emailId})
    res.json(user)
  } catch (error) {
    console.log("error occured while getting user", error.message)
    res.send("Something went wrong")
  }
})

app.patch("/user/:_id", async (req, res) => {
  try {
    let {_id} = req.params
    let isUpdateAllowed = Object.keys(req.body).every((k) => !excludeUpdates.includes(k))
    if (!isUpdateAllowed) {
      return res.status(400).send("Update not allowed")
    }
    let updatedUser = await UserModel.findByIdAndUpdate({_id}, req.body, {returnDocument: "after", runValidators: true})
    res.send(`user updated successfuly ${JSON.stringify(updatedUser)}`)
  } catch (error) {
    console.log("error occured while updating user", error.message)
    res.send("Something went wrong")
  }
})
app.delete("/user/:_id", async (req, res) => {
  try {
    let {_id} = req.params
    let user = await UserModel.findByIdAndDelete(_id)
    console.log("user deleted successfuly")
    res.json(user)
  } catch (error) {
    console.log("error occured while deleting users", error.message)
    res.send("Something went wrong")
  }
})

app.get("/feed", async (req, res) => {
  try {
    let users = await UserModel.find({})
    res.json(users)
  } catch (error) {
    console.log("error occured while getting users", error.message)
    res.send("Something went wrong")
  }
})

connectDb()
  .then(() => {
    console.log("connected to db")
    app.listen(process.env.PORT, () => {
      console.log(`server is listening at port ${process.env.PORT}....`)
    })
  })
  .catch((err) => {
    console.log("Error occured while connecting to db", err)
    process.exit(1)
  })
