const {randomBytes} = require('node:crypto');
const randomName = (bytes=32)=>{
    return randomBytes(bytes).toString('hex');
}

module.exports = {randomName}