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

function menu(){
  const n=document.querySelector("nav");
  if(n)n.classList.toggle("show");
}

function saveUser(user){
  localStorage.setItem("ee_user",JSON.stringify(user));
}

function getUser(){
  try{
    return JSON.parse(localStorage.getItem("ee_user")||"null");
  }catch(e){
    return null;
  }
}

function logout(){
  localStorage.removeItem("ee_user");
  localStorage.removeItem("ee_admin");
  location.href="login.html";
}

function guardLogin(){
  if(!getUser())location.href="login.html";
}

function guardAdmin(){
  const u=getUser();
  if(!u||u.role!=="admin"){
    location.href="login.html";
  }
}

async function signupUser(name,email,phone,password){
  const r=await endEraApi("signup",{
    name:name,
    email:email,
    phone:phone,
    password:password
  });

  if(r.ok&&r.user)saveUser(r.user);

  return r;
}

async function loginUser(email,password){
  const r=await endEraApi("login",{
    email:email,
    password:password
  });

  if(r.ok&&r.user)saveUser(r.user);

  return r;
}

async function createTeam(userId,teamName,captain,logo){
  return await endEraApi("createTeam",{
    userId:userId,
    teamName:teamName,
    captain:captain||"",
    logo:logo||""
  });
}

async function addPlayer(teamId,playerName,uid,role){
  return await endEraApi("addPlayer",{
    teamId:teamId,
    playerName:playerName,
    uid:uid||"",
    role:role||"Player"
  });
}

async function getMyTeams(userId){
  return await endEraApi("getMyTeams",{
    userId:userId
  });
}

async function getTeam(teamId){
  return await endEraApi("getTeam",{
    teamId:teamId
  });
}

async function getTeamPlayers(teamId){
  return await endEraApi("getTeamPlayers",{
    teamId:teamId
  });
}

async function getTournaments(){
  return await endEraApi("getTournaments");
}

async function getTournament(tournamentId){
  return await endEraApi("getTournament",{
    tournamentId:tournamentId
  });
}

async function registerTeam(tournamentId,teamId,userId){
  return await endEraApi("registerTeam",{
    tournamentId:tournamentId,
    teamId:teamId,
    registeredBy:userId
  });
}

async function getRegistrations(tournamentId){
  return await endEraApi("getRegistrations",{
    tournamentId:tournamentId
  });
}

async function getGroups(tournamentId){
  return await endEraApi("getGroups",{
    tournamentId:tournamentId
  });
}

async function getGroup(groupId){
  return await endEraApi("getGroup",{
    groupId:groupId
  });
}

async function getResults(tournamentId,groupId){
  return await endEraApi("getResults",{
    tournamentId:tournamentId||"",
    groupId:groupId||""
  });
}

async function getPointsTable(tournamentId,groupId){
  return await endEraApi("getPointsTable",{
    tournamentId:tournamentId||"",
    groupId:groupId||""
  });
}

async function adminCreateTournament(data){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("createTournament",{
    ...data,
    adminEmail:u.email
  });
}

async function adminUpdateTournament(tournamentId,data){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("updateTournament",{
    tournamentId:tournamentId,
    adminEmail:u.email,
    ...data
  });
}

async function adminSetRegistration(tournamentId,open){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("setRegistration",{
    tournamentId:tournamentId,
    registrationOpen:open,
    adminEmail:u.email
  });
}

async function adminRegisterTeam(tournamentId,teamId){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("adminRegisterTeam",{
    tournamentId:tournamentId,
    teamId:teamId,
    adminEmail:u.email
  });
}

async function adminApproveRegistration(registrationId){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("approveRegistration",{
    registrationId:registrationId,
    adminEmail:u.email
  });
}

async function adminRejectRegistration(registrationId){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("rejectRegistration",{
    registrationId:registrationId,
    adminEmail:u.email
  });
}

async function adminCreateGroup(data){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("createGroup",{
    ...data,
    adminEmail:u.email
  });
}

async function adminUpdateRoom(groupId,data){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("updateRoom",{
    groupId:groupId,
    adminEmail:u.email,
    ...data
  });
}

async function adminSubmitResult(data){
  const u=getUser();

  if(!u)return {ok:false,message:"Admin login required"};

  return await endEraApi("submitResult",{
    ...data,
    adminEmail:u.email
  });
}

function showMessage(message){
  alert(message);
}

async function renderMatches(){
  const box=document.getElementById("matches");
  if(!box)return;

  box.innerHTML="<p>Loading tournaments...</p>";

  const r=await getTournaments();

  if(!r.ok){
    box.innerHTML="<p>Unable to load tournaments.</p>";
    return;
  }

  box.innerHTML=r.tournaments.map(tournamentCard).join("");
}

