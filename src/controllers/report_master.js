const db=require('../config/dbconn');

const saleReport=async(req,res)=>{
    const {memId,fromIsmDate} = req.query;

    const sqlCmd=`SELECT s.*,sc.scat_name,s.category_name FROM sale s
    LEFT JOIN t_category c ON s.cat_id=c.category_id 
    LEFT JOIN sub_category sc ON sc.scat_id=s.sub_cat_id
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

module.exports={saleReport};