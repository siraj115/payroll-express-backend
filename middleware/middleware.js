
const jwt = require('jsonwebtoken');

require("dotenv").config({ path: `./.env.dev` });
const secret=process.env.REFRESH_TOKEN_SECRET;
console.log('secret', secret)


const jwtMiddleware = (req, res, next) => {
    const token = req.header('Authorization'); // Use 'Authorization' header

    const split_token = token.split(" ");
    const fresh_token = split_token[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied - Token missing' });
    }
  
    jwt.verify(fresh_token, secret, (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(401).json({ error: 'Invalid token siraj' });
      }
      req.user = decoded;
      next();
    });
  };
  

module.exports=jwtMiddleware;