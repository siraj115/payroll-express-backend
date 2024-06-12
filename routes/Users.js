
const express = require("express");
const multer = require("multer");
const router = express.Router();
const jwtMiddleware = require('../middleware/middleware')

const UserModule = require("../modules/UserModule");//user module test
// Files upload 

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cpUpload = upload.fields([{ name: 'passportupload[]' }, { name: 'visaupload[]' }, { name: 'eidupload[]' }, { name: 'labourcardupload[]' }])

router.post("/saveuser", jwtMiddleware, upload.single('userphoto[]'), UserModule.saveUser);  
router.get("/getuser/:empid", jwtMiddleware, UserModule.getUser);
router.post("/savebasicdetails", jwtMiddleware,cpUpload, UserModule.savebasicdetails);    
router.get("/getuserbasic/:empid", jwtMiddleware, UserModule.getUserBasic);  

router.post("/login", UserModule.login);  
//jwtMiddleware,
router.get("/listuser", jwtMiddleware, UserModule.listUser);  


module.exports = router;
