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

async function getTournaments(){
  return await endEraApi("getTournaments");
}

async function getTournament(tournamentId){
  return await endEraApi("getTournament",{tournamentId});
}

async function getMyTeams(userId){
  return await endEraApi("getMyTeams",{userId});
}

async function registerTeam(tournamentId,teamId,userId,utr){
  return await endEraApi("registerTeam",{
    tournamentId,
    teamId,
    registeredBy:userId,
    utr:utr||""
  });
}

/* FIX: Submit Registration */
async function submitRegistration(tournamentId,teamId,utr){
  const u=getUser();

  if(!u){
    alert("Please login first.");
    location.href="login.html";
    return{ok:false};
  }

  if(!tournamentId||!teamId){
    alert("Tournament ID or Team ID missing.");
    return{ok:false};
  }

  const r=await endEraApi("submitRegistration",{
    tournamentId,
    teamId,
    registeredBy:u.userId,
    utr:utr||""
  });

  alert(r.message||"Registration submitted.");

  return r;
}

/* Compatibility with old HTML */
async function submitTournamentRegistration(tournamentId,teamId,utr){
  return await submitRegistration(tournamentId,teamId,utr);
}

/* FIX: Admin OPEN / CLOSE */
async function adminSetRegistration(tournamentId,open){
  const u=getUser();

  if(!u){
    alert("Admin login required.");
    return{ok:false};
  }

  return await endEraApi("setRegistration",{
    tournamentId,
    registrationOpen:open,
    adminEmail:u.email
  });
}

async function openRegistration(tournamentId){
  const r=await adminSetRegistration(tournamentId,true);
  alert(r.message||"Done");
  if(r.ok)location.reload();
  return r;
}

async function closeRegistration(tournamentId){
  const r=await adminSetRegistration(tournamentId,false);
  alert(r.message||"Done");
  if(r.ok)location.reload();
  return r;
}

async function adminApproveRegistration(id){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("approveRegistration",{
    registrationId:id,
    adminEmail:u.email
  });
}

async function adminRejectRegistration(id){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("rejectRegistration",{
    registrationId:id,
    adminEmail:u.email
  });
}

async function getRegistrations(tournamentId){
  return await endEraApi("getRegistrations",{tournamentId});
}

async function getGroups(tournamentId){
  return await endEraApi("getGroups",{tournamentId});
}

async function getGroup(groupId){
  return await endEraApi("getGroup",{groupId});
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

async function createTeam(userId,teamName,captain,logo){
  return await endEraApi("createTeam",{
    userId,teamName,
    captain:captain||"",
    logo:logo||""
  });
}

async function addPlayer(teamId,playerName,uid,role){
  return await endEraApi("addPlayer",{
    teamId,playerName,
    uid:uid||"",
    role:role||"Player"
  });
}

async function adminCreateTournament(data){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("createTournament",{
    ...data,
    adminEmail:u.email
  });
}

async function adminUpdateTournament(tournamentId,data){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("updateTournament",{
    tournamentId,
    adminEmail:u.email,
    ...data
  });
}

async function adminCreateGroup(data){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("createGroup",{
    ...data,
    adminEmail:u.email
  });
}

async function adminUpdateRoom(groupId,data){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("updateRoom",{
    groupId,
    adminEmail:u.email,
    ...data
  });
}

async function adminSubmitResult(data){
  const u=getUser();
  if(!u)return{ok:false,message:"Admin login required"};

  return await endEraApi("submitResult",{
    ...data,
    adminEmail:u.email
  });
}

function showMessage(x){
  alert(x);
}
