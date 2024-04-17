const {db} = require('../connection')
const {Users} = require('../model/Users')

exports.listUser = async(req, res)=>{
    const result = {
        msg: 'success',
        data: 'Users list'
    }
    res.status(200).json(result)
}
exports.saveUser = async(req, res)=>{
    
    const userReq = req.body;
    let errortype = 2;
    let statuscode = 400;
    let msg = '';
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

    if(userid == null){
        
        
        const userExist = await Users.query().where('email',user.email).first()
        console.log(userExist);//return false;

        if(userExist){
            errortype = 2;
            statuscode = 400;
            msg = "Employee already exist with the given email id";
            
        }else if(user.name != '' && user.dob != '' && user.gender !='' && user.country != '' && user.phoneno !='' && user.email != '' && user.address !='' && user.employee_type != '' && user.employee_role != '' && user.salary !=''){
            await user.save();
            errortype = 1;
            statuscode = 200;
            msg = 'Successfully saved employee details';
            userid = user.id;
        }
    
    }else{
        console.log(user);return false;
        const userExist = await Users.query().where('id',userid).update({user})
        errortype  =1;
        msg = "Successfully updated employee details";
        userid = userid;
    }
    
    const result = {
        msg,
        errortype,
        userid
    }
    res.status(statuscode).json(result)
}