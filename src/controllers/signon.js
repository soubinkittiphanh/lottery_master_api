
const Db = require("../config/dbconn");
// const bcrypt = require("bcryptjs");
const bcrypt = require("../../custom-bcrypt");
const hook = require("../middleware");
const login = async (req, res) => {
    console.log("Login....");
    const { userId, password } = req.body;
    if (!(userId && password)) return res.json({ "status": "01", "desc": "No required data" });
    const sqlCom = `SELECT mem_id,brc_code,group_code,mem_pass,mem_name,mem_lname,mem_tel FROM member WHERE mem_id ='${userId}'`;
    Db.query(sqlCom, (er, re) => {
        if (er) return res.json({ status: "05", desc: er })
        if (re.length==0) return res.json("ໄອດີບໍ່ ຖືກຕ້ອງ")
        const realPassword = re[0]["mem_pass"];
        const credential = { userId: re[0]["mem_id"], brcCode: re[0]["brc_code"], groupCode: re[0]["group_code"], userName: re[0]["mem_name"], userLname: re[0]["mem_lname"], userTel: re[0]["mem_tel"], }
        try {
            const isAuth = bcrypt.compare(password, realPassword)
            if (isAuth) {
                return res.json(hook.authen.generateToken(credential));
            }
        } catch (error) {
            res.json({ status: "01", desc: "invalid password" })
        }
    })
}

module.exports = {
    login,
}