const db=require('../config/dbconn');

const saleReport=async(req,res)=>{
    const {memId,fromIsmDate} = req.query;

    const sqlCmd=`SELECT s.*,sc.scat_name,c.category_name,i.ism_date FROM sale s
    LEFT JOIN t_category c ON s.cat_id=c.category_id 
    LEFT JOIN sub_category sc ON sc.scat_id=s.sub_cat_id
    LEFT JOIN installment i ON i.ism_ref=s.ism_id
    WHERE s.ism_id IN (SELECT ism_id FROM installment WHERE ism_date >='${fromIsmDate} 00:00:00' ) 
    AND s.mem_id='${memId}' `;
    console.log(`Loading data ism: '${fromIsmDate}' mem: '${memId}'`);
    console.log("QUERY: ",sqlCmd);
    db.query(sqlCmd,(er,re)=>{

        if(er) return res.send('Error: '+er)
        console.log("Data responsed");
        res.send(re);
    })
}
const winReport=async(req, res)=>{
    console.log("Master win report is called");
    const {memId,fromIsmDate}=req.query;
    console.log("Master win report is called with memId "+memId+" fromIsmDate "+fromIsmDate);
    const sqlCmd=`SELECT s.* FROM sale s 
    LEFT JOIN installment i ON i.ism_ref=s.ism_id
    WHERE s.ism_id IN (SELECT ism_id FROM installment WHERE ism_date >='${fromIsmDate} 00:00:00') 
    AND ( IF(s.sub_cat_id=10,s.sale_num=i.ism_result_primary,s.sale_num=i.ism_result_secondary)
    OR IF(s.sub_cat_id=10,s.sale_num=SUBSTRING(i.ism_result_primary,-5,5),s.sale_num=SUBSTRING(i.ism_result_secondary, -5, 5))  
    OR IF(s.sub_cat_id=10,s.sale_num=SUBSTRING(i.ism_result_primary,-4,4),s.sale_num=SUBSTRING(i.ism_result_secondary, -4, 4))  
    OR IF(s.sub_cat_id=10,s.sale_num=SUBSTRING(i.ism_result_primary,-3,3),s.sale_num=SUBSTRING(i.ism_result_secondary, -3, 3))  
    OR IF(s.sub_cat_id=10,s.sale_num=SUBSTRING(i.ism_result_primary,-2,2),s.sale_num=SUBSTRING(i.ism_result_secondary, -2, 2))
    OR IF(s.sub_cat_id=10,s.sale_num=i.ism_result_primary_ou,s.sale_num=i.ism_result_secondary_ou)
    );`;
    const sqlCmd2=`CALL GetWinTransaction;`
    db.query(sqlCmd2,(er,re)=>{
        if(er) {
            console.log("Error: "+er);
            return 'Error: database error'+er;
        }
        console.log("Re: "+re[0]);
        res.send(re)
    })
}

module.exports={saleReport,winReport};