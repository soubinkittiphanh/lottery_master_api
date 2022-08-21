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
      RIGHT JOIN sale s ON s.ism_id=i.ism_ref
      WHERE i.ism_date >="${r_date}" ORDER BY s.mem_id`;
    }
  }

  console.log(r_date);
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
  console.log(p_mem_id + "======" + p_master);
  const winSQL=`SELECT
  m.brc_code,
  w.mem_id,
  b.co_comm AS company_sale_com_rate,
  m.com_sale AS individual_sale_com_rate,
  m.com_win AS individual_win_com_rate,
  IFNULL(SUM(sale.sale_price),
  0) AS all_sale,
  IFNULL(w.total, 0) AS all_sale_win,
  IFNULL(w.total_win_pay_client, 0),
  IFNULL(
      SUM(sale.sale_price) * b.co_comm / 100,
      0
  ) AS total_company_sale_com,
  IFNULL(
      SUM(sale.sale_price) * m.com_sale / 100,
      0
  ) AS total_individual_sale_com,
  IFNULL(
      w.total_win_pay_client * m.com_win / 100,
      0
  ) AS total_individual_win_com,
  IFNULL(
      SUM(sale.sale_price) -(
          (
              SUM(sale.sale_price) * b.co_comm / 100
          ) +(
              w.total_win_pay_client * m.com_win / 100
          ) + w.total_win_pay_client
      ),
      0
  ) AS totalreturn
FROM
  member m
LEFT JOIN(
  SELECT
      s.sale_num,
      SUM(s.sale_price) AS total,
      SUM(
          s.sale_price *(
          SELECT
              IF(
                  LENGTH(s.sale_num) = 2,
                  p.pay_two,
                  IF(
                      LENGTH(s.sale_num) = 3,
                      p.pay_three,
                      IF(
                          LENGTH(s.sale_num) = 4,
                          p.pay_four,
                          IF(
                              LENGTH(s.sale_num) = 5,
                              p.pay_five,
                              IF(
                                  LENGTH(s.sale_num) = 6,
                                  p.pay_six,
                                  IF(
                                      s.sale_num = "o",
                                      p.pay_over,
                                      IF(s.sale_num = "u", p.under, 0)
                                  )
                              )
                          )
                      )
                  )
              )
          FROM
              payrate p
          WHERE
              p.cat_id = s.cat_id
      ) / 1000
      ) AS total_win_pay_client,
      s.sale_price,
      s.mem_id,
      sc.scat_name,
      c.category_name,
      i.ism_date
  FROM
      sale s
  LEFT JOIN installment i ON
      i.ism_ref = s.ism_id
  LEFT JOIN t_category c ON
      s.cat_id = c.category_id
  LEFT JOIN sub_category sc ON
      sc.scat_id = s.sub_cat_id
  WHERE
      s.ism_id IN(
      SELECT
          ism_id
      FROM
          installment
      WHERE
          ism_date >= "2022-02-21"
  ) AND s.is_cancel = 0 AND(
      IF(
          s.sub_cat_id = 10,
          s.sale_num = i.ism_result_primary,
          s.sale_num = i.ism_result_secondary
      ) OR IF(
          s.sub_cat_id = 10,
          s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5),
          s.sale_num = SUBSTRING(i.ism_result_secondary, -5, 5)
      ) OR IF(
          s.sub_cat_id = 10,
          s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4),
          s.sale_num = SUBSTRING(i.ism_result_secondary, -4, 4)
      ) OR IF(
          s.sub_cat_id = 10,
          s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3),
          s.sale_num = SUBSTRING(i.ism_result_secondary, -3, 3)
      ) OR IF(
          s.sub_cat_id = 10,
          s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2),
          s.sale_num = SUBSTRING(i.ism_result_secondary, -2, 2)
      ) OR IF(
          s.sub_cat_id = 10,
          s.sale_num = i.ism_result_primary_ou,
          s.sale_num = i.ism_result_secondary_ou
      )
  )
GROUP BY
  s.mem_id
) w
ON
  w.mem_id = m.mem_id
LEFT JOIN branch b ON
  b.co_code = m.brc_code
