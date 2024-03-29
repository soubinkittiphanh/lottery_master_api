
const res = require("express/lib/response");
const { db } = require("../config");
const Db = require("../config/dbconn");
const Db2 = require("../config/dbconnPromise");
const sale = async (req, res) => {
    const body = req.body;
    console.log("//::::::::::::::SALE MASTER::::::::::::::");
    const txnHeader = body.txnHeader;
    const txnList = body.txn;
    const userId = txnHeader["userId"];
    const barCode = txnHeader["qrCode"]
    console.log("Txn len: " + txnList.length);
    console.log("User id: " + userId);
    console.log("Header date: " + txnHeader.date);
    console.log("Ism Id: " + txnHeader.ismId);
    console.log("Barcode: " + txnHeader.qrCode);
    console.log("Category: " + txnHeader.category);
    console.log("Subcat: " + txnHeader.subcategory);
    const errorList = [];
    for (el of txnList) {
        const luckyNumLen = el.luckyNumber.length;
        console.log("LEN OF EL: " + luckyNumLen);
        if (luckyNumLen > 6) return res.json([{ status: "01", data: [{ error: "INVALID LUCKY NUMBER" }] }]);
        const responseCode = await isOverLuckNum(el, txnHeader);
        console.log("STATUS: " + responseCode.status);
        if (responseCode.status != "00") {
            errorList.push(responseCode);
            console.log("ELEMENT LOOPING...STOP");
            return res.json([{ status: "01", data: errorList }]);
        }
        console.log("ELEMENT LOOPING...");
    }
    console.log("ERROR.LEN " + errorList.length);
    if (errorList.length > 0) return res.json([{ "status": "01", "data": errorList }]);
    processTxn(txnList, barCode, res, txnHeader.category, txnHeader.subcategory);
    // res.send("Transaction completed");

}

const processTxn = async (txnList, barCode, res, catId, subCatId) => {
    console.log("THIS IS CAT ID BEFORE PROCESS: " + catId);
    sqlCom = 'INSERT INTO `sale`(`sale_bill_id`,`cat_id`,`sub_cat_id`, `ism_id`, `sale_num`, `sale_price`, `mem_id`, `client_date`,`qr_code`) VALUES ';
    const bill_num = await getBillnum();
    if (!bill_num) return res.json({ status: "04", desc: "Transaction fail: error cannot get ticket number" });
    for (let i = 0; i < txnList.length; i++) {
        const colon = i < txnList.length - 1 ? "," : ";";
        let txn = txnList[i];
        sqlCom += `('${bill_num}','${catId}','${subCatId}','${txn["ismId"]}','${txn["luckyNumber"]}',${txn["amount"]},'${txn["userId"]}','${txn["date"].substring(0, 19)}','${barCode}')${colon}`;
    }
    Db.query(sqlCom, (er, re) => {
        if (er) {
            console.log("RESULT SQL: " + er);
            return res.json({ status: "05", data: [{ error: er }] })
        }
        res.json([{ status: "00", desc: "Transaction completed", ticket_number: bill_num.toString() }]);
    })
    console.log("FINAL SQL COMMAND: " + sqlCom);

}

const getBillnum = async () => {
    try {
        const [rows, fields] = await Db2.query(
            `SELECT MAX(sale_bill_id) as pre_bill FROM sale HAVING MAX(sale_bill_id) IS NOT null`
        );

        const numRows = rows.length;
        console.log("numrow: " + numRows);
        if (numRows < 1) {
            console.log("LESS THEN 1: " + numRows);
            return 214303061761012;
        } else {
            console.log("OVER THEN 1: " + numRows);
            console.log("NEXT_REF: " + rows[0].pre_bill);
            const next_ref = BigInt(rows[0].pre_bill) + 1n;
            console.log("NEXT_REF + 1: " + next_ref);
            return next_ref;
        }
    } catch (error) {
        console.log("Get bill number error: " + error);
    }

}

const isOverLuckNum = async (txn, txnHeader) => {
    const userId = txn.userId;
    const luckNum = txn.luckyNumber;
    const amount = txn.amount;
    const category = txnHeader.category;
    const subcat = txnHeader.subcategory;
    const ismId = txnHeader.ismId;

    console.log("User id: " + userId);
    console.log("Header date: " + txnHeader.date);
    console.log("Ism Id: " + txnHeader.ismId);
    console.log("Barcode: " + txnHeader.qrCode);
    console.log("Category: " + txnHeader.category);
    console.log("Subcat: " + txnHeader.subcategory);

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
            maxType = "six_digits"
            break;
        default:
            break;
    }
    console.log("SWITCHING: " + maxType);
    let sqlCom = `SELECT SUM(sale_price) AS recent_sale FROM sale WHERE  ism_id =${ismId} AND sub_cat_id=${subcat}  AND sale_num = '${luckNum}'`;
    console.log("SQL: " + sqlCom);
    try {
        const [rows, fields] = await Db2.query(sqlCom);
        const recentSale = rows[0]["recent_sale"] || 0;
        const saleAmount = parseInt(recentSale) + parseInt(amount)
        let maxSale = 0;
        console.log("RECENT SALE: " + recentSale);
        console.log("LUCKYNUM SALE: " + luckNum);
        console.log("RECENT + SALE: " + saleAmount.toString());
        //FIND MAX SALE IN SALELIMIT TABLE
        sqlCom = `SELECT ${maxType} FROM salelimit WHERE cat_id='${category}' AND brc_code=IFNULL((SELECT brc_code FROM member WHERE mem_id='${userId}'),'DEFAULT');`;
        console.log("=> SQL SALE LIM: " + sqlCom);
        maxSale = await checkMaxSale(sqlCom, maxType);
        console.log("MAX SALE LIMIT: " + maxSale);
        if (maxSale < saleAmount) return response = { "status": "05", "error": luckNum + " is over maximum " + " ວ່າງ " + (maxSale - recentSale) }
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
    console.log("=> SUB-CAT: " + subcat);
    return subcat.includes("O") ? "lim_over" : "lim_under";
}

const checkMaxSale = async (sqlCom, sqlFieldName) => {
    console.log("Field name: " + sqlFieldName);
    let maxSale = 0;
    try {
        const [rows, fields] = await Db2.query(sqlCom);
        maxSale = rows[0][sqlFieldName];
        console.log("MAX SALE: " + maxSale);
        return maxSale;
    } catch (error) {
        console.log("There is no record in salelimit with user's branch_code");
        try {
            const [rows, fields] = await Db2.query(`SELECT ${sqlFieldName} FROM salelimit WHERE brc_code='DEFAULT'`);
            maxSale = rows[0][sqlFieldName];
            console.log("MAX SALE: " + maxSale);
            return maxSale;
        } catch (error) {
            console.log("Can not fetch salelimit with DEFAULT key record "+error);
            return maxSale;
        }


    }
}

module.exports = {
    sale,
}