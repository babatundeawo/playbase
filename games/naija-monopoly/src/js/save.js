/* Autosave and resume. The game is saved on this device (localStorage) whenever it is at a calm moment:
   between turns, after building, trading or mortgaging. It is never saved in the middle of a dice roll,
   a card, an auction or any other pending decision, so a resumed game is always in a consistent state. */
const SAVE_KEY = 'nm-save-v1';
let gameOver = false;   /* set when someone wins; stops saving and removes the saved game */
let inMotion = false;   /* true from the dice roll until the turn flow continues */

function clearSave(){ store.remove(SAVE_KEY); }

function saveGame(){
  if(!players.length || gameOver || inMotion || blocking || auction) return;
  const snapshot = {
    v: 1,
    savedAt: Date.now(),
    currentIdx, doublesCount, turnRolled, houseBank, hotelBank,
    players: players.map(p=>({ name:p.name, type:p.type, token:p.token, cash:p.cash, pos:p.pos, inJail:p.inJail, jailTurns:p.jailTurns, getOutOfJail:p.getOutOfJail, bankrupt:p.bankrupt })),
    tiles: TILES.map(t=> ('owner' in t) ? { o: t.owner ? players.indexOf(t.owner) : -1, h: t.houses||0, m: !!t.mortgaged } : null)
  };
  try{ store.set(SAVE_KEY, JSON.stringify(snapshot)); }catch(e){ /* storage full or blocked: the game still works, it just cannot be resumed */ }
}

const isInt = (n, min, max)=> Number.isInteger(n) && n>=min && n<=max;

/* Reads the saved game and checks every value, because stored data could be old, damaged or edited. */
function readSave(){
  const raw = store.get(SAVE_KEY);
  if(!raw) return null;
  try{
    const d = JSON.parse(raw);
    if(!d || d.v!==1 || !Array.isArray(d.players) || d.players.length<2 || d.players.length>4) return null;
    if(!Array.isArray(d.tiles) || d.tiles.length!==TILES.length) return null;
    if(!isInt(d.currentIdx,0,d.players.length-1) || !isInt(d.doublesCount,0,2) || typeof d.turnRolled!=='boolean') return null;
    if(!isInt(d.houseBank,0,32) || !isInt(d.hotelBank,0,12)) return null;
    for(const p of d.players){
      if(typeof p.name!=='string' || !['human','cpu'].includes(p.type) || !TOKENS.includes(p.token)) return null;
      if(!isInt(p.cash,-100000,1000000) || !isInt(p.pos,0,39) || !isInt(p.jailTurns,0,3) || !isInt(p.getOutOfJail,0,2)) return null;
      if(typeof p.inJail!=='boolean' || typeof p.bankrupt!=='boolean') return null;
    }
    d.tiles.forEach((s,i)=>{
      const ownable = ('owner' in TILES[i]);
      if(ownable !== (s!==null)) throw new Error('tile mismatch');
      if(s && (!isInt(s.o,-1,d.players.length-1) || !isInt(s.h,0,5) || typeof s.m!=='boolean')) throw new Error('bad tile');
    });
    if(d.players[d.currentIdx].bankrupt || d.players.filter(p=>!p.bankrupt).length<2) return null;
    return d;
  }catch(e){ return null; }
}

function resumeGame(){
  const d = readSave();
  if(!d){ discardSave(); return; }
  players = d.players.map((p,i)=>({
    name: cleanName(p.name, `Player ${i+1}`), type:p.type, token:p.token, color:COLORS[i],
    cash:p.cash, pos:p.pos, props:[], inJail:p.inJail, jailTurns:p.jailTurns, getOutOfJail:p.getOutOfJail, bankrupt:p.bankrupt
  }));
  TILES.forEach((t,i)=>{
    const s = d.tiles[i];
    if(!s) return;
    t.owner = s.o>=0 ? players[s.o] : null;
    t.houses = (t.t==='prop') ? s.h : 0;
    t.mortgaged = s.m;
    if(t.owner) t.owner.props.push(i);
  });
  currentIdx = d.currentIdx; doublesCount = d.doublesCount; turnRolled = d.turnRolled;
  houseBank = d.houseBank; hotelBank = d.hotelBank;
  pendingWasDouble = false; blocking = false; inMotion = false; gameOver = false;

  document.body.dataset.view = 'game';
  document.getElementById('app').classList.remove('hidden');
  window.scrollTo(0,0);
  buildBoard();
  renderAll();
  updateCamera(true);
  renderDie(document.getElementById('d1'), 1);
  renderDie(document.getElementById('d2'), 1);
  log(`▶️ Welcome back! ${players[currentIdx].name}'s turn.`);
  const cp = currentPlayer();
  document.getElementById('rollBtn').disabled = turnRolled;
  document.getElementById('endTurnBtn').disabled = !turnRolled;
  if(turnRolled){
    document.getElementById('payBailBtn').classList.add('hidden');
    document.getElementById('useCardBtn').classList.add('hidden');
    document.getElementById('tradeBtn').classList.toggle('hidden', cp.type==='cpu');
    if(cp.type==='cpu') setTimeout(()=>{ if(currentPlayer()===cp && !blocking) endTurn(); }, 950);
  } else {
    maybeAutoPlayTurn();
  }
}

function discardSave(){
  clearSave();
  const card = document.getElementById('resumeCard');
  if(card) card.classList.add('hidden');
}

/* Wrap renderAll so every calm redraw also saves. */
(function(){
  const original = renderAll;
  renderAll = function(){ original(); saveGame(); };
})();

/* Offer to resume on the start screen. */
(function(){
  const d = readSave();
  const card = document.getElementById('resumeCard');
  if(!d || !card) return;
  const when = new Date(d.savedAt).toLocaleString([], { dateStyle:'medium', timeStyle:'short' });
  document.getElementById('resumeInfo').textContent = `${d.players.length} players, saved ${when}`;
  card.classList.remove('hidden');
})();
