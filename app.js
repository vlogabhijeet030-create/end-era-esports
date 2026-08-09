const keyT='ee_tournaments',keyG='ee_groups';const seedT=[{name:'END ERA PRO SCRIMS',type:'paid',entry:'₹50',prize:'₹10,000',date:'Today • 9:00 PM',map:'Bermuda'},{name:'END ERA UNDERDOG CUP',type:'free',entry:'FREE',prize:'₹2,000',date:'Tomorrow • 8:00 PM',map:'Bermuda'},{name:'END ERA WEEKLY',type:'paid',entry:'₹30',prize:'₹5,000',date:'Sunday • 9:00 PM',map:'Alpine'}];function get(k,s){let x=localStorage.getItem(k);if(x)return JSON.parse(x);localStorage.setItem(k,JSON.stringify(s));return s}function menu(){document.querySelector('nav').classList.toggle('show')}function card(t){return `<article class="card"><span class="tag">${t.type==='free'?'FREE':'PAID'}</span><h2>${t.name}</h2><div class="meta"><span>ENTRY<b>${t.entry}</b></span><span>PRIZE<b>${t.prize}</b></span><span>MAP<b>${t.map}</b></span><span>TIME<b>${t.date}</b></span></div><a class="btn full" href="group-room.html">View Group</a></article>`}function renderMatches(){document.getElementById('matches').innerHTML=get(keyT,seedT).map(card).join('')}function showT(type){let a=get(keyT,seedT);if(type!=='all')a=a.filter(x=>x.type===type);document.getElementById('tournaments').innerHTML=a.map(card).join('')}function renderScrims(){let a=get(keyT,seedT).filter(x=>x.name.includes('SCRIMS')||x.name.includes('UNDERDOG'));document.getElementById('scrims').innerHTML=a.map(card).join('')}function renderResults(){let a=[['1','END ERA','12','15','27'],['2','Team Alpha','9','12','21'],['3','Team XYZ','7','10','17'],['4','Team Nova','6','8','14'],['5','Team Rush','5','7','12']];document.getElementById('results').innerHTML=a.map(r=>'<tr>'+r.map(x=>`<td>${x}</td>`).join('')+'</tr>').join('')}function login(e){e.preventDefault();if(email.value==='admin@endera.gg'&&password.value==='admin123'){localStorage.setItem('ee_admin','1');location.href='admin.html'}else alert('Demo version: only admin login is enabled.')}function guardAdmin(){if(localStorage.getItem('ee_admin')!=='1')location.href='login.html'}function logout(){localStorage.removeItem('ee_admin');location.href='login.html'}function createTournament(e){e.preventDefault();let a=get(keyT,seedT);a.push({name:tn.value,type:tt.value,entry:entry.value||'FREE',prize:prize.value||'TBA',date:date.value||'TBA',map:map.value||'Bermuda'});localStorage.setItem(keyT,JSON.stringify(a));e.target.reset();renderAdmin();alert('Tournament created (demo storage).')}function createGroup(e){e.preventDefault();let a=get(keyG,[]);a.push({group:gn.value,match:mn.value||'Match #01',id:rid.value,pw:rp.value,time:rt.value});localStorage.setItem(keyG,JSON.stringify(a));e.target.reset();renderAdmin();alert('Group published (demo storage).')}function renderAdmin(){let a=get(keyT,seedT),g=get(keyG,[]);if(document.getElementById('tc'))document.getElementById('tc').textContent=a.length;if(document.getElementById('gc'))document.getElementById('gc').textContent=g.length;if(document.getElementById('adminT'))document.getElementById('adminT').innerHTML=a.map((x,i)=>`<div class="row"><b>${x.name}</b><span>${x.type.toUpperCase()} • ${x.prize}</span></div>`).join('');if(document.getElementById('adminG'))document.getElementById('adminG').innerHTML=g.length?g.map((x,i)=>`<div class="row"><b>${x.group}</b><span>${x.id} / ${x.pw}</span><a href="group-room.html?i=${i}">Open</a></div>`).join(''):'<p class="muted">No groups yet.</p>'}function loadRoom(){let a=get(keyG,[]),i=new URLSearchParams(location.search).get('i');if(i!==null&&a[i]){let x=a[i];groupName.textContent=x.group;matchName.textContent=x.match+' • FREE FIRE MAX';roomId.textContent=x.id;roomPass.textContent=x.pw;timeText.textContent=x.time||'Room published'}else{let x=a[a.length-1];if(x){roomId.textContent=x.id;roomPass.textContent=x.pw}}}function copy(id){navigator.clipboard?.writeText(document.getElementById(id).textContent);alert('Copied!')}function shareRoom(){navigator.share?navigator.share({title:'END ERA Group Room',url:location.href}):navigator.clipboard?.writeText(location.href).then(()=>alert('Link copied!'))}

// ===== END ERA eSports Google Apps Script API =====
const END_ERA_API = 'https://script.google.com/macros/s/AKfycbxjDkPM1foNGh76ieWGK-rq1_adN0jivaihhqwcORVtQsWstQcqE8dImABn6lyGJFBYCA/exec';

async function endEraApi(action, data = {}) {
  const response = await fetch(END_ERA_API, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...data })
  });
  return await response.json();
}

async function endEraSignup(name, email, phone, password) {
  return endEraApi("signup", { name, email, phone, password });
}

async function endEraLogin(email, password) {
  return endEraApi("login", { email, password });
}

async function endEraCreateTeam(userId, teamName, captain, logo = "") {
  return endEraApi("createTeam", { userId, teamName, captain, logo });
}

async function endEraAddPlayer(teamId, playerName, uid, role = "Player") {
  return endEraApi("addPlayer", { teamId, playerName, uid, role });
}

async function endEraGetTournaments() {
  return endEraApi("getTournaments");
}
