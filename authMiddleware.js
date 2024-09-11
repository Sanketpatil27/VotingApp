const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeaders = req.headers.authorization;

    if(!authHeaders || !authHeaders.startsWith('Bearer'))
        return res.status(403).json({msg: "invalid token"});

    const token = authHeaders.split(' ')[1];    // 0th index has Bearer & 1st will have token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.userId) {
            req.userId = decoded.userId;
            next();
        }
        else 
            return res.status(403).json({msg: "Please login first"});
    } 
    catch (e) {
        return res.status(403).json({msg: "Invalid Token"});
    }
}

module.exports = authMiddleware