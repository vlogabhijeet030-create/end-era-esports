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
  return{ok:false,message:"Server connection failed"};
 }
}

async function callAPI(action,data={}){
 return endEraApi(action,data);
}

function getUser(){
 try{return JSON.parse(localStorage.getItem("ee_user")||"null")}
 catch(e){return null}
}

function saveUser(u){
 localStorage.setItem("ee_user",JSON.stringify(u));
}

function logout(){
 localStorage.removeItem("ee_user");
 localStorage.removeItem("ee_admin");
 location.href="login.html";
}

function menu(){
 const n=document.querySelector("nav");
 if(n)n.classList.toggle("show");
}

function showMessage(x){
 alert(x);
}

function escapeHtml(v){
 return String(v??"")
 .replace(/&/g,"&amp;")
 .replace(/</g,"&lt;")
 .replace(/>/g,"&gt;")
 .replace(/"/g,"&quot;")
 .replace(/'/g,"&#039;");
}

/* AUTH */

async function loginUser(email,password){
 const r=await endEraApi("login",{email,password});
 if(r.ok&&r.user)saveUser(r.user);
 return r;
}

async function signupUser(name,email,phone,password){
 const r=await endEraApi("signup",{name,email,phone,password});
 if(r.ok&&r.user)saveUser(r.user);
 return r;
}

async function login(e){
 if(e)e.preventDefault();

 const email=document.getElementById("email")?.value.trim()||"";
 const password=document.getElementById("password")?.value||"";

 if(!email||!password){
  showMessage("Email and password required.");
  return false;
 }

 const r=await loginUser(email,password);
 showMessage(r.message||"");

 if(r.ok){
  if(r.user.role==="admin"){
   localStorage.setItem("ee_admin","1");
   location.href="admin.html";
  }else location.href="index.html";
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
  showMessage("Name, email and password required.");
  return false;
 }

 const r=await signupUser(name,email,phone,password);
 showMessage(r.message||"");

 if(r.ok)location.href="index.html";
 return false;
}

/* USERS / TEAMS */

async function getMyTeams(userId){
 return endEraApi("getMyTeams",{userId});
}

async function getTeam(teamId){
 return endEraApi("getTeam",{teamId});
}

async function getTeamPlayers(teamId){
 return endEraApi("getTeamPlayers",{teamId});
}

async function createTeam(userId,teamName,captain,logo){
 return endEraApi("createTeam",{
  userId,teamName,
  captain:captain||"",
  logo:logo||""
 });
}

async function addPlayer(teamId,playerName,uid,role){
 return endEraApi("addPlayer",{
  teamId,playerName,
  uid:uid||"",
  role:role||"Player"
 });
}

/* TOURNAMENTS */

async function getTournaments(){
 return endEraApi("getTournaments");
}

async function getTournament(tournamentId){
 return endEraApi("getTournament",{tournamentId});
}

async function adminCreateTournament(data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("createTournament",{
  ...data,adminEmail:u.email
 });
}

async function adminUpdateTournament(id,data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("updateTournament",{
  tournamentId:id,
  ...data,
  adminEmail:u.email
 });
}

/* REGISTRATION */

async function registerTeam(tournamentId,teamId,userId,utr){
 return endEraApi("registerTeam",{
  tournamentId,
  teamId,
  registeredBy:userId||"",
  utr:utr||""
 });
}

async function submitRegistration(tournamentId,teamId,utr){
 const u=getUser();

 if(!u){
  showMessage("Please login first.");
  location.href="login.html";
  return{ok:false};
 }

 const r=await registerTeam(
  tournamentId,
  teamId,
  u.userId,
  utr
 );

 showMessage(r.message||"Registration submitted.");
 return r;
}

async function submitTournamentRegistration(tournamentId,teamId,utr){
 return submitRegistration(tournamentId,teamId,utr);
}

async function getRegistrations(tournamentId){
 return endEraApi("getRegistrations",{tournamentId});
}

/* ADMIN REGISTRATION OPEN/CLOSE */

async function adminSetRegistration(tournamentId,open){
 const u=getUser();

 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("setRegistration",{
  tournamentId,
  registrationOpen:open,
  adminEmail:u.email
 });
}

async function openRegistration(id){
 const r=await adminSetRegistration(id,true);
 showMessage(r.message||"Done");
 if(r.ok)location.reload();
 return r;
}

async function closeRegistration(id){
 const r=await adminSetRegistration(id,false);
 showMessage(r.message||"Done");
 if(r.ok)location.reload();
 return r;
}

/* ADMIN REGISTRATION APPROVAL */

async function adminRegisterTeam(tournamentId,teamId){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("adminRegisterTeam",{
  tournamentId,
  teamId,
  adminEmail:u.email
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

async function approveRegistration(id){
 const r=await adminApproveRegistration(id);
 showMessage(r.message||"Done");
 if(r.ok&&typeof renderAdmin==="function")renderAdmin();
 return r;
}

async function rejectRegistration(id){
 const r=await adminRejectRegistration(id);
 showMessage(r.message||"Done");
 if(r.ok&&typeof renderAdmin==="function")renderAdmin();
 return r;
}

/* GROUPS */

async function getGroups(tournamentId){
 return endEraApi("getGroups",{tournamentId});
}

async function getGroup(groupId){
 return endEraApi("getGroup",{groupId});
}

async function adminCreateGroup(data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("createGroup",{
  ...data,
  adminEmail:u.email
 });
}

async function adminUpdateRoom(groupId,data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("updateRoom",{
  groupId,
  ...data,
  adminEmail:u.email
 });
}

async function assignTeamToGroup(groupId,teamId){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("assignTeamToGroup",{
  groupId,
  teamId,
  adminEmail:u.email
 });
}

/* RESULTS */

async function getResults(tournamentId,groupId){
 return endEraApi("getResults",{
  tournamentId:tournamentId||"",
  groupId:groupId||""
 });
}

async function getPointsTable(tournamentId,groupId){
 return endEraApi("getPointsTable",{
  tournamentId:tournamentId||"",
  groupId:groupId||""
 });
}

async function adminSubmitResult(data){
 const u=getUser();
 if(!u)return{ok:false,message:"Admin login required"};

 return endEraApi("submitResult",{
  ...data,
  adminEmail:u.email
 });
}

/* SIMPLE TOURNAMENT LIST */

function tournamentCard(t){
 const open=
  t.registrationOpen===true||
  String(t.registrationOpen).toLowerCase()==="true";

 return `
 <article class="card">
  <span class="tag">${escapeHtml(t.type||"SCRIM")}</span>
  <h2>${escapeHtml(t.name||"Tournament")}</h2>
  <p>ENTRY: ${escapeHtml(t.entryFee||"FREE")}</p>
  <p>PRIZE: ${escapeHtml(t.prize||"TBA")}</p>
  <p>MAP: ${escapeHtml(t.map||"TBA")}</p>
  <p>TIME: ${escapeHtml(t.matchTime||"TBA")}</p>
  ${
   open
   ?`<button type="button" onclick="startRegistration('${encodeURIComponent(t.tournamentId)}')">Register</button>`
   :`<span>Registration Closed</span>`
  }
 </article>`;
}

async function renderMatches(){
 const box=document.getElementById("matches");
 if(!box)return;

 box.innerHTML="Loading...";

 const r=await getTournaments();

 if(!r.ok){
  box.innerHTML="Unable to load tournaments.";
  return;
 }

 box.innerHTML=(r.tournaments||[]).map(tournamentCard).join("");
}

async function showT(type="all"){
 const box=document.getElementById("tournaments");
 if(!box)return;

 const r=await getTournaments();
 if(!r.ok)return;

 let list=r.tournaments||[];

 if(type!=="all"){
  list=list.filter(x=>
   String(x.type||"").toLowerCase()===
   String(type).toLowerCase()
  );
 }

 box.innerHTML=list.map(tournamentCard).join("");
}

/* START REGISTRATION */

async function startRegistration(encodedId){
 const tournamentId=decodeURIComponent(encodedId||"");
 const u=getUser();

 if(!u){
  showMessage("Please login first.");
  location.href="login.html";
  return;
 }

 const r=await getMyTeams(u.userId);

 if(!r.ok){
  showMessage(r.message||"Unable to load teams.");
  return;
 }

 const teams=r.teams||[];

 if(!teams.length){
  showMessage("Please create a team first.");
  return;
 }

 let teamId;

 if(teams.length===1){
  teamId=teams[0].teamId;
 }else{
  let x=prompt(
   teams.map((t,i)=>(i+1)+". "+t.teamName).join("\n")+
   "\n\nEnter team number:"
  );

  let i=parseInt(x,10)-1;

  if(isNaN(i)||i<0||i>=teams.length){
   showMessage("Invalid team.");
   return;
  }

  teamId=teams[i].teamId;
 }

 let utr=prompt("Enter Payment UTR:");

 if(!utr){
  showMessage("Payment UTR required.");
  return;
 }

 await submitRegistration(
  tournamentId,
  teamId,
  utr
);
     }
