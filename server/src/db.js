let pool=null;
if(process.env.DATABASE_URL){
  const {Pool}=require('pg');
  pool=new Pool({connectionString:process.env.DATABASE_URL});
}
async function query(text,params=[]){
  if(!pool) throw new Error('Database is not configured. Set DATABASE_URL.');
  return pool.query(text,params);
}
module.exports={pool,query};
