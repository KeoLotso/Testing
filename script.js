const clientId = document.currentScript.dataset.clientId;
const redirectUri = document.currentScript.dataset.redirectUri;
const scope = 'identify email';
const loginBtn = document.getElementById('loginBtn');
const statusEl = document.getElementById('status');
const profileBar = document.getElementById('profileBar');
const avatarEl = document.getElementById('avatar');
const usernameEl = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const cardEl = document.getElementById('card');

function buildAuthUrl(){
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

function setStatus(text){ statusEl.textContent = text || ''; }

async function exchangeCode(code){
  setStatus('Signing in...');
  try{
    const res = await fetch('/api/oauth', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({code, redirect_uri: redirectUri})
    });
    const data = await res.json();
    if(data.success){
      localStorage.setItem('discordTokens', JSON.stringify(data.tokens));
      await fetchProfile(data.tokens.access_token);
    } else {
      setStatus('Sign in failed');
    }
  }catch{
    setStatus('Network error');
  }
}

async function fetchProfile(accessToken){
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const profile = await res.json();
  if(profile && profile.username){
    localStorage.setItem('discordProfile', JSON.stringify(profile));
    showProfile(profile);
  }
}

function showProfile(profile){
  avatarEl.src = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
  usernameEl.textContent = profile.username;
  profileBar.classList.remove('hidden');
  cardEl.classList.add('hidden');
}

function logout(){
  localStorage.removeItem('discordTokens');
  localStorage.removeItem('discordProfile');
  profileBar.classList.add('hidden');
  cardEl.classList.remove('hidden');
}

loginBtn.addEventListener('click', ()=> {
  window.location.href = buildAuthUrl();
});
logoutBtn.addEventListener('click', logout);

window.addEventListener('DOMContentLoaded', ()=>{
  const code = new URLSearchParams(window.location.search).get('code');
  if(code){
    history.replaceState({}, '', redirectUri);
    exchangeCode(code);
  } else {
    const storedProfile = localStorage.getItem('discordProfile');
    if(storedProfile){
      showProfile(JSON.parse(storedProfile));
    }
  }
});
