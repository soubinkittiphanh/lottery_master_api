const db = require("../config/dbconn");

const fetchCategory=async(req,res)=>{
    console.log("::::::::::::::FETCH CATEGORY::::::::::::::");
    const sqlCom=`SELECT * FROM t_category`
    db.query(sqlCom,(er,re)=>{
        if(er) return res.send("Error: "+er);
        res.send(re);
        console.log("::::::::::::::FETCH CATEGORY RESPONSE::::::::::::::");
    })
}

module.exports={
    fetchCategory,
}