async function showT(type="all"){
  const box=document.getElementById("tournaments");
  if(!box)return;

  box.innerHTML="<p>Loading tournaments...</p>";

  const r=await getTournaments();

  if(!r.ok){
    box.innerHTML="<p>Unable to load tournaments.</p>";
    return;
  }

  let list=r.tournaments||[];

  if(type!=="all"){
    list=list.filter(x=>String(x.type).toLowerCase()===String(type).toLowerCase());
  }

  box.innerHTML=list.map(tournamentCard).join("");
}

async function renderScrims(){
  const box=document.getElementById("scrims");
  if(!box)return;

  box.innerHTML="<p>Loading scrims...</p>";

  const r=await getTournaments();

  if(!r.ok){
    box.innerHTML="<p>Unable to load scrims.</p>";
    return;
  }

  const list=(r.tournaments||[]).filter(x=>
    String(x.name).toLowerCase().includes("scrim")
  );

  box.innerHTML=list.map(tournamentCard).join("");
}

function tournamentCard(t){
  const open=
    t.registrationOpen===true||
    String(t.registrationOpen).toLowerCase()==="true";

  return `
    <article class="card">
      <span class="tag">${String(t.type||"scrim").toUpperCase()}</span>
      <h2>${t.name||"Tournament"}</h2>
      <div class="meta">
        <span>ENTRY<b>${t.entryFee||"FREE"}</b></span>
        <span>PRIZE<b>${t.prize||"TBA"}</b></span>
        <span>MAP<b>${t.map||"TBA"}</b></span>
        <span>TIME<b>${t.matchTime||"TBA"}</b></span>
      </div>
      ${
        open
        ? `<a class="btn full" href="tournaments.html?id=${encodeURIComponent(t.tournamentId)}">Register</a>`
        : `<span class="btn full">Registration Closed</span>`
      }
    </article>
  `;
}

async function loadTournamentDetails(){
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;

  const r=await getTournament(id);
  if(!r.ok){
    showMessage(r.message||"Tournament not found");
    return;
  }

  const t=r.tournament;

  const name=document.getElementById("tournamentName");
  const entry=document.getElementById("entryFee");
  const prize=document.getElementById("prize");
  const map=document.getElementById("map");
  const time=document.getElementById("matchTime");

  if(name)name.textContent=t.name||"";
  if(entry)entry.textContent=t.entryFee||"FREE";
  if(prize)prize.textContent=t.prize||"TBA";
  if(map)map.textContent=t.map||"TBA";
  if(time)time.textContent=t.matchTime||"TBA";
}

async function submitTournamentRegistration(tournamentId,teamId){
  const u=getUser();

  if(!u){
    location.href="login.html";
    return;
  }

  if(!teamId){
    showMessage("Please select a team.");
    return;
  }

  const r=await registerTeam(
    tournamentId,
    teamId,
    u.userId
  );

  showMessage(r.message||"Registration submitted.");

  if(r.ok){
    location.reload();
  }
}

async function loadMyTeams(selectId){
  const u=getUser();

  if(!u)return;

  const r=await getMyTeams(u.userId);

  if(!r.ok)return;

  const select=document.getElementById(selectId);

  if(!select)return;

  select.innerHTML="";

  (r.teams||[]).forEach(t=>{
    const option=document.createElement("option");
    option.value=t.teamId;
    option.textContent=t.teamName;
    select.appendChild(option);
  });
}

