
const Db=require("../config/dbconn");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const conf=require("../config");
const secret=conf.actksecret;
const generateToken=(credential)=>{

    // const credential={user:"userId"}
    const token=jwt.sign(credential,secret,{expiresIn:'3h'});
    console.log("token: "+token);
    return {...credential,token:token}
}
const validateToken=async(req,res,done)=>{
    const {authorization} =req.headers;
    const token =authorization&&authorization.split(" ")[1];
    console.log("Token: "+token);
    console.log("Secret: "+secret);
    if (token == null) return res.json("Error: no token found")
    jwt.verify(token,secret,(er,result)=>{
        if(er) return res.json("Error: "+er)
        // res.send({"status":"00",desc:"Token is valid"})
        console.log("Token is valid");
        done();

    })
}
module.exports={
    generateToken,
    validateToken,
}