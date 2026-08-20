const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

async function main(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const client=new Client({connectionString:process.env.DATABASE_URL});
  await client.connect();
  const dir=path.join(__dirname,'../migrations');
  for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.sql')).sort()){
    console.log('Running',file);
    await client.query(fs.readFileSync(path.join(dir,file),'utf8'));
  }
  await client.end();
  console.log('Migration complete.');
}
main().catch(e=>{console.error(e);process.exit(1)});
