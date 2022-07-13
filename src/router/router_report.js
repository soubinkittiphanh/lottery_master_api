
const router=require("express").Router();
const reportMasterController=require("../controllers/report_master")
router.route("/sale_report")
.get(reportMasterController.saleReport);


module.exports={
    router
}