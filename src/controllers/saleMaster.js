
const Db = require("../config/dbconn");
const sale=async(req,res)=>{
    const body=req.body;
    console.log("//::::::::::::::SALE MASTER::::::::::::::");
    const txnList=body.txn;
    const userId=body.userId;
    console.log("Txn len: " +txnList.length);
    console.log("User id: " +userId);
    res.send("well recieved");
    const errorList=[];
    for(el of txnList){
        const responseCode=await isOverLuckNum(el);
        if (responseCode.status=="00"){
            errorList.push(responseCode);
            console.log("ELEMENT LOOPING...");
        }


    }
    if (errorList) res.send({"status":"00","data":errorList});
    console.log("FINAL PROCESS NO ERROR ");



}

const isOverLuckNum=async (txn)=>{
    const userId=txn.userId;
    const luckNum=txn.luckyNumber;
    const amount=txn.amount;
    const category=txn.category;
    const subcat=txn.subategory;
    const ismId=txn.ismId;
    let maxType='';
    switch (luckNum.length) {
        case 1:
            maxType=subCatCheck(luckNum)
            break;
        case 2:
            maxType="two_digits"
            break;
        case 3:
            maxType="three_digits"
            break;
        case 4:
            maxType="four_digits"
            break;
        case 5:
            maxType="five_digits"
            break;
        case 6:
            maxType="four_digits"
            break;
        default:
            break;
    }
    console.log("SWITCHING: "+maxType);
    const sqlCom=`SELECT SUM(sale_price) AS recent_sale FROM sale WHERE  ism_id =${ismId} AND sub_cat_id=${subcat}  AND sale_num = ${luckNum}`;
    await Db.query(sqlCom,(er,re)=>{
        if(er) return {"status":"05","error":"server error"+er};
        const recentSale=re[0]["recent_sale"]
        let maxSale=0;
        //FIND MAX SALE
        sqlCom=`SELECT ${maxType} FROM salelimit;`;
        Db.query(sqlCom,(er,re)=>{
            if(er) return {"status":"05","error":"server error"+er};
            maxSale=re[0][maxType];
            if(maxSale>recentSale+amount) return {"status":"05","error":luckNum+ " is over maximum"}
            return {"status":"00"};
        })
        
    })


}
const subCatCheck=(subcat)=>{
    return subcat.include("o")?"over":"under";
}

module.exports={
    sale,
}