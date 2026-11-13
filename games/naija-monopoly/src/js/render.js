/* ============================= RENDER SIDEBAR ============================= */
function renderAll(){
  renderPlayers();
  renderTokens();
  markOwnership();
  renderPropertiesPanel();
  updateCamera();
}
function renderPlayers(){
  const panel = document.getElementById('playersPanel');
  panel.innerHTML='';
  players.forEach((p,i)=>{
    const div = document.createElement('div');
    const isCurrent = i===currentIdx && !p.bankrupt;
    div.className='player-card'+(isCurrent?' current':'')+(p.bankrupt?' out':'');
    div.style.setProperty('--pc', p.color);
    if(isCurrent) div.setAttribute('aria-current','true');
    const owned = p.props.length
      ? p.props.map(idx=>`<li>${TILES[idx].n}${TILES[idx].mortgaged?' <abbr title="Mortgaged">(M)</abbr>':''}</li>`).join('')
      : '<li class="none">No properties yet</li>';
    div.innerHTML = `<div class="pname">
        <span class="ptoken" aria-hidden="true">${p.token}</span>
        <span class="pnametext">${p.name}${p.type==='cpu'?' <span class="tag">CPU</span>':''}${p.bankrupt?' <span class="tag tag-out">Out</span>':''}</span>
        <span class="cash" id="cash-${i}">₦${p.cash}</span>
      </div>
      <ul class="prop-list">${owned}</ul>
      ${p.inJail?`<div class="jail-note">In Kirikiri Prison${p.getOutOfJail>0?' · holds a jail card':''}</div>`:''}`;
    panel.appendChild(div);
  });
}
function canBuildOn(t){
  if(t.t!=='prop') return false;
  const cp = currentPlayer();
  if(t.owner!==cp || t.mortgaged) return false;
  const groupTiles = TILES.filter(x=>x.grp===t.grp && x.t==='prop');
  if(!groupTiles.every(x=>x.owner===cp)) return false;
  if(groupTiles.some(x=>x.mortgaged)) return false;
  const minHouses = Math.min(...groupTiles.map(x=>x.houses));
  if(t.houses>minHouses) return false;
  if(t.houses===5) return false;
  if(t.houses===4 && hotelBank<=0) return false;
  if(t.houses<4 && houseBank<=0) return false;
  return true;
}
/* Official rule: buildings are sold evenly too, and a hotel can only be sold back if the bank has four houses to give. */
function canSellOn(t){
  if(t.t!=='prop' || t.houses<=0) return false;
  const groupTiles = TILES.filter(x=>x.grp===t.grp && x.t==='prop');
  if(t.houses < Math.max(...groupTiles.map(x=>x.houses))) return false;
  if(t.houses===5 && houseBank<4) return false;
  return true;
}
function renderPropertiesPanel(){
  const panel = document.getElementById('buildPanel');
  /* Manage the active human player's holdings; during a computer turn, show the first human player. */
  const cur = currentPlayer();
  const p = (cur && cur.type==='human' && !cur.bankrupt) ? cur : (players.find(x=>x.type==='human' && !x.bankrupt) || players[0]);
  const title = document.getElementById('myPropsTitle');
  if(title && p) title.textContent = `${p.name}'s properties`;
  panel.innerHTML='';
  if(!p || p.bankrupt){ panel.innerHTML='<p class="muted">Nothing to manage.</p>'; return; }
  if(p.props.length===0){ panel.innerHTML='<p class="muted">No properties yet. Select any tile on the board to view its deed.</p>'; return; }
  if(cur!==p){
    const note = document.createElement('p');
    note.className='muted';
    note.textContent = 'Waiting for your turn to build.';
    panel.appendChild(note);
  }
  const bankInfo = document.createElement('p');
  bankInfo.className='muted bank-stock';
  bankInfo.textContent = `Bank stock: ${houseBank} houses · ${hotelBank} hotels`;
  panel.appendChild(bankInfo);
  p.props.forEach(i=>{
    const t = TILES[i];
    const row = document.createElement('div');
    row.className='build-row';
    const label = document.createElement('span');
    label.className='build-label';
    label.textContent = t.n + (t.mortgaged?' (mortgaged)':'') + (t.t==='prop'? ` — ${t.houses===5?'Hotel':'Houses: '+t.houses}`:'');
    row.appendChild(label);
    if(t.t==='prop'){
      const buildBtn = document.createElement('button');
      buildBtn.textContent = t.houses===4?'🏨 Hotel':'🏠 Build';
      const cost = Math.round(t.price*0.5);
      buildBtn.disabled = cur!==p || !canBuildOn(t) || p.cash<cost || blocking;
      buildBtn.title = `Cost ₦${cost}`;
      buildBtn.setAttribute('aria-label', `${t.houses===4?'Build hotel':'Build house'} on ${t.n} for ₦${cost}`);
      buildBtn.onclick = ()=> buildHouse(i);
      row.appendChild(buildBtn);
      if(t.houses>0){
        const sellBtn = document.createElement('button');
        sellBtn.className='secondary';
        sellBtn.textContent='Sell';
        sellBtn.setAttribute('aria-label', `Sell a building on ${t.n}`);
        sellBtn.disabled = cur!==p || blocking || !canSellOn(t);
        sellBtn.onclick = ()=> sellHouseUI(i);
        row.appendChild(sellBtn);
      }
    }
    panel.appendChild(row);
  });
}

