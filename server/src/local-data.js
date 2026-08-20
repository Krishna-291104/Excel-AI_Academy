const crypto=require('crypto');
const {hashPassword,checkPassword,tokenFor}=require('./auth');

const courses=[
 {id:'course-excel-core',slug:'excel-core',title:'Excel Core Skills',description:'From spreadsheet fundamentals to advanced analysis.',level:'beginner'},
 {id:'course-ai-excel',slug:'ai-excel',title:'AI in Excel',description:'Use AI-assisted workflows safely and effectively inside spreadsheet work.',level:'intermediate'},
 {id:'course-data-analysis',slug:'data-analysis',title:'Data Analyst Roadmap',description:'Progress from Excel through SQL, BI, Python and portfolio projects.',level:'advanced'}
];
const modules=[
 {id:'mod-starter',course_id:'course-excel-core',slug:'excel-starter',title:'Excel Starter',order_index:1},
 {id:'mod-intermediate',course_id:'course-excel-core',slug:'excel-intermediate',title:'Excel Intermediate',order_index:2},
 {id:'mod-advanced',course_id:'course-excel-core',slug:'excel-advanced',title:'Excel Advanced',order_index:3},
 {id:'mod-ai',course_id:'course-ai-excel',slug:'ai-foundations',title:'AI in Excel',order_index:1},
 {id:'mod-analyst',course_id:'course-data-analysis',slug:'analyst-foundations',title:'Analyst Foundations',order_index:1}
];
const lessons=[
 ['lesson-interface','excel-starter','excel-interface','Excel Interface & Workbook Basics','beginner',20,['Understand workbooks, worksheets, rows, columns and cell references.','Navigate the Excel interface efficiently.'],['Navigate Excel confidently','Understand workbook structure']],
 ['lesson-formulas','excel-starter','formulas','Formula Foundations','beginner',25,['Understand formulas, operators and cell references.','Build simple calculations and verify results.'],['Write basic formulas','Use references correctly']],
 ['lesson-xlookup','excel-intermediate','xlookup','XLOOKUP','intermediate',25,['Understand lookup logic.','Use XLOOKUP to return matching values.'],['Build XLOOKUP formulas','Handle missing matches']],
 ['lesson-pivots','excel-intermediate','pivot-tables','Pivot Tables','intermediate',30,['Summarize large datasets.','Group, filter and compare measures.'],['Create pivot tables','Summarize business data']],
 ['lesson-powerquery','excel-advanced','power-query','Power Query','advanced',35,['Build repeatable data transformation workflows.','Apply cleaning and shaping steps.'],['Transform data','Create repeatable workflows']],
 ['lesson-ai','ai-foundations','ai-prompting','Prompting for Spreadsheet Tasks','intermediate',25,['Write precise spreadsheet prompts.','Specify inputs, constraints and expected outputs.'],['Create reliable prompts','Review AI output']],
 ['lesson-sql','analyst-foundations','sql-foundations','SQL Foundations','intermediate',40,['Understand SELECT, WHERE, GROUP BY and JOIN concepts.'],['Read SQL queries','Build simple analytical queries']]
].map(x=>({id:x[0],module_slug:x[1],slug:x[2],title:x[3],level:x[4],duration_minutes:x[5],content:x[6],objectives:x[7],published:true,order_index:1}));

