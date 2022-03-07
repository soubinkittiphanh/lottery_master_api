
const Db = require("../config/dbconn");
const Db2 = require("../config/dbconnPromise");
const sale = async (req, res) => {
    const body = req.body;
    console.log("//::::::::::::::SALE MASTER::::::::::::::");
    const txnList = body.txn;
    const userId = body.userId;
    console.log("Txn len: " + txnList.length);
    console.log("User id: " + userId);

    const errorList = [];
    for (el of txnList) {
        const responseCode = await isOverLuckNum(el);
        console.log("RESPONSE FULL CHECK" + responseCode);
        console.log("STATUS: " + responseCode.status);
        if (responseCode.status == "00") {
            errorList.push(responseCode);
            console.log("ELEMENT LOOPING...");
        }


    }
    console.log("FINAL PROCESS NO ERROR ");
    console.log("ERROR.LEN " + errorList.length);
    if (errorList) return res.json({ status: "00", data: errorList });
    res.send("Transaction completed");



}

const isOverLuckNum = async (txn) => {
    const userId = txn.userId;
    const luckNum = txn.luckyNumber;
    const amount = txn.amount;
    const category = txn.category;
    const subcat = txn.subcategory;
    const ismId = txn.ismId;
    let maxType = '';
    let response = { 'status': "00", "error": "" };
    console.log("ism: " + ismId + " subcat: " + subcat + " category: " + category + " userId: " + userId);
    switch (luckNum.length) {
        case 1:
            maxType = subCatCheck(luckNum)
            break;
        case 2:
            maxType = "two_digits"
            break;
        case 3:
            maxType = "three_digits"
            break;
        case 4:
            maxType = "four_digits"
            break;
        case 5:
            maxType = "five_digits"
            break;
        case 6:
            maxType = "four_digits"
            break;
        default:
            break;
    }
    console.log("SWITCHING: " + maxType);
    let sqlCom = `SELECT SUM(sale_price) AS recent_sale FROM sale WHERE  ism_id =${ismId} AND sub_cat_id=${subcat}  AND sale_num = ${luckNum}`;
    try {
        const [rows, fields] = await Db2.query(sqlCom);
        const recentSale = rows[0]["recent_sale"]
        let maxSale = 0;
        console.log("RECENT SALE: " + recentSale);
        //FIND MAX SALE
        sqlCom = `SELECT ${maxType} FROM salelimit;`;
        maxSale=await checkMaxSale(sqlCom);
        if (maxSale > recentSale + amount) return response = { "status": "05", "error": luckNum + " is over maximum" }


    } catch (error) {
        console.log("Error: " + error);
        response = { "status": "05", "error": "server error" + er };
    }
    console.log(
        "FINISHED ISOVER CHECK"
    );
    return response;


}
const subCatCheck = (subcat) => {
    return subcat.include("o") ? "over" : "under";
}

const checkMaxSale = async (sqlCom) => {
    let maxSale=0;
    try {

        const [rows, fields] = await Db2.query(sqlCom);
        console.log("CHECKING MAX SALE");
        // if (er) return response = { "status": "05", "error": "server error" + er };
         maxSale = rows[0][maxType];
        console.log("MAX SALE: " + maxSale);
        // if (maxSale > recentSale + amount) return response = { "status": "05", "error": luckNum + " is over maximum" }
        response = { "status": "00", "error": "" };
        return maxSale;
    } catch (error) {
        console.log("Error: " + error);
        return maxSale;
    }

}

module.exports = {
    sale,
}