const db=require('../config/dbconn');

const saleReport=async(req,res)=>{
    const {memId,fromIsmDate} = req.query;

    const sqlCmd=`SELECT s.* FROM sale s WHERE s.ism_id IN (SELECT ism_id FROM installment WHERE ism_date >='${fromIsmDate} 00:00:00' ) AND s.mem_id='${memId}' `;
    console.log(`Loading data ism: '${fromIsmDate}' mem: '${memId}'`);
    console.log("QUERY: ",sqlCmd);
    db.query(sqlCmd,(er,re)=>{

        if(er) return res.send('Error: '+er)
        console.log("Data responsed");
        res.send(re);
    })
}

module.exports={saleReport};