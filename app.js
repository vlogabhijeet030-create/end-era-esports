const END_ERA_API="https://script.google.com/macros/s/AKfycbxjDkPM1foNGh76ieWGK-rq1_adN0jivaihhqwcORVtQsWstQcqE8dImABn6lyGJFBYCA/exec";

async function endEraApi(action,data={}){
 try{
  const r=await fetch(END_ERA_API,{
   method:"POST",
   headers:{"Content-Type":"text/plain;charset=utf-8"},
   body:JSON.stringify({action,...data})
  });
  return await r.json();
 }catch(e){
  return {ok:false,message:"Server connection failed"};
 }
}

function saveUser(u){localStorage.setItem("ee_user",JSON.stringify(u))}
function getUser(){
 try{return JSON.parse(localStorage.getItem("ee_user")||"null")}
 catch(e){return null}
}
function logout(){
 localStorage.removeItem("ee_user");
 localStorage.removeItem("ee_admin");
 location.href="login.html";
}
function guardLogin(){if(!getUser())location.href="login.html"}
function guardAdmin(){
 const u=getUser();
 if(!u||u.role!=="admin")location.href="login.html";
}
function msg(x){alert(x||"Done")}

async function signupUser(name,email,phone,password){
 const r=await endEraApi("signup",{name,email,phone,password});
 if(r.ok&&r.user)saveUser(r.user);
 return r;
}

async function loginUser(email,password){
 const r=await endEraApi("login",{email,password});
 if(r.ok&&r.user)saveUser(r.user);
 return r;
}

async function getTournaments(){
 return endEraApi("getTournaments");
}

async function getTournament(id){
 return endEraApi("getTournament",{tournamentId:id});
}

async function getMyTeams(uid){
 return endEraApi("getMyTeams",{userId:uid});
}

async function registerTeam(tid,teamId,uid){
 return endEraApi("registerTeam",{
  tournamentId:tid,
  teamId:teamId,
  registeredBy:uid
 });
}

async function getRegistrations(tid){
 return endEraApi("getRegistrations",{tournamentId:tid});
}

async function adminSetRegistration(tid,open){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};
 return endEraApi("setRegistration",{
  tournamentId:tid,
  registrationOpen:!!open,
  adminEmail:u.email
 });
}

/* OPEN / CLOSE BUTTON FIX */
async function toggleRegistration(tid,open){
 const r=await adminSetRegistration(tid,open);
 msg(r.message);
 if(r.ok&&typeof renderAdmin==="function")renderAdmin();
 return r;
}

async function openRegistration(tid){
 return toggleRegistration(tid,true);
}

async function closeRegistration(tid){
 return toggleRegistration(tid,false);
}

async function adminCreateTournament(data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};
 return endEraApi("createTournament",{
  ...data,
  adminEmail:u.email
 });
}

async function adminUpdateTournament(tid,data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};
 return endEraApi("updateTournament",{
  tournamentId:tid,
  adminEmail:u.email,
  ...data
 });
}

async function adminApproveRegistration(id){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};
 return endEraApi("approveRegistration",{
  registrationId:id,
  adminEmail:u.email
 });
}

async function adminRejectRegistration(id){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};
 return endEraApi("rejectRegistration",{
  registrationId:id,
  adminEmail:u.email
 });
}

/* REGISTRATION SUBMIT FIX */
async function submitTournamentRegistration(tournamentId,teamId){
 const u=getUser();

 if(!u){
  msg("Please login first");
  location.href="login.html";
  return false;
 }

 if(!tournamentId||!teamId){
  msg("Tournament or team missing");
  return false;
 }

 msg("Submitting registration...");

 const r=await registerTeam(
  tournamentId,
  teamId,
  u.userId
 );

 msg(r.message);

 if(r.ok){
  setTimeout(()=>location.reload(),700);
 }

 return r.ok;
}

/* REGISTER BUTTON FIX */
async function startRegistration(tid){
 const u=getUser();

 if(!u){
  msg("Please login first");
  location.href="login.html";
  return;
 }

 const r=await getMyTeams(u.userId);

 if(!r.ok){
  msg(r.message);
  return;
 }

 const teams=r.teams||[];

 if(!teams.length){
  msg("Please create a team first");
  return;
 }

 let teamId;

 if(teams.length===1){
  teamId=teams[0].teamId;
 }else{
  let s="Select team:\n\n";
  teams.forEach((x,i)=>s+=(i+1)+". "+x.teamName+"\n");

  const n=parseInt(prompt(s+"\nEnter number:"),10)-1;

  if(isNaN(n)||!teams[n]){
   msg("Invalid team");
   return;
  }

  teamId=teams[n].teamId;
 }

 await submitTournamentRegistration(tid,teamId);
}

/* TOURNAMENT CARD */
function tournamentCard(t){
 const open=
  t.registrationOpen===true||
  String(t.registrationOpen).toLowerCase()==="true";

 const id=String(t.tournamentId||"");

 return `
 <article class="card">
  <span class="tag">${esc(t.type||"SCRIM")}</span>
  <h2>${esc(t.name||"Tournament")}</h2>

  <div class="meta">
   <span>ENTRY <b>${esc(t.entryFee||"FREE")}</b></span>
   <span>PRIZE <b>${esc(t.prize||"TBA")}</b></span>
   <span>MAP <b>${esc(t.map||"TBA")}</b></span>
   <span>TIME <b>${esc(t.matchTime||"TBA")}</b></span>
  </div>

  ${
   open
   ?`<button type="button" class="btn full"
      onclick="startRegistration('${id}')">
      Register
     </button>`
   :`<span class="btn full">Registration Closed</span>`
  }
 </article>`;
}

