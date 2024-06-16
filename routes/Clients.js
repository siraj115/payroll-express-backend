const express = require("express");
const multer = require("multer");
const router = express.Router();
const jwtMiddleware = require('../middleware/middleware')

const ClientModule = require("../modules/ClientModule");//user module test
// Files upload 

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post("/saveclient", jwtMiddleware, ClientModule.saveClient);  
router.get("/getclient/:clientid", jwtMiddleware, ClientModule.getClient);  
router.post("/saveclientcontract", jwtMiddleware, upload.single('contractpdf[]'), ClientModule.saveClientContract);  
router.get("/getclientcontract/:clientid", jwtMiddleware, ClientModule.getClientContract);  
router.get("/listclient", jwtMiddleware,ClientModule.allclients);  
router.get("/allclientnames", jwtMiddleware,ClientModule.allClientNames);  
router.get("/getclientdetails/:clientid", ClientModule.getClientalldetails);  
router.post("/assignemployee", ClientModule.assignEmployee);  


module.exports = router;