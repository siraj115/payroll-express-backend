const {db} = require('../connection')
const getUsers = async(userids)=>{
    
    if(userids.length>0){
        const usersdetails = await db
        .table('users')
        .select('id','name','email','gender','employee_type','employee_role')
        .whereIn('id',userids)
        .get()

        return usersdetails
    }
    return null
}

module.exports = {
    getUsers
}