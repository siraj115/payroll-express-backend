const {Users} = require('../connection')

exports.listUser = async(req, res)=>{
    const result = {
        msg: 'success',
        data: 'Users list'
    }
    res.status(200).json(result)
}
exports.saveUser = async(req, res)=>{
    const result = {
        msg: 'success'
    }
    res.status(200).json(result)
}