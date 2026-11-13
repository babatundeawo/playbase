/* ============================= ICONS ============================= */
const HOUSE_SVG = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 11 L12 4 L21 11 V21 H3 Z" fill="#2ecc71" stroke="#0a3d24" stroke-width="1.5"/><rect x="10" y="14" width="4" height="7" fill="#0a3d24"/></svg>`;
const HOTEL_SVG = `<svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="9" width="16" height="12" fill="#d7263d" stroke="#5a0d14" stroke-width="1.5"/><path d="M2 10 L12 3 L22 10 Z" fill="#d7263d" stroke="#5a0d14" stroke-width="1.5"/><rect x="10" y="14" width="4" height="7" fill="#5a0d14"/><rect x="6" y="12" width="2.5" height="2.5" fill="#ffe08a"/><rect x="15.5" y="12" width="2.5" height="2.5" fill="#ffe08a"/></svg>`;
const TOKENS = ['🚌','🏍️','🍲','⚽','🥁','🌴','👑','💵'];
const TOKEN_NAMES = {'🚌':'Danfo Bus','🏍️':'Okada','🍲':'Jollof Pot','⚽':'Football','🥁':'Talking Drum','🌴':'Palm Tree','👑':'Crown','💵':'Naira Note'};

/* ============================= MONEY / EMOJI VISUAL EFFECTS ============================= */
function emojiBurst(x, y, emojis, count=10){
  if(reduceMotion.matches) return;
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className='emoji-burst';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left = x+'px'; el.style.top = y+'px';
    const angle = Math.random()*Math.PI*2;
    const dist = 40+Math.random()*70;
    el.style.setProperty('--dx', (Math.cos(angle)*dist)+'px');
    el.style.setProperty('--dy', (Math.sin(angle)*dist - 30)+'px');
    el.style.setProperty('--rot', (Math.random()*360-180)+'deg');
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1200);
  }
}
function moneyBurstAt(el, positive){
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const x = rect.left+rect.width/2, y = rect.top+rect.height/2;
  emojiBurst(x, y, positive? ['💵','💰','🤑','✨'] : ['😢','💸','📉'], positive?8:6);
}

