/* ============================= BOARD RENDER ============================= */
function tilePos(i){
  if(i===0) return {col:11,row:11};
  if(i>=1&&i<=9) return {col:11-i, row:11};
  if(i===10) return {col:1,row:11};
  if(i>=11&&i<=19) return {col:1, row:11-(i-10)};
  if(i===20) return {col:1,row:1};
  if(i>=21&&i<=29) return {col:1+(i-20), row:1};
  if(i===30) return {col:11,row:1};
  if(i>=31&&i<=39) return {col:11, row:1+(i-30)};
}
const CORNER_ICON = {go:'🏁', jail:'⛓️', free:'🅿️', gotojail:'🚔'};
function tileTypeIcon(t){
  if(t.t==='rail') return '🚂';
  if(t.t==='util') return t.n.includes('NEPA') ? '⚡' : '💧';
  return '';
}
function buildingMarkup(t){
  if(t.t!=='prop' || t.houses===0) return '';
  if(t.houses===5) return `<div class="bld">${HOTEL_SVG}</div>`;
  return `<div class="bld">${HOUSE_SVG.repeat(t.houses)}</div>`;
}
function ownerRibbonMarkup(t){
  if(!(t.t==='prop'||t.t==='rail'||t.t==='util') || !t.owner) return '';
  return `<div class="owner-ribbon" data-bg="${t.owner.color}cc">
    <span class="otok">${t.owner.token}</span><span>${t.owner.name}</span>
  </div>`;
}
function buildBoard(){
  const board = document.getElementById('board');
  board.innerHTML='';
  TILES.forEach((t,i)=>{
    const pos = tilePos(i);
    const div = document.createElement('div');
    const isCorner = ['go','jail','free','gotojail'].includes(t.t);
    div.className='tile'+(isCorner?' corner':'');
    div.style.gridColumn = pos.col; div.style.gridRow = pos.row;
    div.id = 'tile-'+i;
    if(isCorner){
      div.innerHTML = `<div class="corner-icon">${CORNER_ICON[t.t]}</div><div class="name">${t.n}</div>`;
    } else {
      let barColor = t.grp ? GROUP_COLORS[t.grp] : (t.t==='rail'?GROUP_COLORS.rail: t.t==='util'?GROUP_COLORS.util:'transparent');
      let priceLbl = t.t==='prop'||t.t==='rail'||t.t==='util' ? `₦${t.price}` : (t.t==='tax'?`₦${t.amt}`:'');
      const artStyle = tileArtStyle(t);
      if(artStyle) div.style.cssText += artStyle;
      div.innerHTML = `${barColor!=='transparent'?`<div class="bar" data-bg="${barColor}"></div>`:''}
        <div class="name">${t.n}</div>
        <div class="icon">${tileTypeIcon(t)}</div>
        ${buildingMarkup(t)}
        <div class="price">${priceLbl}</div>
        ${ownerRibbonMarkup(t)}`;
    }
    if(!isCorner && ['prop','rail','util'].includes(t.t)){
      div.onclick = ()=> showTileInfo(i);
      div.tabIndex = 0;
      div.setAttribute('role','button');
      div.setAttribute('aria-label', `${t.n}, ₦${t.price}. View deed`);
      div.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); showTileInfo(i); } });
    }
    board.appendChild(div);
  });
  const center = document.createElement('div');
  center.className='center-area';
  center.innerHTML = `<h2>NAIJA<br>MONOPOLY</h2><div class="sub">Wealth Wahala Edition</div>`;
  board.appendChild(center);
}
const PIP_PATTERNS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function renderDie(el, n){
  if(!el || !el.appendChild) return;
  el.innerHTML='';
  el.setAttribute('role','img');
  el.setAttribute('aria-label', `Die showing ${n}`);
  for(let i=0;i<9;i++){
    const d = document.createElement('span');
    d.className='dot'+(PIP_PATTERNS[n].includes(i)?' on':'');
    el.appendChild(d);
  }
}
function animateDiceRoll(finalD1, finalD2, callback){
  const el1 = document.getElementById('d1'), el2 = document.getElementById('d2');
  if(!el1 || !el2){ callback(); return; }
  el1.classList.add('rolling'); el2.classList.add('rolling');
  sfxRoll();
  let ticks = 0;
  const iv = setInterval(()=>{
    renderDie(el1, 1+Math.floor(Math.random()*6));
    renderDie(el2, 1+Math.floor(Math.random()*6));
    ticks++;
    if(ticks>=9){
      clearInterval(iv);
      el1.classList.remove('rolling'); el2.classList.remove('rolling');
      renderDie(el1, finalD1); renderDie(el2, finalD2);
      sfxSettle();
      callback();
    }
  }, 110);
}
function refreshTileVisual(i){
  const t = TILES[i];
  const div = document.getElementById('tile-'+i);
  if(!div || t.t==='go'||t.t==='jail'||t.t==='free'||t.t==='gotojail') return;
  const existingBld = div.querySelector('.bld');
  if(existingBld) existingBld.remove();
  const existingRibbon = div.querySelector('.owner-ribbon');
  if(existingRibbon) existingRibbon.remove();
  div.insertAdjacentHTML('beforeend', buildingMarkup(t));
  div.insertAdjacentHTML('beforeend', ownerRibbonMarkup(t));
  div.classList.toggle('mortgaged', !!t.mortgaged);
}
function flashTile(idx){
  const tile = document.getElementById('tile-'+idx);
  if(!tile) return;
  tile.classList.remove('tile-flash'); void tile.offsetWidth;
  tile.classList.add('tile-flash');
  setTimeout(()=>tile.classList.remove('tile-flash'), 700);
}
const tokenEls = {};
function tokenOffset(idx){
  // slight stacking so multiple tokens on one tile don't fully overlap
  const positions = [[-11,-11],[11,-11],[-11,11],[11,11]];
  return positions[idx%positions.length];
}
function tokenTargetXY(p, idx){
  const board = document.getElementById('board');
  const tile = document.getElementById('tile-'+p.pos);
  if(!board || !tile) return {x:0,y:0};
  const tokSize = 34;
  const [ox,oy] = tokenOffset(idx);
  const cx = tile.offsetLeft + tile.offsetWidth/2 - tokSize/2 + ox*(tile.offsetWidth/68);
  const cy = tile.offsetTop + tile.offsetHeight/2 - tokSize/2 + oy*(tile.offsetWidth/68);
  return {x:cx, y:cy, size:tokSize};
}
function ensureTokenEl(p, idx){
  const board = document.getElementById('board');
  if(!board) return null;
  let el = tokenEls[idx];
  if(!el || !board.contains(el)){
    el = document.createElement('div');
    el.className='token-badge';
    el.style.background = p.color;
    el.textContent = p.token;
    el.title = p.name;
    board.appendChild(el);
    tokenEls[idx] = el;
  }
  return el;
}
function renderTokens(){
  players.forEach((p,idx)=>{
    if(p.bankrupt){
      if(tokenEls[idx]){ tokenEls[idx].remove(); delete tokenEls[idx]; }
      return;
    }
    const el = ensureTokenEl(p, idx);
    if(!el) return;
    const {x,y,size} = tokenTargetXY(p, idx);
    el.style.width = size+'px'; el.style.height = size+'px';
    el.style.fontSize = Math.round(size*0.56)+'px';
    el.style.left = x+'px'; el.style.top = y+'px';
  });
}
function bounceToken(p){
  const idx = players.indexOf(p);
  const el = tokenEls[idx];
  if(!el) return;
  el.classList.remove('landed'); void el.offsetWidth;
  el.classList.add('landed');
  setTimeout(()=>el.classList.remove('landed'), 600);
}