const datasets=[
 {id:'ds-retail',slug:'retail-sales',title:'Retail Sales — Beginner',level:'beginner',description:'Retail transaction data for formula and chart practice.',rows_count:120,skills:['SUMIFS','XLOOKUP','Charts']},
 {id:'ds-ecommerce',slug:'ecommerce',title:'E-commerce Orders — Intermediate',level:'intermediate',description:'Order-level data for cleaning and pivot analysis.',rows_count:1500,skills:['Cleaning','Pivot Tables','Analysis']},
 {id:'ds-marketing',slug:'marketing',title:'Marketing Campaigns — Advanced',level:'advanced',description:'Campaign performance data for ROI and segmentation.',rows_count:5000,skills:['Segmentation','ROI','Visualization']},
 {id:'ds-finance',slug:'finance',title:'Finance Reconciliation — Expert',level:'expert',description:'Reconciliation practice with exceptions and controls.',rows_count:12000,skills:['Reconciliation','Exceptions','Controls']}
];
const quizzes={
 'excel-interface':{title:'Excel Basics Check',questions:[{id:'q1',question:'Which Excel object contains cells arranged in rows and columns?',options:[['A','Worksheet'],['B','Workbook'],['C','Formula'],['D','Chart']],answer:'A',hint:'Think about the grid where you enter data.'}]},
 formulas:{title:'Formula Foundations Check',questions:[{id:'q1',question:'Which symbol starts a normal Excel formula?',options:[['A','='],['B','+'],['C','#'],['D','@']],answer:'A',hint:'It tells Excel to calculate an expression.'}]},
 xlookup:{title:'XLOOKUP Check',questions:[{id:'q1',question:'What does XLOOKUP primarily do?',options:[['A','Finds a value and returns a related value'],['B','Creates a chart'],['C','Removes duplicate rows'],['D','Formats a worksheet']],answer:'A',hint:'It is a lookup function.'}]},
 'pivot-tables':{title:'Pivot Table Check',questions:[{id:'q1',question:'What is a key purpose of a PivotTable?',options:[['A','Summarize and analyze data'],['B','Write VBA automatically'],['C','Change file format'],['D','Encrypt a workbook']],answer:'A',hint:'Think about summarizing many rows quickly.'}]},
 'power-query':{title:'Power Query Check',questions:[{id:'q1',question:'What is Power Query mainly used for?',options:[['A','Importing and transforming data'],['B','Drawing shapes'],['C','Creating passwords'],['D','Changing screen brightness']],answer:'A',hint:'It prepares data before analysis.'}]},
 'ai-prompting':{title:'AI in Excel Check',questions:[{id:'q1',question:'What should you do before trusting AI-generated spreadsheet output?',options:[['A','Verify it against the data and requirement'],['B','Publish it immediately'],['C','Delete the source data'],['D','Ignore the requirement']],answer:'A',hint:'AI output should be checked.'}]},
 'sql-foundations':{title:'SQL Foundations Check',questions:[{id:'q1',question:'Which SQL keyword is commonly used to choose columns?',options:[['A','SELECT'],['B','PICK'],['C','CHOOSE'],['D','COLUMN']],answer:'A',hint:'It appears at the beginning of many queries.'}]}
};

const users=new Map();
const progress=new Map();
const bookmarks=new Set();

function findUserByToken(auth,req){const a=auth(req); return a?users.get(a.sub):null;}
function cleanUser(u){return {id:u.id,name:u.name,email:u.email,role:u.role};}
function routeId(v){return decodeURIComponent(v||'');}

