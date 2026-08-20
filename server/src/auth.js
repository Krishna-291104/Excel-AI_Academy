const crypto=require('crypto');

const SECRET=()=>process.env.JWT_SECRET||'development-only-secret-change-me';

function base64url(v){return Buffer.from(v).toString('base64').replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function sign(payload){
  const head=base64url(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const body=base64url(JSON.stringify(payload));
  const data=head+'.'+body;
  const sig=crypto.createHmac('sha256',SECRET()).update(data).digest('base64url');
  return data+'.'+sig;
}
function verify(token){
  const [head,body,sig]=String(token||'').split('.');
  if(!head||!body||!sig) return null;
  const expected=crypto.createHmac('sha256',SECRET()).update(head+'.'+body).digest('base64url');
  if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))) return null;
  const p=JSON.parse(Buffer.from(body,'base64url').toString());
  if(!p.exp || p.exp<Date.now()/1000) return null;
  return p;
}
function hashPassword(password){
  const salt=crypto.randomBytes(16).toString('hex');
  const hash=crypto.scryptSync(password,salt,64).toString('hex');
  return salt+':'+hash;
}
function checkPassword(password,stored){
  const [salt,hash]=String(stored).split(':');
  if(!salt||!hash)return false;
  const test=crypto.scryptSync(password,salt,64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(test,'hex'),Buffer.from(hash,'hex'));
}
function tokenFor(user){
  return sign({sub:user.id,email:user.email,role:user.role,exp:Math.floor(Date.now()/1000)+60*60*24*7});
}
module.exports={hashPassword,checkPassword,tokenFor,verify};
