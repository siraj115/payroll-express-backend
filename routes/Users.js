const express = require("express");
const router = express.Router();
const jwtMiddleware = require('../middleware/middleware')

const UserModule = require("../modules/UserModule");//user module test

router.post("/saveuser", UserModule.saveUser);  
router.post("/login", UserModule.login);  

router.get("/listuser", jwtMiddleware, UserModule.listUser);  


module.exports = router;
