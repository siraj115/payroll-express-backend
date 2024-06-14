const {db} = require('../connection')
const {Clients} = require('../model/Clients')
const {ClientContractDetails} = require('../model/ClientContractDetails')

require("dotenv").config({ path: `./.env.dev` });
const {generateRefreshToken, generateToken} = require('../services/jwt')

const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


const sharp = require('sharp')
const {randomName} = require('../services/commonServices')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey  = process.env.SECRET_ACCESS_KEY
const fileExpirySession  = process.env.FILE_EXPIRY_SESSION


const s3 = new S3Client({
    credentials:{
        accessKeyId: accessKey,
        secretAccessKey
    },
    region: bucketRegion
})
exports.saveClient = async (req,res)=>{
    //console.log(req.body)
    const {companyname,contactname,contactphone,contactemail,address,companytrn,login_userid,id } = req.body;
    let errortype = 2;
    let statuscode = 400;
    let msg = 'ALl fields are mandatory';
    let clientid = id;

    const client_json = {
        companyname,contactname,contactphone,contactemail,address,companytrn
    }
    let type='insert'
    if(clientid ==null){
        if(companyname != '' && contactname != '' && contactphone != '' && contactemail != '' && address != '' && companytrn!=''){
            
            client_json.created_by =login_userid;
            client_json.updated_by = login_userid;
            console.log(client_json)
            usersdetails = new Clients(client_json)
            await usersdetails.save();
            errortype = 1;
            statuscode = 200;
            msg = 'Successfully saved client details';
            clientid = usersdetails.id;
        }
    }else{
        type='update'
        client_json.updated_by = login_userid;
        //console.log(user_json)
        const userExist = await Clients.query().where('id',clientid).update(client_json)
        errortype       = 1;
        statuscode      = 200;
        msg             = "Successfully updated client details";
        //userid          = userid;
    }
    res.status(statuscode).json({msg, errortype,clientid,type})
}

exports.getClient = async(req,res)=>{
    try{
        const {clientid} = req.params;
        if(clientid!=null){
            const clientExist = await Clients.query().where('id',clientid).first()
            
            return res.status(200).json({data:clientExist})
        }else{
            return res.status(500).json({msg:'Cient ID cannot be null'})    
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}

exports.saveClientContract = async (req,res)=>{
    const {contractstart, contractend, contractprice, countmale, countfemale, countsupervisor, amountmale, amountfemale, amountsupervisor, vattax, clientid, id , login_userid} = req.body;
    let errortype = 2;
    let statuscode = 400;
    let msg = 'ALl fields are mandatory';

    const client_json = {
        contractstart, contractend, contractprice, countmale, countfemale, countsupervisor, amountmale, amountfemale, amountsupervisor, vattax
    }
    console.log(client_json)
    if(contractstart != '' &&  contractend != '' &&  contractprice != '' &&  countmale != '' &&  countfemale != '' &&  countsupervisor != '' &&  amountmale != '' &&  amountfemale != '' &&  amountsupervisor != '' &&  vattax != '' ){
        const clientContractExist = await ClientContractDetails.query().where('clientid',clientid).first()
        
        if(req.file){

            if(clientContractExist?.contractpdf){
                const delParams = {
                    Bucket: bucketName,
                    Key: clientContractExist.contractpdf
                }
                const command = new DeleteObjectCommand(delParams)
                await s3.send(command)
            }

            imageName =  randomName(); 
            const buffer_img = req.file.buffer;
            const params = {
                Bucket: bucketName,
                Key: imageName,
                Body: buffer_img,
                ContentType: req.file.mimetype
            }
            const command = new PutObjectCommand(params)
            await s3.send(command)
            client_json.contractpdf = imageName
        }
       console.log(clientContractExist)
        if(clientContractExist != null){
            client_json.updated_by = login_userid;
            await ClientContractDetails.query().where('clientid',clientid).update(client_json)
        }else{
            console.log('save')
            client_json.created_by  = login_userid;
            client_json.updated_by  = login_userid;
            client_json.clientid    = clientid;
            const usersdetails = new ClientContractDetails(client_json)
            await usersdetails.save();
        }
        errortype = 1;
        statuscode = 200;
        msg = 'Client Contract details updated!'
    }
    return res.status(statuscode).json({msg,errortype}) 
    //ClientContractDetails
}

exports.getClientContract = async(req,res)=>{
    try{
        const {clientid} = req.params;
        if(clientid!=null){
            const clientExist = await ClientContractDetails.query().where('clientid',clientid).first()
            var visa_expiry_url= ''
            if(clientExist.contractpdf!=null){
                const getObjectParams_passport = {
                    Bucket: bucketName,
                    Key: clientExist.contractpdf
                }
                const command = new GetObjectCommand(getObjectParams_passport);
                visa_expiry_url = await getSignedUrl(s3, command, { expiresIn: fileExpirySession });
            }
            clientExist.contractpdf = visa_expiry_url;
            return res.status(200).json({data:clientExist})
        }else{
            return res.status(500).json({msg:'Cient ID cannot be null'})    
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}

exports.allclients = async(req,res)=>{
    try{
        const {currentpage} = req.query
        console.log(currentpage)
        const perpage       = 100;
        const users_query   = await Clients.query().where('status',1).orderBy('created_at','desc');
        const users         = await users_query.paginate(currentpage,perpage)
        //const users = await db.table('users').select('id','name','email','gender','country','phoneno','employee_type','employee_role','status').paginate(1,2).get()
        //console.log(users)
        const result = {
            msg: 'success',
            errortype: 1,
            data: users
        }
        res.status(200).json(result)
        }catch(err){
            console.log(err)
            res.status(500).json({msg:'Internal server error'})
        }
}
exports.allClientNames = async(req,res)=>{
    try{
        
        const users_query   = Clients.query().where('status',1).orderBy('companyname','asc');
        const users         = await users_query.get()
        //const users = await db.table('users').select('id','name','email','gender','country','phoneno','employee_type','employee_role','status').paginate(1,2).get()
        //console.log(users)
        const result = {
            msg: 'success',
            errortype: 1,
            data: users
        }
        res.status(200).json(result)
        }catch(err){
            console.log(err)
            res.status(500).json({msg:'Internal server error'})
        }
}

exports.getClientalldetails = async(req,res)=>{
    try{
        const {clientid} = req.params;
        const client = await Clients.query().find(clientid);
        const clientContract = await client.related('ClientContractDetails').get()
    
        client.contractdetails = clientContract;
        res.status(200).json({msg:'Success', client})
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
    
}