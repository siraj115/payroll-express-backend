const express = require("express");
const router = express.Router();


const UserModule = require("../modules/UserModule");//user module


router.get("/listuser", UserModule.listUser);  
router.post("/saveuser", UserModule.saveUser);  

module.exports = router;
