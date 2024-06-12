const {db} = require('../connection')
const {Users} = require('../model/Users')
const {UsersBasics} = require('../model/UsersBasics')

const bcrypt = require('bcrypt');
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

exports.login = async(req,res)=>{
    try{
        const {username, password} = req.body;
        console.log(username, password);
        if(username!='' && password !=''){
            const wherearr = {}
            wherearr.email = username;
            wherearr.status = 1;
           // console.log(wherearr)
            //wherearr.password = password;
            const users = await Users.query().where(wherearr).first()
            //console.log(users)
            if(!users){
               return  res.status(200).json({ msg: 'User not found', errortype: 2 });               
            }
           // console.log(users.id, users.email, users.password)

            // compare hash pass from db.
            console.log(users.canlogin)
            if(users.canlogin==0){
                statuscode = 200;
                message     = 'You dont have access. Please contact adminstrator';
                errortype = 2;
                return res.status(statuscode).json({ msg: message, errortype})
            }else if (bcrypt.compareSync(password, users.password)) {
                statuscode = 200;
                    message = 'Login Success';
                    errortype = 1;
            } else {
                 statuscode = 200;
                    message = 'Credentials dint match';
                    errortype =2;
                    return res.status(statuscode).json({ msg: message, errortype})
            }
            //console.log(errortype)
            if(errortype ==1){
                //console.log('hi')
                const id = users.id;
                const accessToken = generateToken({ userId: id,username });
                const refreshToken=generateRefreshToken({userId:id})
                 // Assigning refresh token in http-only cookie  
                //console.log('accessToken',accessToken)
                //console.log('refreshToken',refreshToken)
                //console.log(res)
                res.cookie('jwt', refreshToken);/* , { httpOnly: false,  
                    sameSite: 'None', secure: false,  
                    maxAge: 24 * 60 * 60 * 1000 }*/

                return res.status(statuscode).json({ msg:message, errortype, id, accessToken,username})
            }
            
           
        }else{
            res.status(200).json({ message: 'Username and Password are mandatory', errortype:2 });           
        }
    }catch(err){
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
}

exports.listUser = async(req, res)=>{
    try{
    const {currentpage} = req.query
    const perpage       = 100;
    const users_query = await Users.query().where('status',1).orderBy('created_at','desc');
    const users = await users_query.paginate(currentpage,perpage)
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
exports.saveUser = async(req, res)=>{
    try{
        
    let imageName =  ''; 
    //const userReq = req.body;
    const {name, dob, gender, country, phone, email, address, emp_type, emp_role, salary, empno, canlogin, datejoining, workphone, id, login_userid} = req.body;
    //console.log('req.body ',req.body   );
    //console.log('req.file',req.file);
    //req.file.buffer
    

    let errortype = 2;
    let statuscode = 400;
    let msg = 'ALl fields are mandatory';
    let userid = id;

   
    const user_json={
        name, dob, gender, country,phoneno: phone, email, address, employee_type:emp_type, employee_role:emp_role, salary, empno, canlogin, workphone, datejoining
    }
    user_json.canlogin = (canlogin!='false')?1:0;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(process.env.OTHER_PLAIN_TEXT, salt);
    //console.log(hash)
    //return false;
    if(req.file){
        imageName =  randomName(); 
        const buffer_img = await sharp(req.file.buffer).resize({height:200, width:200, fit:'contain'}).toBuffer();
        const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: buffer_img,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params)
        await s3.send(command)
        user_json.employee_photo = imageName
    }
    if(userid == null){
        
        //console.log(email)
        let userExist = {}
        if(email !=''){
             userExist = await Users.query().where('email',email).first()
            //console.log(userExist);//return false;
        }
        //console.log(userExist)
        if(userExist && email!=''){
            errortype = 2;
            statuscode = 500;
            msg = "Employee already exist with the given email id";
            
        }else if(name != '' && dob != '' && gender !='' && country != '' && phone !='' && address !='' && emp_type != '' && emp_role != '' && salary !='' && workphone !='' && datejoining !=''){
            //email != '' && 
            password = hash;
            user_json.password = password;
            user_json.status = 1;
            //user_json.canlogin =canlogin;
            user_json.created_by =login_userid;
            user_json.updated_by = login_userid;
            //console.log(user_json)
            usersdetails = new Users(user_json)
            await usersdetails.save();
            errortype = 1;
            statuscode = 200;
            msg = 'Successfully saved employee details';
            userid = usersdetails.id;
        }
    
    }else{
        //console.log(user);return false;
        //user.password = hash;
        user_json.updated_by = login_userid;
        //console.log(user_json)
        const userExist = await Users.query().where('id',userid).update(user_json)
        errortype  =1;
        statuscode  = 200;
        msg = "Successfully updated employee details";
        userid = userid;
    }
    
    const result = {
        msg,
        errortype,
        userid,
        email
    }
    res.status(statuscode).json(result)
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}

exports.getUser = async(req,res)=>{
    try{
//27b8e71d-6f93-40b2-b36b-5bff4df00cf7
        const {empid} = req.params;
        if(empid != null){
            const userExist = await Users.query().where('id',empid).first()
            let labour_card_url = '';
            if(userExist.employee_photo!=null){
                const getObjectParams_passport = {
                    Bucket: bucketName,
                    Key: userExist.employee_photo
                }
                const command = new GetObjectCommand(getObjectParams_passport);
                labour_card_url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            }
            userExist.employee_photo = labour_card_url;
            res.status(200).json({data:userExist})
        }else{
            res.status(500).json({msg:'Employee ID cannot be null'})    
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}

exports.savebasicdetails = async(req,res)=>{
    try{
        const {passport, passportupload, passport_expiry, visano, visaexpiry, visaupload, eidno, eidexpiry, eidupload, login_userid, workpermit, workpermitexpiry,  personalno, personalaccno, labourcardupload, userid} = req.body;
        let errortype = 2;
        let statuscode = 400;
        let msg = 'ALl fields are mandatory';
        
        const uploaded_files = req.files;
        //console.log('req.file',uploaded_files);
        const user_json={
            passport, passport_upload:passportupload, passport_expiry, visano, visa_expiry:visaexpiry, visa_expiry_upload:visaupload, eidno, eid_expiry:eidexpiry, eid_expiry_upload:eidupload, work_permit:workpermit, personal_no:personalno, personal_acc_no:personalaccno, labour_card_upload:labourcardupload, work_permit_expiry: workpermitexpiry,userid
        }
        
        //passportupload !='' && visaupload !='' &&  eidupload !=''
        if(passport !='' &&   visaexpiry !='' &&    eidno !=''  && workpermit !=''  && personalno !=''  && personalaccno !=''  ){
            user_json.created_by =login_userid;
            user_json.updated_by =login_userid;
            //console.log(user_json)
            const userExist = await UsersBasics.query().where('userid',userid).first()
            if(uploaded_files['passportupload[]']){
                let passport_name =  randomName(); 
                //const buffer_img = await sharp(uploaded_files['passportupload[]'].buffer).resize({height:200, width:200, fit:'contain'}).toBuffer();
                const buffer_img = uploaded_files['passportupload[]'][0].buffer;
                if(userExist?.passport_upload){
                    const delParams = {
                        Bucket: bucketName,
                        Key: userExist.passport_upload
                    }
                    const command = new DeleteObjectCommand(delParams)
                    await s3.send(command)
                }
                const params = {
                    Bucket: bucketName,
                    Key: passport_name,
                    Body: buffer_img,
                    ContentType: uploaded_files['passportupload[]'].mimetype
                }
                const command = new PutObjectCommand(params)
                await s3.send(command)
                user_json.passport_upload = passport_name
            }
            if(uploaded_files['visaupload[]']){
                let passport_name =  randomName(); 
                //const buffer_img = await sharp(uploaded_files['passportupload[]'].buffer).resize({height:200, width:200, fit:'contain'}).toBuffer();
                if(userExist?.visa_expiry_upload){
                    const delParams = {
                        Bucket: bucketName,
                        Key: userExist.visa_expiry_upload
                    }
                    const command = new DeleteObjectCommand(delParams)
                    await s3.send(command)
                }
                const buffer_img = uploaded_files['visaupload[]'][0].buffer;
                const params = {
                    Bucket: bucketName,
                    Key: passport_name,
                    Body: buffer_img,
                    ContentType: uploaded_files['visaupload[]'].mimetype
                }
                const command = new PutObjectCommand(params)
                await s3.send(command)
                user_json.visa_expiry_upload = passport_name
            }
            if(uploaded_files['eidupload[]']){
                let passport_name =  randomName(); 
                //const buffer_img = await sharp(uploaded_files['passportupload[]'].buffer).resize({height:200, width:200, fit:'contain'}).toBuffer();
                if(userExist?.eid_expiry_upload){
                    const delParams = {
                        Bucket: bucketName,
                        Key: userExist.eid_expiry_upload
                    }
                    const command = new DeleteObjectCommand(delParams)
                    await s3.send(command)
                }
                const buffer_img = uploaded_files['eidupload[]'][0].buffer;
                const params = {
                    Bucket: bucketName,
                    Key: passport_name,
                    Body: buffer_img,
                    ContentType: uploaded_files['eidupload[]'].mimetype
                }
                const command = new PutObjectCommand(params)
                await s3.send(command)
                user_json.eid_expiry_upload = passport_name
            }
            if(uploaded_files['labourcardupload[]']){
                let passport_name =  randomName(); 
                //const buffer_img = await sharp(uploaded_files['passportupload[]'].buffer).resize({height:200, width:200, fit:'contain'}).toBuffer();
                if(userExist?.labour_card_upload){
                    const delParams = {
                        Bucket: bucketName,
                        Key: userExist.labour_card_upload
                    }
                    const command = new DeleteObjectCommand(delParams)
                    await s3.send(command)
                }
                const buffer_img = uploaded_files['labourcardupload[]'][0].buffer;
                const params = {
                    Bucket: bucketName,
                    Key: passport_name,
                    Body: buffer_img,
                    ContentType: uploaded_files['labourcardupload[]'].mimetype
                }
                const command = new PutObjectCommand(params)
                await s3.send(command)
                user_json.labour_card_upload = passport_name
            }

            if(userExist !=null){
                user_json.updated_by =login_userid;
                await UsersBasics.query().where('userid',userid).update(user_json)
            }else{
                const usersdetails = new UsersBasics(user_json)
                await usersdetails.save();
            }
            
            //await UsersBasics.query().where('userid',userid).delete()
            
            
            
            errortype = 1;
            statuscode = 200;
            msg = 'Basic details updated!'
        }else{
            errortype = 2;
            statuscode = 200;
        }
        res.status(statuscode).json({msg,errortype}) 
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}
exports.getUserBasic = async(req,res)=>{
    try{
        
//27b8e71d-6f93-40b2-b36b-5bff4df00cf7
        const {empid} = req.params;
        if(empid != null){
            const userExist = await UsersBasics.query().where('userid',empid).first()
            //console.log(userExist)
            if(userExist != null){
                let passport_url = '';
                if(userExist.passport_upload!=null){
                    const getObjectParams_passport = {
                        Bucket: bucketName,
                        Key: userExist.passport_upload
                    }
                    const command = new GetObjectCommand(getObjectParams_passport);
                    passport_url = await getSignedUrl(s3, command, { expiresIn: fileExpirySession });
                }
                userExist.passport_url = passport_url;
                let visa_expiry_url = '';
                if(userExist.visa_expiry_upload!=null){
                    const getObjectParams_passport = {
                        Bucket: bucketName,
                        Key: userExist.visa_expiry_upload
                    }
                    const command = new GetObjectCommand(getObjectParams_passport);
                    visa_expiry_url = await getSignedUrl(s3, command, { expiresIn: fileExpirySession });
                }
                userExist.visa_expiry_upload = visa_expiry_url;
                let eid_expiry_url = '';
                //console.log(userExist.eid_expiry_upload)
                if(userExist.eid_expiry_upload!=null){
                    const getObjectParams_passport = {
                        Bucket: bucketName,
                        Key: userExist.eid_expiry_upload
                    }
                    const command = new GetObjectCommand(getObjectParams_passport);
                    eid_expiry_url = await getSignedUrl(s3, command, { expiresIn: fileExpirySession });
                }
                userExist.eid_expiry_upload = eid_expiry_url;
                let labour_card_url = '';
                if(userExist.labour_card_upload!=null){
                    const getObjectParams_passport = {
                        Bucket: bucketName,
                        Key: userExist.labour_card_upload
                    }
                    const command = new GetObjectCommand(getObjectParams_passport);
                    labour_card_url = await getSignedUrl(s3, command, { expiresIn: fileExpirySession });
                }
                userExist.labour_card_upload = labour_card_url;
            }
            res.status(200).json({data:userExist})
        }else{
            res.status(500).json({msg:'Employee ID cannot be null'})    
        }
    }catch(err){
        console.log(err)
        res.status(500).json({msg:'Internal server error'})
    }
}

