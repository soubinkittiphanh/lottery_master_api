const db=require('../config/dbconn');

const saleReport=async(req,res)=>{
    const {memId,ismId} = req.query;
    const sqlCmd=`SELECT s.* FROM sale s WHERE s.ism_id ='${ismId}' AND s.mem_id='${memId}' `;
    console.log(`Loading data ism: '${ismId}' mem: '${memId}'`);
    db.query(sqlCmd,(er,re)=>{

        if(er) return res.send('Error: '+er)
        console.log("Data responsed");
        res.send(re);
    })
}

module.exports={saleReport};