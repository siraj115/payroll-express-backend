
const jwt = require('jsonwebtoken');

require("dotenv").config({ path: `./.env.dev` });
const secret=process.env.REFRESH_TOKEN_SECRET;
console.log('secret', secret)


const jwtMiddleware = (req, res, next) => {
    const token = req.header('Authorization'); // Use 'Authorization' header

    if (!token) {
      return res.status(200).json({ errortype:2 , msg: 'Token is missing'  });
    }
    const split_token = token.split(" ");
    //console.log(split_token.length)    console.log(split_token)
    const getIndex = (split_token.length==1)?0:1;
    const fresh_token = split_token[getIndex];
  
    jwt.verify(fresh_token, secret, (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(200).json({ errortype:2 , msg: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  };
  

module.exports=jwtMiddleware;