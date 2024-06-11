const express = require("express");
const multer = require("multer");
const router = express.Router();
const jwtMiddleware = require('../middleware/middleware')

const ClientModule = require("../modules/ClientModule");//user module test
// Files upload 

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post("/saveclient", ClientModule.saveClient);  
router.get("/getclient/:clientid", ClientModule.getClient);  
router.post("/saveclientcontract", upload.single('contractpdf[]'), ClientModule.saveClientContract);  
router.get("/getclientcontract/:clientid", ClientModule.getClientContract);  
router.get("/listclient", ClientModule.allclients);  


module.exports = router;