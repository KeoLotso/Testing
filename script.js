const clientId = document.currentScript.dataset.clientId;
const redirectUri = document.currentScript.dataset.redirectUri;
const responseType = 'code';
const scope = 'identify email';
const loginBtn = document.getElementById('loginBtn');
const statusEl = document.getElementById('status');

function buildDiscordAuthUrl(){
  const base = 'https://discord.com/api/oauth2/authorize';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope
  });
  return `${base}?${params.toString()}`;
}

function setStatus(text){
  statusEl.textContent = text || '';
}

async function exchangeCode(code){
  setStatus('Processing sign in...');
  try{
    const res = await fetch('/api/oauth', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({code, redirect_uri: redirectUri})
    });
    if(!res.ok){
      setStatus('Sign in failed');
      return;
    }
    const data = await res.json();
    if(data.success){
      setStatus('Signed in successfully');
    }
  }catch(e){
    setStatus('Network error');
  }
}

function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

loginBtn.addEventListener('click', ()=> {
  if(!clientId.includes('REPLACE') && !redirectUri.includes('REPLACE')){
    window.location.href = buildDiscordAuthUrl();
  } else {
    setStatus('Please configure client ID and redirect URI.');
  }
});

window.addEventListener('DOMContentLoaded', ()=>{
  const code = getQueryParam('code');
  if(code){
    history.replaceState({}, '', redirectUri.split('?')[0]);
    exchangeCode(code);
  }
});