async function localApi(req,res,url,{json,body,auth}){
 const p=url.pathname;
 if(p==='/api/v1/health') return json(res,200,{ok:true,service:'excelai-local',mode:'file'});
 if(p==='/api/v1/courses'&&req.method==='GET'){
   return json(res,200,{data:courses.map(c=>({...c,lesson_count:lessons.filter(l=>modules.find(m=>m.slug===l.module_slug)?.course_id===c.id).length}))});
 }
 const cm=p.match(/^\/api\/v1\/courses\/([^/]+)$/);
 if(cm&&req.method==='GET'){
   const c=courses.find(x=>x.slug===routeId(cm[1]));
   if(c && c.slug==='data-analyst'){
     const u=findUserByToken(auth,req);
     if(!u)return json(res,401,{error:'Sign in and complete Excel Intermediate to unlock the Data Analyst course.'});
     const unlocked=['lesson-xlookup','lesson-pivots'].every(id=>progress.get(u.id+':'+id)?.completed);
     if(!unlocked)return json(res,403,{error:'Data Analyst course is locked. Complete the Excel Intermediate lessons first.'});
   }
   if(!c)return json(res,404,{error:'Course not found.'});
   const ms=modules.filter(m=>m.course_id===c.id).sort((a,b)=>a.order_index-b.order_index).map(m=>({...m,lessons:lessons.filter(l=>l.module_slug===m.slug).sort((a,b)=>a.order_index-b.order_index)}));
   return json(res,200,{data:{...c,modules:ms}});
 }
 const lm=p.match(/^\/api\/v1\/lessons\/([^/]+)$/);
 if(lm&&req.method==='GET'){
   const l=lessons.find(x=>x.slug===routeId(lm[1]));
   if(!l)return json(res,404,{error:'Lesson not found.'});
   const m=modules.find(x=>x.slug===l.module_slug), c=courses.find(x=>x.id===m.course_id);
   return json(res,200,{data:{...l,module_title:m.title,course_title:c.title}});
 }
 const qm=p.match(/^\/api\/v1\/lessons\/([^/]+)\/quiz$/);
 if(qm&&req.method==='GET'){
   const q=quizzes[routeId(qm[1])];
   return q?json(res,200,{data:q}):json(res,404,{error:'Quiz not found.'});
 }
 if(p==='/api/v1/datasets'&&req.method==='GET') return json(res,200,{data:datasets});
 if(p==='/api/v1/search'&&req.method==='GET'){
   const q=String(url.searchParams.get('q')||'').toLowerCase().trim();
   const data=q?[...lessons.filter(x=>x.title.toLowerCase().includes(q)).map(x=>({type:'lesson',id:x.slug,title:x.title,meta:x.level})),...courses.filter(x=>x.title.toLowerCase().includes(q)).map(x=>({type:'course',id:x.slug,title:x.title,meta:x.level})),...datasets.filter(x=>x.title.toLowerCase().includes(q)).map(x=>({type:'dataset',id:x.slug,title:x.title,meta:x.level}))]:[];
   return json(res,200,{data:data.slice(0,30)});
 }
 if(p==='/api/v1/auth/register'&&req.method==='POST'){
   const b=await body(req),name=String(b.name||'').trim(),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
   if(name.length<2||!email.includes('@')||password.length<8)return json(res,400,{error:'Name, valid email and password of at least 8 characters are required.'});
   if([...users.values()].some(u=>u.email===email))return json(res,409,{error:'An account with this email already exists.'});
   const u={id:crypto.randomUUID(),name,email,password_hash:hashPassword(password),role:'student'};users.set(u.id,u);
   return json(res,201,{user:cleanUser(u),token:tokenFor(u)});
 }
 if(p==='/api/v1/auth/login'&&req.method==='POST'){
   const b=await body(req),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
   const u=[...users.values()].find(x=>x.email===email);
   if(!u||!checkPassword(password,u.password_hash))return json(res,401,{error:'Invalid email or password.'});
   return json(res,200,{user:cleanUser(u),token:tokenFor(u)});
 }
 if(p==='/api/v1/auth/me'&&req.method==='GET'){const u=findUserByToken(auth,req);return u?json(res,200,{user:cleanUser(u)}):json(res,401,{error:'Authentication required.'});}
 const pm=p.match(/^\/api\/v1\/me\/progress\/([^/]+)$/);
 if(pm&&req.method==='PUT'){const u=findUserByToken(auth,req);if(!u)return json(res,401,{error:'Authentication required.'});const b=await body(req);progress.set(u.id+':'+routeId(pm[1]),{lesson_id:routeId(pm[1]),completed:Boolean(b.completed),score:b.score??null});return json(res,200,{ok:true});}
 if(p==='/api/v1/me/progress'&&req.method==='GET'){const u=findUserByToken(auth,req);if(!u)return json(res,401,{error:'Authentication required.'});return json(res,200,{data:[...progress.entries()].filter(([k])=>k.startsWith(u.id+':')).map(([,v])=>v)});}
 if(p==='/api/v1/me/bookmarks'&&req.method==='GET'){const u=findUserByToken(auth,req);if(!u)return json(res,401,{error:'Authentication required.'});return json(res,200,{data:[]});}
 if(p==='/api/v1/events'&&req.method==='POST'){return json(res,202,{accepted:true});}
 return json(res,404,{error:'API route not found.'});
}
function isLocalMode(){return !process.env.DATABASE_URL;}
module.exports={localApi,isLocalMode};
