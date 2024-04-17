const express = require("express");
const router = express.Router();


var UserModule = require("../modules/UserModule");


router.get("/listuser", UserModule.listUser);  
router.post("/saveuser", UserModule.saveUser);  

module.exports = router;
