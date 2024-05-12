const {db} = require('../connection')
const {Users} = require('../model/Users')
const bcrypt = require('bcrypt');
require("dotenv").config({ path: `./.env.dev` });
const {generateRefreshToken, generateToken} = require('../services/jwt')

exports.login = async(req,res)=>{
    try{
        const {username, password} = req.body;
        //console.log(username, password);
        if(username!='' && password !=''){
            const wherearr = {}
            wherearr.email = username;
            wherearr.status = 1;
            //console.log(wherearr)
            //wherearr.password = password;
            const users = await Users.query().where(wherearr).first()
            if(!users){
               return  res.status(500).json({ message: 'User not found', errortype: 2 });               
            }
           // console.log(users.id, users.email, users.password)

            // compare hash pass from db.
            if (bcrypt.compareSync(password, users.password)) {
                statuscode = 200;
                    message = 'Login Success';
                    errortype = 1;
            } else {
                 statuscode = 404;
                    message = 'Credentials dint match';
                    errortype =2;
                    return res.status(statuscode).json({ message, errortype})
            }
            //console.log(errortype)
            if(errortype ==1){
                console.log('hi')
                const id = users.id;
                const accessToken = generateToken({ userId: id,username });
                const refreshToken=generateRefreshToken({userId:id})
                 // Assigning refresh token in http-only cookie  
                console.log('accessToken',accessToken)
                console.log('refreshToken',refreshToken)
                //console.log(res)
                res.cookie('jwt', refreshToken);/* , { httpOnly: false,  
                    sameSite: 'None', secure: false,  
                    maxAge: 24 * 60 * 60 * 1000 }*/

                return res.status(statuscode).json({ message, errortype, id, accessToken})
            }
            
            /*bcrypt.compare(password, users.password, (err, data) => {
                //if error than throw error
                if (err) throw err

                //if both match than you can do anything
                let statuscode, message, errortype = '';
                if (data) {
                    statuscode = 200;
                    message = 'Login Success';
                    errortype = 1;
                } else {
                    statuscode = 404;
                    message = 'Credentials dint match';
                    errortype =2;
                    
                }
               

            })*/
        }else{
            res.status(500).json({ message: 'Username and Password are mandatory' });           
        }
    }catch(err){
        res.status(500).json({ message: 'Server error' });
    }
}

exports.listUser = async(req, res)=>{
    try{
    const users_query = Users.query().where('status',1);
    const users = await users_query.get()
    //console.log(users)
    const result = {
        msg: 'success',
        errortype: 1,
        data: users
    }
    res.status(200).json(result)
    }catch(err){
        res.status(500).json({msg:'Internal server error'})
    }
}
exports.saveUser = async(req, res)=>{
    try{
    const userReq = req.body;
    let errortype = 2;
    let statuscode = 400;
    let msg = 'ALl fields are mandatory';
    let userid = userReq.id;

    const user = new Users;
    user.name = userReq.name;
    user.dob = userReq.dob;
    user.gender = userReq.gender;
    user.country = userReq.country;
    user.phoneno = userReq.phone;
    user.email = userReq.email;
    user.address = userReq.address;
    user.employee_type = userReq.emp_type;
    user.employee_role = userReq.emp_role;
    user.salary = userReq.salary;
  
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(process.env.OTHER_PLAIN_TEXT, salt);
    //console.log(hash)
    //return false;
    const email = user.email;

    if(userid == null){
        
        //console.log(userid)
        const userExist = await Users.query().where('email',user.email).first()
        //console.log(userExist);//return false;

        if(userExist){
            errortype = 2;
            statuscode = 400;
            msg = "Employee already exist with the given email id";
            
        }else if(user.name != '' && user.dob != '' && user.gender !='' && user.country != '' && user.phoneno !='' && user.email != '' && user.address !='' && user.employee_type != '' && user.employee_role != '' && user.salary !=''){
            user.password = hash;
            await user.save();
            errortype = 1;
            statuscode = 200;
            msg = 'Successfully saved employee details';
            userid = user.id;
        }
    
    }else{
        //console.log(user);return false;
        //user.password = hash;
        const userExist = await Users.query().where('id',userid).update({user})
        errortype  =1;
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
        res.status(500).json({msg:'Internal server error'})
    }
}