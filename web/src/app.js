import {api} from './api.js';

const state={view:'home',courses:[],datasets:[],progress:{},query:'',user:null,analystUnlocked:localStorage.getItem('excelai_analyst_unlocked')==='1'};

const app=document.getElementById('app');
const intro=document.getElementById('samuraiIntro');
window.setTimeout(()=>intro?.classList.add('hide'),3800);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){const t=document.querySelector('.toast');if(!t)return;t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function go(v){state.view=v;render();window.scrollTo({top:0,behavior:'smooth'})}

async function load(){
  try{
    const [c,d]=await Promise.all([api('/api/v1/courses'),api('/api/v1/datasets')]);
    state.courses=c.data;state.datasets=d.data;
  }catch(e){toast('Backend/database is not connected yet. Run the setup steps in README.')}
  const token=localStorage.getItem('excelai_token');
  if(token)try{state.user=(await api('/api/v1/auth/me')).user;state.progress=(await api('/api/v1/me/progress')).data.reduce((a,x)=>(a[x.lesson_id]=x,a),{});}catch{}
  render();
}

function intermediateComplete(){
 const required=['lesson-xlookup','lesson-pivots'];
 return required.every(id=>state.progress[id]?.completed);
}
function analystUnlocked(){ return state.analystUnlocked || intermediateComplete(); }
function analystCourseCard(c){
 if(!analystUnlocked()) return `<article class="card course lockedCourse"><span class="pill">LOCKED ACHIEVEMENT</span><h3>🔒 ${esc(c.title)}</h3><p class="muted">Complete the Excel Intermediate lessons to unlock this hidden Data Analyst course.</p><div class="lockMeter"><span>Requirement: XLOOKUP + Pivot Tables</span></div><button class="btn" data-toast="Keep learning Excel Intermediate to unlock this course.">Locked</button></article>`;
 return `<article class="card course unlockedCourse"><span class="pill">BONUS UNLOCKED</span><h3>${esc(c.title)}</h3><p class="muted">${esc(c.description)}</p><p class="muted">${c.lesson_count||0} lessons</p><button class="btn primary" data-course="${c.slug}">Open course</button></article>`;
}
function achievementModal(){
 return `<div class="modal achievementModal"><article class="card achievementBox"><div class="slashBurst"></div><span class="pill dangerPill">NEW ACHIEVEMENT</span><h2>Congratulations You Have Unlock New Achievement</h2><p class="muted">You reached the Excel Intermediate level. The hidden Data Analyst course has been unlocked.</p><div class="achievementLine">⚔️ EXCEL INTERMEDIATE COMPLETE → 🔓 DATA ANALYST UNLOCKED</div><div class="actions"><button class="btn primary" id="enterAnalyst">Enter Data Analyst Course</button><button class="btn" id="closeAchievement">Continue Learning</button></div></article></div>`;
}
function showAchievement(){
 if(!state.user || !intermediateComplete() || state.analystUnlocked || localStorage.getItem('excelai_analyst_achievement_seen')==='1') return;
 state.analystUnlocked=true;localStorage.setItem('excelai_analyst_unlocked','1');localStorage.setItem('excelai_analyst_achievement_seen','1');
 const m=document.getElementById('modal'); if(!m)return;
 m.innerHTML=achievementModal();
 document.getElementById('closeAchievement').onclick=()=>m.innerHTML='';
 document.getElementById('enterAnalyst').onclick=()=>{m.innerHTML='';go('learn');setTimeout(()=>openCourse('data-analyst'),0)};
}

function nav(){
 return `<header class="top"><nav class="nav"><div class="brand">Excel<span>AI</span> Academy</div>
 <div class="navlinks">${['home','learn','practice','datasets','tools','roadmap','progress'].map(x=>`<button class="${state.view===x?'active':''}" data-nav="${x}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div>
 <button data-nav="profile">${state.user?esc(state.user.name):'Profile'}</button></nav></header>`;
}

function home(){
 const lessons=state.courses.reduce((n,c)=>n+Number(c.lesson_count||0),0);
 return `<section class="hero"><div class="card heroMain"><div class="eyebrow">Professional Learning Platform</div>
 <h1>Learn Excel.<br>Practice with data.<br>Build analyst skills.</h1>
 <p class="muted">A clean learning environment for Excel, AI-assisted workflows, realistic datasets, practice and the Data Analyst journey.</p>
 <div class="actions"><button class="btn primary" data-nav="learn">Start Learning</button><button class="btn" data-nav="datasets">Explore Datasets</button><button class="btn" data-nav="roadmap">Career Roadmap</button></div></div>
 <div class="stats"><div class="card stat"><strong>${state.courses.length}</strong><span>Learning paths</span></div><div class="card stat"><strong>${lessons}</strong><span>Lessons</span></div><div class="card stat"><strong>${state.datasets.length}</strong><span>Datasets</span></div><div class="card stat"><strong>${Object.values(state.progress).filter(x=>x.completed).length}</strong><span>Completed</span></div></div></section>
 <div class="search"><input id="search" placeholder="Search lessons, courses, datasets…" value="${esc(state.query)}"><div id="results"></div></div>
 <div class="sectionTitle"><div><h2>Learning paths</h2><p class="muted">Structured progression without unnecessary complexity.</p></div></div>
 <section class="grid">${state.courses.map(course).join('')}</section>`;
}
function course(c){
 if(c.slug==='data-analyst') return analystCourseCard(c);
 return `<article class="card course"><span class="pill">${esc(c.level)}</span><h3>${esc(c.title)}</h3><p class="muted">${esc(c.description)}</p><p class="muted">${c.lesson_count||0} lessons</p><button class="btn primary" data-course="${c.slug}">Open course</button></article>`;
}
function learn(){
 return `<div class="sectionTitle"><div><h2>Learn</h2><p class="muted">Beginner → Intermediate → Advanced.</p></div></div><section class="grid">${state.courses.map(course).join('')}</section><div id="coursePanel"></div>`;
}
async function openCourse(slug){
 if(slug==='data-analyst' && !analystUnlocked()){toast('Data Analyst course is still locked. Complete Excel Intermediate first.');return;}
 try{
  const r=await api(`/api/v1/courses/${encodeURIComponent(slug)}`);
  document.getElementById('coursePanel').innerHTML=renderCourse(r.data);
 }catch(e){toast(e.message)}
}
function renderCourse(c){
 const modules=c.modules||[];
 return `<div class="card course" style="margin-top:18px"><span class="pill">${esc(c.level)}</span><h2>${esc(c.title)}</h2><p class="muted">${esc(c.description)}</p>
 ${modules.map(m=>`<h3>${esc(m.title)}</h3>${(m.lessons||[]).map(l=>`<div class="lesson"><div><b>${esc(l.title)}</b><small>${esc(l.level)} · ${l.duration_minutes} min</small></div><button class="btn" data-lesson="${l.slug}">Open</button></div>`).join('')}`).join('')}</div>`;
}
function datasets(){
 return `<div class="sectionTitle"><div><h2>Dataset Library</h2><p class="muted">Practice with realistic data.</p></div></div><section class="grid">${state.datasets.map(d=>`<article class="card course"><span class="pill">${esc(d.level)}</span><h3>${esc(d.title)}</h3><p class="muted">${esc(d.description)}</p><b>${Number(d.rows_count).toLocaleString()} rows</b><p class="muted">${(d.skills||[]).join(' · ')}</p><button class="btn primary" data-toast="Dataset practice module can now be connected to the storage/processing service.">Start challenge</button></article>`).join('')}</section>`;
}
function roadmap(){
 const x=['Excel Foundations','Advanced Excel','Power Query','SQL Foundations','Statistics','Data Visualization','Power BI','Python','Advanced Analytics','Portfolio Projects','Capstone','Job Readiness'];
 return `<div class="sectionTitle"><div><h2>Data Analyst Roadmap</h2><p class="muted">A staged path from spreadsheet fundamentals to career readiness.</p></div></div><div class="roadmap">${x.map((v,i)=>`<article class="card step"><span class="pill">${i+1}</span><b>${v}</b><span class="muted">${i<3?'Foundation':i<8?'Core skill':'Career progression'}</span></article>`).join('')}</div>`;
}
function practice(){
 const q=[['Which function is designed for flexible lookup operations?','XLOOKUP'],['Which tool is designed for repeatable data transformation?','Power Query'],['What should you do before trusting AI-generated output?','Verify it against the data and requirement']];
 return `<div class="sectionTitle"><div><h2>Practice Lab</h2><p class="muted">Short checks with instant feedback.</p></div></div><section class="grid">${q.map((x,i)=>`<article class="card course"><span class="pill">Question ${i+1}</span><h3>${x[0]}</h3><input class="answer" data-correct="${esc(x[1])}" placeholder="Type your answer"><button class="btn primary check" style="margin-top:10px">Check answer</button></article>`).join('')}</section>`;
}
function tools(){
 return `<div class="sectionTitle"><div><h2>Tools</h2><p class="muted">AI and data utilities through secure backend APIs.</p></div></div><section class="grid"><article class="card course"><span class="pill">Formula</span><h3>Formula Assistant</h3><p class="muted">Describe your spreadsheet task.</p><input id="formula" class="answer" placeholder="e.g. total revenue by region"><button class="btn primary" id="formulaBtn" style="margin-top:10px">Generate</button><div id="formulaOut"></div></article><article class="card course"><span class="pill">AI</span><h3>Lesson Coach</h3><p class="muted">The production API can securely route tutoring requests to an AI provider without exposing secrets.</p><button class="btn primary" data-toast="Connect your AI provider in the server environment.">Open Coach</button></article><article class="card course"><span class="pill">Data</span><h3>Data Lab</h3><p class="muted">Upload, profile, clean and analyze datasets through server-side processing.</p><button class="btn primary" data-toast="Dataset processing endpoint is the next module to connect.">Open Data Lab</button></article></section>`;
}
function progress(){
 const completed=Object.values(state.progress).filter(x=>x.completed).length;
 const total=state.courses.reduce((n,c)=>n+Number(c.lesson_count||0),0);
 return `<div class="card course"><span class="pill">Progress</span><h2>${completed} / ${total} lessons complete</h2><div class="progress"><i style="width:${total?completed/total*100:0}%"></i></div><p class="muted">${state.user?'Synced to your account.':'Guest progress is unavailable across devices until you sign in.'}</p></div>`;
}
function authView(){
 return `<div class="auth card course"><h2>Account</h2><p class="muted">Create an account to synchronize progress, bookmarks and learning history.</p><div class="field"><label>Name</label><input id="name"></div><div class="field"><label>Email</label><input id="email" type="email"></div><div class="field"><label>Password</label><input id="password" type="password" minlength="8"></div><div class="actions"><button class="btn primary" id="register">Create account</button><button class="btn" id="login">Sign in</button></div><p id="authMsg" class="muted"></p></div>`;
}
function profile(){
 if(!state.user)return authView();
 return `<div class="card course"><span class="pill">${esc(state.user.role)}</span><h2>Welcome, ${esc(state.user.name)}</h2><p class="muted">${esc(state.user.email)}</p><div class="actions"><button class="btn" id="logout">Sign out</button><button class="btn primary" data-nav="progress">View progress</button></div></div>`;
}
function render(){
 let content=state.view==='home'?home():state.view==='learn'?learn():state.view==='datasets'?datasets():state.view==='roadmap'?roadmap():state.view==='practice'?practice():state.view==='tools'?tools():state.view==='progress'?progress():profile();
 app.innerHTML=`${nav()}<main class="container">${content}</main><nav class="mobile">${['home','learn','datasets','progress'].map(v=>`<button data-nav="${v}">${v}</button>`).join('')}</nav><div id="modal"></div><div class="toast"></div>`;
 bind();
}
function bind(){
 document.querySelectorAll('[data-nav]').forEach(x=>x.onclick=()=>go(x.dataset.nav));
 document.querySelectorAll('[data-course]').forEach(x=>x.onclick=()=>openCourse(x.dataset.course));
 document.querySelectorAll('[data-toast]').forEach(x=>x.onclick=()=>toast(x.dataset.toast));
 document.querySelectorAll('.check').forEach(b=>b.onclick=()=>{const i=b.parentElement.querySelector('.answer');toast(i.value.trim().toLowerCase()===i.dataset.correct.toLowerCase()?'Correct!':'Not quite — review the lesson and try again.');});
 const s=document.getElementById('search'); if(s){s.oninput=async()=>{state.query=s.value;const box=document.getElementById('results');if(!s.value.trim()){box.innerHTML='';return}try{const r=await api('/api/v1/search?q='+encodeURIComponent(s.value));box.innerHTML=r.data.map(x=>`<div class="result"><b>${esc(x.title)}</b><small>${esc(x.type)} · ${esc(x.meta||'')}</small></div>`).join('')||'<div class="result">No result found.</div>'}catch{box.innerHTML='<div class="result">Search service unavailable.</div>'}}}
 const f=document.getElementById('formulaBtn');if(f)f.onclick=()=>{const v=document.getElementById('formula').value.toLowerCase();let o='Describe the lookup, aggregation or transformation you need.';if(v.includes('lookup'))o='Try =XLOOKUP(lookup_value, lookup_array, return_array).';else if(v.includes('total')||v.includes('sum'))o='Try =SUM(range) or =SUMIFS(sum_range, criteria_range, criteria).';else if(v.includes('count'))o='Try =COUNTIF(range, criteria).';document.getElementById('formulaOut').innerHTML=`<p class="muted"><b>Suggestion:</b> ${o}</p>`};
 const reg=document.getElementById('register');if(reg)reg.onclick=()=>register();
 const login=document.getElementById('login');if(login)login.onclick=()=>loginUser();
 const logout=document.getElementById('logout');if(logout)logout.onclick=()=>{localStorage.removeItem('excelai_token');state.user=null;state.progress={};go('home')};
 document.querySelectorAll('[data-lesson]').forEach(x=>x.onclick=()=>openLesson(x.dataset.lesson));
}
async function register(){
 const msg=document.getElementById('authMsg');try{const r=await api('/api/v1/auth/register',{method:'POST',body:JSON.stringify({name:document.getElementById('name').value,email:document.getElementById('email').value,password:document.getElementById('password').value})});localStorage.setItem('excelai_token',r.token);state.user=r.user;toast('Account created.');go('home')}catch(e){msg.textContent=e.message}
}
async function loginUser(){
 const msg=document.getElementById('authMsg');try{const r=await api('/api/v1/auth/login',{method:'POST',body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('password').value})});localStorage.setItem('excelai_token',r.token);state.user=r.user;toast('Signed in.');go('home')}catch(e){msg.textContent=e.message}
}
async function openLesson(slug){
 try{
  const r=await api('/api/v1/lessons/'+encodeURIComponent(slug));const l=r.data;
  let quiz=null; try{quiz=(await api('/api/v1/lessons/'+encodeURIComponent(slug)+'/quiz')).data}catch{}
  const quizHtml=quiz?`<h3>Knowledge Check</h3><div class="quizBox">${quiz.questions.map(q=>`<div class="quizQuestion" data-answer="${esc(q.answer)}"><b>${esc(q.question)}</b>${q.options.map(o=>`<label class="quizOption"><input type="radio" name="${esc(q.id)}" value="${esc(o[0])}"> ${esc(o[1])}</label>`).join('')}<button class="btn checkQuiz">Check</button></div>`).join('')}</div>`:'<p class="muted">No quiz is attached to this lesson yet.</p>';
  document.getElementById('modal').innerHTML=`<div class="modal"><article class="card modalBox"><button class="btn close" id="close">Close</button><span class="pill">${esc(l.level)}</span><h2>${esc(l.title)}</h2><p class="muted">${esc(l.course_title)} · ${esc(l.module_title)} · ${l.duration_minutes} min</p><h3>Objectives</h3><ul>${(l.objectives||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Lesson</h3>${(l.content||[]).map(x=>`<p class="muted">${esc(x)}</p>`).join('')}${quizHtml}<div class="actions"><button class="btn primary" id="complete">Mark complete</button></div></article></div>`;
  document.getElementById('close').onclick=()=>document.getElementById('modal').innerHTML='';
  document.querySelectorAll('.checkQuiz').forEach(btn=>btn.onclick=()=>{const q=btn.closest('.quizQuestion'),chosen=q.querySelector('input:checked');toast(!chosen?'Choose an answer first.':chosen.value===q.dataset.answer?'Correct!':'Not quite — try again.');});
  document.getElementById('complete').onclick=async()=>{if(!state.user){toast('Sign in first to save progress across devices.');return}try{await api('/api/v1/me/progress/'+l.id,{method:'PUT',body:JSON.stringify({completed:true})});state.progress[l.id]={completed:true};render();toast('Progress saved.');showAchievement()}catch(e){toast(e.message)}};
 }catch(e){toast(e.message)}
}
load();
