const db = require("../config/dbconn");
const winrep = async (req, res) => {
  const r_date = req.query.p_date;
  const r_admin = req.query.p_admin;
  const r_mem_id = req.query.p_mem_id;
  const p_master = req.query.p_master;
  console.log("//::::::::::::::WIN REPORT FETCH::::::::::::::");
  let sql = `SELECT s.*,i.ism_result_primary FROM installment i RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0 WHERE i.ism_date ="${r_date}" AND s.mem_id="${r_mem_id}" AND (s.sale_num = SUBSTRING(i.ism_result_primary, -6, 6) OR s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5) OR s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4) OR s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3) OR s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2)) ORDER BY s.id DESC`;
  console.log("UPDATE:==================WINREPORT");
  if (r_admin === "true") {
    sql = `SELECT s.*,i.ism_result_primary FROM installment i 
    RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0 AND s.mem_id IN (SELECT mn.mem_id  FROM member mn WHERE mn.brc_code=(SELECT m.brc_code FROM member m WHERE m.mem_id='${r_mem_id}' ) )
    WHERE i.ism_date ="${r_date}" AND (s.sale_num = SUBSTRING(i.ism_result_primary, -6, 6) OR s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5) OR s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4) OR s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3) OR s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2)) ORDER BY s.id DESC `;
    console.log("Admin: " + r_admin);

    if (p_master == 1) {
      console.log("::::::::::MASTER REPORT:::::::");
      sql = `SELECT s.*,i.ism_result_primary FROM installment i 
      RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0
      WHERE i.ism_date ="${r_date}" AND (s.sale_num = SUBSTRING(i.ism_result_primary, -6, 6) OR s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5) OR s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4) OR s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3) OR s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2)) ORDER BY s.id DESC `;
    }
  }

  console.log("ID" + r_mem_id);
  console.log("Admin" + r_admin);
  console.log("Date" + r_date);
  db.query(sql, (er, result) => {
    if (er) {
      res.send(er);
    } else {
      res.send(result);
    }
  });
};
const topSaleRep = async (req, res) => {
  db.query("SELECT t.* FROM (SELECT s.sale_num as luck_num,SUM(s.sale_price) as total_sale FROM sale s WHERE s.ism_id=(SELECT MAX(i.ism_ref) FROM installment i) AND s.is_cancel=0 GROUP BY s.sale_num) t ORDER BY t.total_sale DESC LIMIT 10;", (er, re) => {
    if (er) return res.send("Error: " + er);
    res.send(re);
  })
}
const salerep = async (req, res) => {
  const r_date = req.query.p_date;
  const r_admin = req.query.p_admin;
  const r_mem_id = req.query.p_mem_id;
  const p_master = req.query.p_master;
  console.log("//::::::::::::::SALE REPORT FETCH::::::::::::::");
  console.log("ADMIN: " + r_mem_id);
  console.log("ADMIN MASTER: " + p_master);
  console.log("DATE: " + r_date);
  //SUBSTRING(s.sale_bill_id, -6, 6)
  let sql = `SELECT s.is_cancel As is_cancel, s.sale_bill_id AS sale_bill_id,s.ism_id AS ism_id,s.mem_id AS mem_id,s.date AS date,s.sale_num AS sale_num,s.sale_price AS sale_price,i.ism_result_primary
  FROM installment i 
  RIGHT JOIN sale s ON s.ism_id=i.ism_ref
  WHERE i.ism_date ="${r_date}" and s.mem_id="${r_mem_id}" ORDER BY s.mem_id`;

  if (r_admin === "true") {
    sql = `SELECT s.is_cancel As is_cancel, s.sale_bill_id AS sale_bill_id,
    s.ism_id AS ism_id,s.mem_id AS mem_id,s.date AS date,s.sale_num AS sale_num,
    s.sale_price AS sale_price,i.ism_result_primary FROM installment i 
    RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.mem_id IN (SELECT mn.mem_id  FROM member mn WHERE mn.brc_code=(SELECT m.brc_code FROM member m WHERE m.mem_id='${r_mem_id}' ) )
    WHERE i.ism_date >="${r_date}" ORDER BY s.mem_id`;
    console.log("Admin: " + r_admin);
    if (p_master == 1) {
      console.log("::::::::::MASTER REPORT:::::::");
      sql = `SELECT s.is_cancel As is_cancel, s.sale_bill_id AS sale_bill_id,
      s.ism_id AS ism_id,s.mem_id AS mem_id,s.date AS date,s.sale_num AS sale_num,
      s.sale_price AS sale_price,i.ism_result_primary FROM installment i 
      RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0
      WHERE i.ism_date >="${r_date}" ORDER BY s.mem_id`;
    }
  }
  db.query(sql, (er, result) => {
    if (er) {
      console.log("Error getting report sale: " + er);
      return res.send(er);
    } else {
      console.log("LENGTH RESULT: " + result.length);
      res.send(result);
    }
  });
};

const bonusrep = async (req, res) => {
  const uid = req.body.uid;
  const percent = req.body.s_percent;
  console.log("//::::::::::::::BONUS CHECK::::::::::::::");
  console.log("======UID=====" + uid);
  const sql = `SELECT FLOOR(SUM(s.sale_price)*${percent}/100) AS sale  FROM sale s WHERE s.ism_id = (SELECT MAX(i.ism_ref) FROM installment i) AND s.is_cancel=0 AND s.mem_id='${uid}'`;
  db.query(sql, (er, result) => {
    if (er) {
      console.log("======UID=====ERROR");
      console.log(er);
    } else {
      res.send(result);
      console.log("======UID=====SUCCEDD" + uid);
    }
  });
};
const branchrep = async (req, res) => {
  console.log("//::::::::::::::FETCH BRANCH REPORT::::::::::::::");
  const p_master = req.query.p_master;
  const p_mem_id = req.query.p_mem_id;
  const p_date = req.query.p_date;
  console.log("p_mem: " + p_mem_id + " p_master: " + p_master + "p_date: " + p_date);

  const winSQL = `CALL GetBrcReport('${p_date}')`;
  db.query(winSQL, (err, result) => {
    if (err) {
      console.log(err);
      res.send("ເກີດຂໍ້ຜິດພາດທາງດ້ານເຊີເວີ: " + err);
    } else {
      res.send(result[0]);
    }
  });
};
module.exports = {
  winrep,
  salerep,
  bonusrep,
  branchrep,
  topSaleRep,
};