async function renderResults(){
  const box=document.getElementById("results");
  if(!box)return;

  const id=new URLSearchParams(location.search).get("id");

  const r=await getPointsTable(id);

  if(!r.ok){
    box.innerHTML="";
    return;
  }

  box.innerHTML=(r.pointsTable||[]).map((x,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${x.teamId}</td>
      <td>${x.totalKills}</td>
      <td>${x.totalPoints}</td>
      <td>${x.matches}</td>
    </tr>
  `).join("");
}

async function loadRoom(){
  const groupId=new URLSearchParams(location.search).get("id");

  if(!groupId)return;

  const r=await getGroup(groupId);

  if(!r.ok)return;

  const g=r.group;

  const groupName=document.getElementById("groupName");
  const matchName=document.getElementById("matchName");
  const roomId=document.getElementById("roomId");
  const roomPass=document.getElementById("roomPass");
  const timeText=document.getElementById("timeText");

  if(groupName)groupName.textContent=g.groupName||"";
  if(matchName)matchName.textContent="FREE FIRE MAX";
  if(roomId)roomId.textContent=g.roomId||"WAIT";
  if(roomPass)roomPass.textContent=g.roomPassword||"WAIT";
  if(timeText)timeText.textContent=g.matchTime||"Room published";
}

function copy(id){
  const el=document.getElementById(id);
  if(!el)return;

  navigator.clipboard?.writeText(el.textContent||"")
    .then(()=>showMessage("Copied!"));
}

function shareRoom(){
  if(navigator.share){
    navigator.share({
      title:"END ERA Group Room",
      url:location.href
    });
  }else{
    navigator.clipboard?.writeText(location.href)
      .then(()=>showMessage("Link copied!"));
  }
}

async function login(e){
  e.preventDefault();

  const emailEl=document.getElementById("email");
  const passwordEl=document.getElementById("password");

  const email=emailEl?.value.trim()||"";
  const password=passwordEl?.value||"";

  if(!email||!password){
    showMessage("Email and password required.");
    return;
  }

  const r=await loginUser(email,password);

  if(!r.ok){
    showMessage(r.message||"Login failed.");
    return;
  }

  if(r.user.role==="admin"){
    localStorage.setItem("ee_admin","1");
    location.href="admin.html";
  }else{
    location.href="index.html";
  }
}

async function signup(e){
  e.preventDefault();

  const name=document.getElementById("name")?.value.trim()||"";
  const email=document.getElementById("email")?.value.trim()||"";
  const phone=document.getElementById("phone")?.value.trim()||"";
  const password=document.getElementById("password")?.value||"";

  if(!name||!email||!password){
    showMessage("Name, email and password required.");
    return;
  }

  const r=await signupUser(
    name,
    email,
    phone,
    password
  );

  showMessage(r.message||"Signup complete.");

  if(r.ok){
    location.href="index.html";
  }
}

async function createTournament(e){
  e.preventDefault();

  const r=await adminCreateTournament({
    name:document.getElementById("tn")?.value||"",
    type:document.getElementById("tt")?.value||"Scrim",
    entryFee:document.getElementById("entry")?.value||"0",
    prize:document.getElementById("prize")?.value||"0",
    map:document.getElementById("map")?.value||"",
    matchTime:document.getElementById("date")?.value||"",
    status:"upcoming"
  });

  showMessage(r.message||"Tournament created.");

  if(r.ok){
    e.target.reset();
    if(typeof renderAdmin==="function")renderAdmin();
  }
}

async function createGroup(e){
  e.preventDefault();

  const r=await adminCreateGroup({
    tournamentId:document.getElementById("tournamentId")?.value||"",
    groupName:document.getElementById("gn")?.value||"",
    roomId:document.getElementById("rid")?.value||"WAIT",
    roomPassword:document.getElementById("rp")?.value||"WAIT",
    roomStatus:"waiting",
    matchTime:document.getElementById("rt")?.value||""
  });

  showMessage(r.message||"Group created.");

  if(r.ok){
    e.target.reset();
    if(typeof renderAdmin==="function")renderAdmin();
  }
}

async function renderAdmin(){
  const tournaments=await getTournaments();

  const tc=document.getElementById("tc");

  if(tc){
    tc.textContent=
      tournaments.ok?
      (tournaments.tournaments||[]).length:
      "0";
  }

  const regs=document.getElementById("adminRegistrations");

  if(regs){
    let all=[];

    for(const t of (tournaments.tournaments||[])){
      const r=await getRegistrations(t.tournamentId);

      if(r.ok){
        (r.registrations||[]).forEach(x=>{
          all.push({
            ...x,
            tournamentName:t.name
          });
        });
      }
    }

    regs.innerHTML=all.length?
      all.map(x=>`
        <div class="row">
          <b>${x.tournamentName}</b>
          <span>${x.teamId} • ${x.status}</span>
          ${
            x.status==="pending"
            ? `
              <button onclick="approveRegistration('${x.registrationId}')">Approve</button>
              <button onclick="rejectRegistration('${x.registrationId}')">Reject</button>
            `
            :""
          }
        </div>
      `).join("")
      :
      "<p class='muted'>No registrations.</p>";
  }
}

async function approveRegistration(id){
  const r=await adminApproveRegistration(id);
  showMessage(r.message||"Done");
  if(r.ok)renderAdmin();
}

async function rejectRegistration(id){
  const r=await adminRejectRegistration(id);
  showMessage(r.message||"Done");
  if(r.ok)renderAdmin();
      }
