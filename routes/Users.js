const express = require("express");
const router = express.Router();


var UserModule = require("../modules/UserModule");


router.get("/listuser", UserModule.listUser);  

module.exports = router;
