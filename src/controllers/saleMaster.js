
const conn = require("../config/dbconn");
const sale=async(req,res)=>{
    const body=req.body;
    console.log("//::::::::::::::SALE MASTER::::::::::::::");
    const txnList=body.txn;
    const userId=body.userId;
    console.log("Txn len: " +txnList.length);
    console.log("User id: " +userId);
    res.send("well recieved");




}

module.exports={
    sale,
}