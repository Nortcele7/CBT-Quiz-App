const jwt = require("jsonwebtoken");
const SECRET_KEY = "shhhhhhh";

function protectRoute(req, res, next) {
    const token = req.cookies.token;
    if (!token) 
    {
        return res.send("This Route is Protected")
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // attach user info to request
    next(); // allow access

}

module.exports = protectRoute;
