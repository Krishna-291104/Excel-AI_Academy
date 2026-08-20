const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {query}=require('./db');
const {hashPassword,checkPassword,tokenFor,verify}=require('./auth');
const {localApi, isLocalMode}=require('./local-data');

const PORT=Number(process.env.PORT||4000);
const WEB=path.join(__dirname,'../../web');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};

function json(res,status,data,extra={}){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':process.env.WEB_ORIGIN||`http://localhost:${PORT}`,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type, Authorization',...extra});
  res.end(JSON.stringify(data));
}
function body(req){
  return new Promise((resolve,reject)=>{
    let raw='';req.on('data',c=>{raw+=c;if(raw.length>1e6)req.destroy()});
    req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch(e){reject(e)}});
    req.on('error',reject);
  });
}
function auth(req){
  const h=req.headers.authorization||'';
  return h.startsWith('Bearer ')?verify(h.slice(7)):null;
}
function safeUser(u){return {id:u.id,name:u.name,email:u.email,role:u.role}}

async function api(req,res,url){
  const p=url.pathname;
  if(isLocalMode()) return localApi(req,res,url,{json,body,auth});
  if(p==='/api/v1/health') return json(res,200,{ok:true,service:'excelai-api',time:new Date().toISOString()});

  if(p==='/api/v1/auth/register'&&req.method==='POST'){
    const b=await body(req); const name=String(b.name||'').trim(); const email=String(b.email||'').trim().toLowerCase(); const password=String(b.password||'');
    if(name.length<2||!email.includes('@')||password.length<8)return json(res,400,{error:'Name, valid email and password of at least 8 characters are required.'});
    try{
      const exists=await query('SELECT id FROM users WHERE email=$1',[email]);
      if(exists.rowCount)return json(res,409,{error:'An account with this email already exists.'});
      const r=await query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role',[name,email,hashPassword(password)]);
      return json(res,201,{user:safeUser(r.rows[0]),token:tokenFor(r.rows[0])});
    }catch(e){return json(res,500,{error:'Registration failed.'})}
  }

  if(p==='/api/v1/auth/login'&&req.method==='POST'){
    const b=await body(req); const email=String(b.email||'').trim().toLowerCase(); const password=String(b.password||'');
    try{
      const r=await query('SELECT * FROM users WHERE email=$1',[email]);
      if(!r.rowCount||!checkPassword(password,r.rows[0].password_hash))return json(res,401,{error:'Invalid email or password.'});
      return json(res,200,{user:safeUser(r.rows[0]),token:tokenFor(r.rows[0])});
    }catch(e){return json(res,500,{error:'Login failed.'})}
  }

  if(p==='/api/v1/auth/me'&&req.method==='GET'){
    const a=auth(req); if(!a)return json(res,401,{error:'Authentication required.'});
    const r=await query('SELECT id,name,email,role FROM users WHERE id=$1',[a.sub]);
    return r.rowCount?json(res,200,{user:safeUser(r.rows[0])}):json(res,401,{error:'Account not found.'});
  }

  if(p==='/api/v1/courses'&&req.method==='GET'){
    const r=await query(`SELECT c.id,c.slug,c.title,c.description,c.level,
      COUNT(l.id)::int AS lesson_count
      FROM courses c LEFT JOIN modules m ON m.course_id=c.id
      LEFT JOIN lessons l ON l.module_id=m.id AND l.published=true
      WHERE c.published=true GROUP BY c.id ORDER BY c.created_at`);
    return json(res,200,{data:r.rows});
  }


  const courseMatch=p.match(/^\/api\/v1\/courses\/([^/]+)$/);
  if(courseMatch&&req.method==='GET'){
    try{
      const r=await query(`SELECT c.id,c.slug,c.title,c.description,c.level
        FROM courses c
        WHERE c.slug=$1 AND c.published=true`,[courseMatch[1]]);

      if(!r.rowCount)
        return json(res,404,{error:'Course not found.'});

      const course=r.rows[0];

      const modules=await query(`SELECT m.id,m.slug,m.title,m.order_index
        FROM modules m
        WHERE m.course_id=$1
        ORDER BY m.order_index,m.id`,[course.id]);

      const moduleData=[];

      for(const m of modules.rows){
        const lessons=await query(`SELECT l.id,l.slug,l.title,l.level,
            l.duration_minutes,l.content,l.objectives,l.order_index
          FROM lessons l
          WHERE l.module_id=$1 AND l.published=true
          ORDER BY l.order_index,l.id`,[m.id]);

        moduleData.push({
          ...m,
          lessons:lessons.rows
        });
      }

      return json(res,200,{
        data:{
          ...course,
          modules:moduleData
        }
      });
    }catch(e){
      console.error('Course detail API error:',e);
      return json(res,500,{error:'Failed to load course.'});
    }
  }

  const lessonMatch=p.match(/^\/api\/v1\/lessons\/([^/]+)$/);
  if(lessonMatch&&req.method==='GET'){
    const r=await query(`SELECT l.id,l.slug,l.title,l.level,l.duration_minutes,l.content,l.objectives,
      c.slug course_slug,c.title course_title,m.title module_title
      FROM lessons l JOIN modules m ON m.id=l.module_id JOIN courses c ON c.id=m.course_id
      WHERE l.slug=$1 AND l.published=true`,[lessonMatch[1]]);
    return r.rowCount?json(res,200,{data:r.rows[0]}):json(res,404,{error:'Lesson not found.'});
  }

  if(p==='/api/v1/datasets'&&req.method==='GET'){
    const r=await query('SELECT id,slug,title,level,description,rows_count,skills FROM datasets ORDER BY title');
    return json(res,200,{data:r.rows});
  }

  if(p==='/api/v1/search'&&req.method==='GET'){
    const q=String(url.searchParams.get('q')||'').trim();
    if(!q)return json(res,200,{data:[]});
    const like='%'+q+'%';
    const r=await query(`SELECT 'lesson' type,l.slug id,l.title title,l.level meta
      FROM lessons l WHERE l.published=true AND (l.title ILIKE $1 OR l.slug ILIKE $1)
      UNION ALL SELECT 'course',c.slug,c.title,c.level FROM courses c WHERE c.published=true AND c.title ILIKE $1
      UNION ALL SELECT 'dataset',d.slug,d.title,d.level FROM datasets d WHERE d.title ILIKE $1
      LIMIT 30`,[like]);
    return json(res,200,{data:r.rows});
  }

  const progressMatch=p.match(/^\/api\/v1\/me\/progress\/([^/]+)$/);
  if(progressMatch&&req.method==='PUT'){
    const a=auth(req); if(!a)return json(res,401,{error:'Authentication required.'});
    const b=await body(req); const completed=Boolean(b.completed); const score=b.score==null?null:Number(b.score);
    await query(`INSERT INTO progress(user_id,lesson_id,completed,score,completed_at,updated_at)
      VALUES($1,$2,$3,$4,CASE WHEN $3 THEN now() ELSE NULL END,now())
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed=EXCLUDED.completed,score=EXCLUDED.score,
      completed_at=EXCLUDED.completed_at,updated_at=now()`,[a.sub,progressMatch[1],completed,score]);
    return json(res,200,{ok:true});
  }

  if(p==='/api/v1/me/progress'&&req.method==='GET'){
    const a=auth(req); if(!a)return json(res,401,{error:'Authentication required.'});
    const r=await query(`SELECT lesson_id,completed,score,time_spent_seconds,completed_at
      FROM progress WHERE user_id=$1 ORDER BY updated_at DESC`,[a.sub]);
    return json(res,200,{data:r.rows});
  }

  if(p==='/api/v1/me/bookmarks'&&req.method==='GET'){
    const a=auth(req); if(!a)return json(res,401,{error:'Authentication required.'});
    const r=await query(`SELECT l.id,l.slug,l.title,b.created_at FROM bookmarks b JOIN lessons l ON l.id=b.lesson_id
      WHERE b.user_id=$1 ORDER BY b.created_at DESC`,[a.sub]);
    return json(res,200,{data:r.rows});
  }

  const bookmarkMatch=p.match(/^\/api\/v1\/me\/bookmarks\/([^/]+)$/);
  if(bookmarkMatch&&(req.method==='POST'||req.method==='DELETE')){
    const a=auth(req); if(!a)return json(res,401,{error:'Authentication required.'});
    if(req.method==='POST')await query('INSERT INTO bookmarks(user_id,lesson_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[a.sub,bookmarkMatch[1]]);
    else await query('DELETE FROM bookmarks WHERE user_id=$1 AND lesson_id=$2',[a.sub,bookmarkMatch[1]]);
    return json(res,200,{ok:true});
  }

  if(p==='/api/v1/events'&&req.method==='POST'){
    const a=auth(req); const b=await body(req);
    if(!b.eventName)return json(res,400,{error:'eventName is required.'});
    await query('INSERT INTO analytics_events(user_id,event_name,properties) VALUES($1,$2,$3)',[a?.sub||null,String(b.eventName).slice(0,100),b.properties||{}]);
    return json(res,202,{accepted:true});
  }

  return json(res,404,{error:'API route not found.'});
}

function serveStatic(req,res,url){
  let rel=url.pathname==='/'?'/index.html':url.pathname;
  if(rel.includes('..'))return json(res,400,{error:'Invalid path'});
  const file=path.join(WEB,rel);
  fs.stat(file,(e,st)=>{
    if(e||!st.isFile())return json(res,404,{error:'Page not found'});
    const ext=path.extname(file);res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public,max-age=86400'});
    fs.createReadStream(file).pipe(res);
  });
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':process.env.WEB_ORIGIN||`http://localhost:${PORT}`,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type, Authorization'});return res.end();}
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  try{if(url.pathname.startsWith('/api/'))await api(req,res,url);else serveStatic(req,res,url)}
  catch(e){console.error(e);json(res,500,{error:'Internal server error.'})}
});
server.listen(PORT,()=>console.log(`ExcelAI Academy running at http://localhost:${PORT}`));


// Course detail API: returns a course together with its modules and lessons.
app.get("/api/v1/courses/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const courseResult = await pool.query(
      `SELECT id, slug, title, description, level, category, image_url, created_at
       FROM courses
       WHERE slug = $1
       LIMIT 1`,
      [slug]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = courseResult.rows[0];

    const modulesResult = await pool.query(
      `SELECT id, course_id, title, description, position
       FROM modules
       WHERE course_id = $1
       ORDER BY position ASC, id ASC`,
      [course.id]
    );

    const modules = [];
    for (const module of modulesResult.rows) {
      const lessonsResult = await pool.query(
        `SELECT id, module_id, slug, title, description, position
         FROM lessons
         WHERE module_id = $1
         ORDER BY position ASC, id ASC`,
        [module.id]
      );

      modules.push({
        ...module,
        lessons: lessonsResult.rows
      });
    }

    return res.json({
      ...course,
      modules
    });
  } catch (error) {
    console.error("GET /api/v1/courses/:slug failed:", error);
    return res.status(500).json({ error: "Failed to load course" });
  }
});