LEFT JOIN sale sale ON
  sale.mem_id = m.mem_id AND sale.is_cancel = 0 AND sale.ism_id IN(
  SELECT
      ism.ism_ref
  FROM
      installment ism
  WHERE
      ism.ism_date >= "2022-02-21 00:00:00"
)
GROUP BY
  m.mem_id`
  const sql = `
  SELECT m.brc_code,b.co_comm,m.com_sale,m.com_win, SUM(s.sale_price ) AS total,win.win_amount,SUM(s.sale_price )*b.co_comm/100 AS total_com1,SUM(s.sale_price )*m.com_win/100 AS total_com2, 
  SUM(s.sale_price )-((SUM(s.sale_price )*b.co_comm/100)+(SUM(win.win_amount )*m.com_win/100)+win.win_amount)
  AS totalreturn
  FROM member m 
  LEFT JOIN sale s ON m.mem_id=s.mem_id AND s.is_cancel=0 AND s.ism_id=(SELECT MAX(i.ism_ref) FROM installment i) 
  LEFT JOIN branch b ON m.brc_code=b.co_code
  LEFT JOIN
 (SELECT u.brc_code,i.ism_result_primary,
  SUM(s.sale_price*(SELECT IF(LENGTH(s.sale_num)=2,pay_two,IF(LENGTH(s.sale_num)=3,pay_three,IF(LENGTH(s.sale_num)=4,pay_four,IF(LENGTH(s.sale_num)=5,pay_five,pay_six)))) FROM payrate) /1000) AS win_amount 
 FROM installment i 
 RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0 
 RIGHT JOIN member u ON u.mem_id=s.mem_id
 WHERE i.ism_date =(SELECT MAX(ism_date) FROM installment) AND (s.sale_num = SUBSTRING(i.ism_result_primary, -6, 6) OR s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5) OR s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4) OR s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3) OR s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2)) 
 GROUP BY u.brc_code ORDER BY u.brc_code ) AS win ON win.brc_code=m.brc_code GROUP BY m.brc_code`;
  
 
//  const sql = `
//   SELECT m.brc_code,b.co_comm,m.com_sale,m.com_win, SUM(s.sale_price ) AS total,win.win_amount,SUM(s.sale_price )*b.co_comm/100 AS total_com1,SUM(s.sale_price )*m.com_win/100 AS total_com2, 
//   SUM(s.sale_price )-((SUM(s.sale_price )*b.co_comm/100)+(SUM(win.win_amount )*m.com_win/100)+win.win_amount)
//   AS totalreturn
//   FROM member m 
//   LEFT JOIN sale s ON m.mem_id=s.mem_id AND s.is_cancel=0 AND s.ism_id=(SELECT MAX(i.ism_ref) FROM installment i) 
//   LEFT JOIN branch b ON m.brc_code=b.co_code
//   LEFT JOIN
//  (SELECT u.brc_code,i.ism_result_primary,SUM(s.sale_price*(SELECT IF(LENGTH(s.sale_num)=2,pay_two,IF(LENGTH(s.sale_num)=3,pay_three,IF(LENGTH(s.sale_num)=4,pay_four,IF(LENGTH(s.sale_num)=5,pay_five,pay_six)))) FROM payrate) /1000) AS win_amount 
//  FROM installment i 
//  RIGHT JOIN sale s ON s.ism_id=i.ism_ref AND s.is_cancel=0 
//  RIGHT JOIN member u ON u.mem_id=s.mem_id
//  WHERE i.ism_date =(SELECT MAX(ism_date) FROM installment) AND (s.sale_num = SUBSTRING(i.ism_result_primary, -6, 6) OR s.sale_num = SUBSTRING(i.ism_result_primary, -5, 5) OR s.sale_num = SUBSTRING(i.ism_result_primary, -4, 4) OR s.sale_num = SUBSTRING(i.ism_result_primary, -3, 3) OR s.sale_num = SUBSTRING(i.ism_result_primary, -2, 2)) 
//  GROUP BY u.brc_code ORDER BY u.brc_code ) AS win ON win.brc_code=m.brc_code GROUP BY m.brc_code  `;
 
 
 db.query(winSQL, (err, result) => {
    if (err) {
      console.log(err);
      res.send("ເກີດຂໍ້ຜິດພາດທາງດ້ານເຊີເວີ: " + err);
    } else {
      res.send(result);
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
