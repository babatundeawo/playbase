/* ============================= SETUP UI ============================= */
function syncRowButtons(){
  const n = document.getElementById('playerRows').children.length;
  document.getElementById('addPlayerBtn').disabled = n>=4;
  document.getElementById('removePlayerBtn').disabled = n<=2;
  document.getElementById('playerCount').textContent = `${n} players`;
}
function addPlayerRow(){
  const rows = document.getElementById('playerRows');
  if(rows.children.length>=4) return;
  const idx = rows.children.length;
  const div = document.createElement('div');
  div.className='player-row';
  div.innerHTML = `<span class="swatch" data-bg="${COLORS[idx]}" aria-hidden="true"></span>
    <label class="field grow"><span class="field-label">Player ${idx+1} name</span>
      <input type="text" value="Player ${idx+1}" maxlength="14" autocomplete="off" spellcheck="false"></label>
    <label class="field"><span class="field-label">Token</span>
      <select class="tokenSelect">${TOKENS.map(tk=>`<option value="${tk}" ${tk===TOKENS[idx%TOKENS.length]?'selected':''}>${tk} ${TOKEN_NAMES[tk]}</option>`).join('')}</select></label>
    <label class="field"><span class="field-label">Played by</span>
      <select class="typeSelect"><option value="human">Human</option><option value="cpu">Computer</option></select></label>`;
  rows.appendChild(div);
  syncRowButtons();
}
function removePlayerRow(){
  const rows = document.getElementById('playerRows');
  if(rows.children.length>2) rows.removeChild(rows.lastElementChild);
  syncRowButtons();
}
addPlayerRow(); addPlayerRow();
document.getElementById('addPlayerBtn').addEventListener('click', addPlayerRow);
document.getElementById('removePlayerBtn').addEventListener('click', removePlayerRow);
document.getElementById('setupForm').addEventListener('submit', (e)=>{ e.preventDefault(); startGame(); });

/* Names are shown inside HTML templates, so characters that could form markup are removed up front. */
function cleanName(raw, fallback){
  return raw.replace(/[<>&"'`\\]/g,'').trim() || fallback;
}
function startGame(){
  const rows = [...document.querySelectorAll('.player-row')];
  players = rows.map((r,i)=>{
    const name = cleanName(r.querySelector('input').value, `Player ${i+1}`);
    const type = r.querySelector('.typeSelect').value;
    const token = r.querySelector('.tokenSelect').value;
    return { name, type, token, color: COLORS[i], cash:1500, pos:0, props:[], inJail:false, jailTurns:0, getOutOfJail:0, bankrupt:false };
  });
  document.body.dataset.view = 'game';
  document.getElementById('app').classList.remove('hidden');
  window.scrollTo(0,0);
  buildBoard();
  renderAll();
  updateCamera(true);
  renderDie(document.getElementById('d1'), 1);
  renderDie(document.getElementById('d2'), 1);
  log('🎉 Game started! ' + players.map(p=>p.name).join(', ') + ' — good luck o!');
  const first = document.getElementById('rollBtn');
  if(first && players[0].type==='human') first.focus({preventScroll:true});
  maybeAutoPlayTurn();
}