async function renderMatches(){
 const b=document.getElementById("matches");
 if(!b)return;
 b.innerHTML="<p>Loading...</p>";

 const r=await getTournaments();

 if(!r.ok){
  b.innerHTML="<p>Unable to load tournaments.</p>";
  return;
 }

 b.innerHTML=(r.tournaments||[]).map(tournamentCard).join("");
}

async function showT(type="all"){
 const b=document.getElementById("tournaments");
 if(!b)return;

 const r=await getTournaments();

 if(!r.ok){
  b.innerHTML="<p>Unable to load tournaments.</p>";
  return;
 }

 let a=r.tournaments||[];

 if(type!=="all")
  a=a.filter(x=>String(x.type).toLowerCase()===String(type).toLowerCase());

 b.innerHTML=a.map(tournamentCard).join("");
}

async function renderScrims(){
 const b=document.getElementById("scrims");
 if(!b)return;

 const r=await getTournaments();

 if(!r.ok)return;

 const a=(r.tournaments||[]).filter(x=>
  String(x.name||"").toLowerCase().includes("scrim")
 );

 b.innerHTML=a.map(tournamentCard).join("");
}

async function loadTournamentDetails(){
 const id=new URLSearchParams(location.search).get("id");
 if(!id)return;

 const r=await getTournament(id);

 if(!r.ok){
  msg(r.message||"Tournament not found");
  return;
 }

 const t=r.tournament;

 const set=(id,v)=>{
  const e=document.getElementById(id);
  if(e)e.textContent=v||"";
 };

 set("tournamentName",t.name);
 set("entryFee",t.entryFee||"FREE");
 set("prize",t.prize||"TBA");
 set("map",t.map||"TBA");
 set("matchTime",t.matchTime||"TBA");
}

async function loadMyTeams(id){
 const u=getUser();
 if(!u)return;

 const r=await getMyTeams(u.userId);
 const s=document.getElementById(id);

 if(!s||!r.ok)return;

 s.innerHTML="";
 (r.teams||[]).forEach(t=>{
  const o=document.createElement("option");
  o.value=t.teamId;
  o.textContent=t.teamName;
  s.appendChild(o);
 });
}

async function approveRegistration(id){
 const r=await adminApproveRegistration(id);
 msg(r.message);
 if(r.ok&&typeof renderAdmin==="function")renderAdmin();
}

async function rejectRegistration(id){
 const r=await adminRejectRegistration(id);
 msg(r.message);
 if(r.ok&&typeof renderAdmin==="function")renderAdmin();
}

async function renderAdmin(){
 const r=await getTournaments();
 const box=document.getElementById("adminRegistrations");

 const count=document.getElementById("tc");
 if(count)count.textContent=r.ok?(r.tournaments||[]).length:0;

 if(!box||!r.ok)return;

 let all=[];

 for(const t of r.tournaments||[]){
  const x=await getRegistrations(t.tournamentId);

  (x.registrations||[]).forEach(v=>{
   all.push({...v,tournamentName:t.name});
  });
 }

 box.innerHTML=all.length
 ?all.map(x=>`
  <div class="row">
   <b>${esc(x.tournamentName)}</b>
   <span>${esc(x.teamId)} • ${esc(x.status)}</span>

   ${
    x.status==="pending"
    ?`
    <button type="button"
     onclick="approveRegistration('${x.registrationId}')">
     Approve
    </button>

    <button type="button"
     onclick="rejectRegistration('${x.registrationId}')">
     Reject
    </button>`
    :""
   }
  </div>
 `).join("")
 :"<p>No registrations.</p>";
}

async function login(e){
 if(e)e.preventDefault();

 const email=document.getElementById("email")?.value.trim()||"";
 const password=document.getElementById("password")?.value||"";

 if(!email||!password){
  msg("Email and password required");
  return false;
 }

 const r=await loginUser(email,password);

 if(!r.ok){
  msg(r.message);
  return false;
 }

 if(r.user.role==="admin"){
  localStorage.setItem("ee_admin","1");
  location.href="admin.html";
 }else{
  location.href="index.html";
 }

 return false;
}

async function signup(e){
 if(e)e.preventDefault();

 const name=document.getElementById("name")?.value.trim()||"";
 const email=document.getElementById("email")?.value.trim()||"";
 const phone=document.getElementById("phone")?.value.trim()||"";
 const password=document.getElementById("password")?.value||"";

 if(!name||!email||!password){
  msg("Required fields missing");
  return false;
 }

 const r=await signupUser(name,email,phone,password);
 msg(r.message);

 if(r.ok)location.href="index.html";

 return false;
}

function esc(v){
 return String(v??"")
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;")
 .replace(/'/g,"&#039;");
}

function menu(){
 const n=document.querySelector("nav");
 if(n)n.classList.toggle("show");
}
