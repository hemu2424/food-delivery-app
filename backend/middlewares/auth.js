import {Users} from "../models/Users.js";
import jwt from "jsonwebtoken"

async function  protect(req,res,next){

    try{
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
          return res.status(401).json({
            message: "not authorize user - no token provided"
          });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.id).select("-password");

        if(!user){
          return res.status(401).json({
            message: "user not exist"
          });
        }

        if (!user.isEmailVerified) {
          return res.status(403).json({ message: "Please verify your email to continue" });
        }

        if(user.isBlocked){
          return res.status(401).json({
            message: "user is blocked"  
          });
        }

        req.user = user;
        next();
    }
    catch(error){
        return res.status(401).json({
          message: `not authorize invalid: ${error.message}`
        });
    }

}


function allowRoles(...roles){
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message:"access denied for this role "
            })
        }
        next();
    }
}

export {protect,allowRoles}