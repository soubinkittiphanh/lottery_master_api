const db = require("../../config/dbconn");
const getISM = async (req, res) => {
  const param_date = req.query.date;
  console.log("//::::::::::::::INSTALLMENT FETCH::::::::::::::");
   db.query(
    "SELECT * FROM installment where ism_date=?",
    [param_date],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
};
const createISM = async (req, res) => {
  console.log("ISM PR OU 2: "+req.body.ism_res_pr_ou);
  const i_ref = req.body.ism_ref;
  const i_date = req.body.ism_date;
  const i_res_pr = req.body.ism_res_pr;
  const i_res_pr_ou = req.body.ism_res_pr_ou;
  const i_res_sec = req.body.ism_res_sec;
  const i_res_sec_ou = req.body.ism_res_sec_ou;
  const i_categoryId = req.body.ism_category;
  const i_active = req.body.ism_active;
  const i_remark = req.body.ism_remark;
  const i_endtime = req.body.ism_endtime;
  console.log("//::::::::::::::CREATE ISM::::::::::::::");
   db.query(
    "INSERT INTO installment(ism_ref, ism_date, ism_result_primary,ism_result_secondary,ism_result_primary_ou,ism_result_secondary_ou, ism_active,cat_id,remark,end_time) values(?,?,?,?,?,?,?,?,?,?)",
    [i_ref, i_date, i_res_pr, i_res_sec,i_res_pr_ou,i_res_sec_ou,i_active,i_categoryId,i_remark,i_endtime],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("ຂໍ້ມູນບັນທຶກສຳເລັດ");
      }
    }
  );
};
const updateISM = async (req, res) => {
  const ref = req.body.ism_ref;
  const id = req.body.ism_id;
  const date = req.body.ism_date;
  const i_res_pr = req.body.ism_res_pr;
  const i_res_pr_ou = req.body.ism_res_pr_ou;
  const i_res_sec = req.body.ism_res_sec;
  const i_res_sec_ou = req.body.ism_res_sec_ou;
  const i_categoryId = req.body.ism_category;
  const i_remark = req.body.ism_remark;
  const i_endtime = req.body.ism_endtime;
  // ism_result_primary
  // ism_result_primary_ou
  // ism_result_secondary
  // ism_result_secondary_ou
  const active = req.body.ism_active;
  console.log("//::::::::::::::UPDATE ISM::::::::::::::");
  console.log(id);
   db.query(
    "UPDATE installment SET ism_ref= ?,ism_date=?,ism_result_primary=?,ism_result_secondary=?,ism_result_primary_ou=?,ism_result_secondary_ou=?, ism_active=?,cat_id=?,remark=?,end_time=? WHERE id= ? ",
    [ref, date, i_res_pr,i_res_sec,i_res_pr_ou,i_res_sec_ou, active,i_categoryId,i_remark,i_endtime, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("ຂໍ້ມູນຖືກບັນທຶກຮຽບຮ້ອຍ");
      }
    }
  );
};
const genISMID = async (req, res) => {
  console.log("//::::::::::::::ISM FETCH::::::::::::::");
   db.query(
    "SELECT MAX(`ism_ref`) as cur_ref FROM `installment` HAVING MAX(`ism_ref`) IS NOT null",
    (er, result) => {
      var numRows = result.length;
      console.log(numRows);
      if (er) {
        res.send(er);
      } else if (result) {
        if (numRows < 1) {
          res.send("10000");
        } else {
          const next_ref = result[0].cur_ref + 1;
          res.send("" + next_ref);
        }

        console.log("//::::::::::::::ກວດສອບງວດ::::::::::::::");
        console.log(result);
      }
    }
  );
};
const getISMREF = async (req, res) => {
  console.log("//::::::::::::::GET ISM REF MAX::::::::::::::");
  const selectDate=req.query.sel_date;
  console.log("date: "+selectDate);
  // const sqlCmd=`SELECT  * FROM installment  WHERE ism_active = 1 AND ism_date='${selectDate}'`;
  const sqlCmd=`SELECT  * FROM installment  WHERE ism_active = 1 `;
   db.query(
    sqlCmd,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("res len: "+result.length.toString());
        res.send(result);
      }
    }
  );
};
module.exports = {
  getISM,
  createISM,
  updateISM,
  genISMID,
  getISMREF,
};
