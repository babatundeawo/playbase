/* ============================= CORE HELPERS ============================= */
function currentPlayer(){ return players[currentIdx]; }
function computeNetWorth(p){
  let worth = p.cash;
  p.props.forEach(i=>{
    const t = TILES[i];
    worth += t.mortgaged ? Math.round(t.price*0.5) : t.price;
    if(t.t==='prop') worth += t.houses * Math.round(t.price*0.5);
  });
  return worth;
}
function changeCash(p, amount){
  if(!amount) return;
  p.cash += amount;
  sfxGain(amount);
  animateCashChange(p, amount);
}
function animateCashChange(p, amount){
  const idx = players.indexOf(p);
  const el = document.getElementById('cash-'+idx);
  if(!el) return;
  el.classList.remove('flash-pos','flash-neg'); void el.offsetWidth;
  el.classList.add(amount>0?'flash-pos':'flash-neg');
  const rect = el.getBoundingClientRect();
  const float = document.createElement('div');
  float.className='cash-float';
  float.style.left = rect.left+'px';
  float.style.top = rect.top+'px';
  float.style.color = amount>0? '#8fffb0':'#ff9a9a';
  float.style.fontSize = (Math.abs(amount)>=150? '20px':'16px');
  float.textContent = (amount>0?'+':'')+'₦'+amount;
  document.body.appendChild(float);
  setTimeout(()=>float.remove(), 1500);
  if(Math.abs(amount)>=100) moneyBurstAt(el, amount>0);
}

/* ============================= TURN FLOW CONTROL ============================= */
function continueTurnFlow(){
  turnEpoch++;
  inMotion = false;
  const p = currentPlayer();
  if(p.bankrupt){ nextPlayerAuto(); return; }
  if(pendingWasDouble){
    pendingWasDouble = false;
    log(`🎲 ${p.name} rolled doubles — go again!`);
    turnRolled = false;
    document.getElementById('rollBtn').disabled = false;
    document.getElementById('endTurnBtn').disabled = true;
    maybeAutoPlayTurn(true);
  } else {
    document.getElementById('endTurnBtn').disabled = false;
    if(p.type==='cpu'){
      setTimeout(()=>{ if(currentPlayer()===p && !blocking) endTurn(); }, 950);
    }
  }
  saveGame();
}

/* ============================= DICE / MOVEMENT ============================= */
function rollDice(){
  const p = currentPlayer();
  if(turnRolled || blocking) return;
  if(p.inJail){ handleJailRoll(p); return; }
  turnRolled = true;
  inMotion = true;
  document.getElementById('rollBtn').disabled = true;
  const d1 = 1+Math.floor(Math.random()*6);
  const d2 = 1+Math.floor(Math.random()*6);
  animateDiceRoll(d1, d2, ()=>{
    const isDouble = d1===d2;
    if(isDouble) doublesCount++; else doublesCount=0;
    if(doublesCount===3){
      log(`🚔 ${p.name} rolled 3 doubles in a row — off to Kirikiri Prison!`);
      sendToJail(p);
      pendingWasDouble = false;
      renderAll();
      if(!blocking) continueTurnFlow();
      return;
    }
    pendingWasDouble = isDouble;
    if(isDouble) sfxDoubles();
    movePlayerSteps(p, d1+d2, ()=>{
      renderAll();
      if(!blocking) continueTurnFlow();
    });
  });
}
function movePlayerSteps(p, steps, callback){
  animateHop(p, steps, ()=>{
    resolveTile(p);
    if(callback) callback();
  });
}
function animateHop(p, steps, done){
  let remaining = steps;
  const idx = players.indexOf(p);
  function hop(){
    if(remaining<=0){
      log(`➡️ ${p.name} moved to ${TILES[p.pos].n}.`);
      bounceToken(p);
      done();
      return;
    }
    p.pos = (p.pos+1)%40;
    if(p.pos===0){ changeCash(p,200); log(`💰 ${p.name} passed BÈRÈ and collected ₦200.`); }
    const el = tokenEls[idx];
    if(el){ el.classList.remove('hopping'); void el.offsetWidth; el.classList.add('hopping'); }
    playTone(360+Math.random()*60,50,'square',0.05);
    renderTokens();
    updateCamera();
    remaining--;
    setTimeout(hop, 300);
  }
  hop();
}
function movePlayerTo(p, idx, collectIfPassed){
  const start = p.pos;
  if(collectIfPassed && idx < start){ changeCash(p,200); log(`💰 ${p.name} passed BÈRÈ and collected ₦200.`); }
  p.pos = idx;
  log(`➡️ ${p.name} was sent to ${TILES[idx].n}.`);
  renderTokens();
  bounceToken(p);
  flashTile(idx);
  resolveTile(p);
}
function advanceToNearest(p, type){
  let target = p.pos;
  for(let step=1; step<=40; step++){
    const idx = (p.pos+step)%40;
    if(TILES[idx].t===type){ target = idx; break; }
  }
  const start = p.pos;
  if(target < start){ changeCash(p,200); log(`💰 ${p.name} passed BÈRÈ and collected ₦200.`); }
  p.pos = target;
  const t = TILES[target];
  log(`➡️ ${p.name} advanced to ${t.n}.`);
  renderTokens();
  bounceToken(p);
  flashTile(target);
  if(t.owner && t.owner!==p && !t.mortgaged){
    let amt;
    if(type==='rail'){ amt = rentForTile(t)*2; }
    else { const d1=1+Math.floor(Math.random()*6), d2=1+Math.floor(Math.random()*6); amt=(d1+d2)*10; }
    changeCash(p,-amt); changeCash(t.owner,amt);
    log(`💸 ${p.name} paid ₦${amt} special rent to ${t.owner.name} for ${t.n}.`);
    checkBankrupt(p);
  } else if(!t.owner){
    offerBuy(p, t);
  }
}
function sendToJail(p){
  p.pos = 10; p.inJail = true; p.jailTurns = 0;
  sfxJail();
  renderAll();
  const board = document.getElementById('board');
  if(board){ board.classList.remove('jail-shake'); void board.offsetWidth; board.classList.add('jail-shake'); setTimeout(()=>board.classList.remove('jail-shake'),500); }
}

/* ============================= TILE RESOLUTION ============================= */
function resolveTile(p){
  const t = TILES[p.pos];
  if(t.t==='go'){ /* nothing extra */ }
  else if(t.t==='tax'){
    if(t.choice){ landOnIncomeTax(p); }
    else { changeCash(p,-t.amt); log(`🧾 ${p.name} paid ₦${t.amt} luxury tax.`); }
  }
  else if(t.t==='gotojail'){ log(`🚔 ${p.name} is sent straight to Kirikiri Prison!`); sendToJail(p); }
  else if(t.t==='free'){ log(`🅿️ ${p.name} rests at the Motor Park. Nothing happens (official rule).`); }
  else if(t.t==='chance'){ drawCard(CHANCE_CARDS, p, 'Aza Chance'); }
  else if(t.t==='chest'){ drawCard(CHEST_CARDS, p, 'Ileya Chest'); }
  else if(t.t==='jail'){ /* just visiting */ }
  else if(t.t==='prop' || t.t==='rail' || t.t==='util'){
    if(t.owner===null){ offerBuy(p, t); }
    else if(t.owner!==p && !t.mortgaged){ payRent(p, t); }
  }
  checkBankrupt(p);
  renderAll();
}
function drawCard(deck, p, label){
  sfxCard();
  const card = deck[Math.floor(Math.random()*deck.length)]();
  log(`🃏 [${label}] ${p.name}: ${card.msg}`);
  blocking = true;
  pendingCard = {card, p};
  const isChance = label.includes('Chance');
  modal(`
    <div class="card-flip ${isChance?'deck-chance':'deck-chest'}">
      <h3 class="deck-title"><span class="deck-emoji" aria-hidden="true">${isChance?'🎴':'🎁'}</span> ${label}</h3>
      <p class="card-msg">${card.msg}</p>
      <p class="muted">Drawn by ${p.token} ${p.name}</p>
    </div>
    <div class="row">
      ${p.type==='cpu' ? '<p class="muted" role="status">The computer is reading the card…</p>' : '<button data-act="resolveCard" data-args="[]">Continue</button>'}
    </div>`);
  sfxCardReveal();
  if(p.type==='cpu'){
    setTimeout(()=>{ if(pendingCard) resolveCard(); }, 1700);
  }
}
function resolveCard(){
  if(!pendingCard) return;
  const {card, p} = pendingCard;
  pendingCard = null;
  closeModal();
  const epochBefore = turnEpoch;
  blocking = false;
  card.fn(p);
  checkBankrupt(p);
  renderAll();
  if(!blocking && turnEpoch===epochBefore){
    continueTurnFlow();
  }
}

/* ============================= RENT ============================= */
function rentForTile(t){
  if(t.t==='prop'){
    if(t.houses===0){
      return fullGroupOwned(t) ? t.rent[0]*2 : t.rent[0];
    }
    return t.rent[t.houses];
  }
  if(t.t==='rail'){
    const count = t.owner.props.filter(i=>TILES[i].t==='rail' && !TILES[i].mortgaged).length;
    return 25 * Math.pow(2, Math.max(0,count-1));
  }
  if(t.t==='util'){
    const count = t.owner.props.filter(i=>TILES[i].t==='util' && !TILES[i].mortgaged).length;
    const d1=1+Math.floor(Math.random()*6), d2=1+Math.floor(Math.random()*6);
    const diceSum = d1+d2;
    return count===2 ? diceSum*10 : diceSum*4;
  }
  return 0;
}
function fullGroupOwned(t){
  const group = TILES.filter(x=>x.grp===t.grp);
  return group.every(x=>x.owner===t.owner);
}
function payRent(p, t){
  const amt = rentForTile(t);
  changeCash(p,-amt); changeCash(t.owner,amt);
  log(`💸 ${p.name} paid ₦${amt} rent to ${t.owner.name} for ${t.n}.`);
}

/* ============================= INCOME TAX CHOICE ============================= */
function landOnIncomeTax(p){
  if(p.type==='cpu'){
    const netWorth = computeNetWorth(p);
    const amt = Math.min(200, Math.round(netWorth*0.1));
    changeCash(p,-amt);
    log(`🧾 ${p.name} (CPU) paid ₦${amt} income tax.`);
    return;
  }
  blocking = true;
  const netWorth = computeNetWorth(p);
  const tenPct = Math.round(netWorth*0.1);
  modal(`<h3>🧾 Import Duty Tax</h3><p>Pay a flat ₦200, or 10% of your net worth.</p>
    <p class="muted">Your net worth: ₦${netWorth}</p>
    <div class="row">
      <button data-act="chooseTax" data-args="[200]">Pay ₦200 Flat</button>
      <button class="secondary" data-act="chooseTax" data-args="[${tenPct}]">Pay 10% (₦${tenPct})</button>
    </div>`);
}
function chooseTax(amt){
  const p = currentPlayer();
  changeCash(p,-amt);
  log(`🧾 ${p.name} paid ₦${amt} income tax.`);
  closeModal();
  checkBankrupt(p);
  renderAll();
  blocking = false;
  continueTurnFlow();
}

/* ============================= BUY / AUCTION ============================= */
function offerBuy(p, t){
  blocking = true;
  if(p.type==='cpu'){
    if(p.cash > t.price + 150 && Math.random()<0.75){
      buyProperty(p, t);
      renderAll();
      blocking = false;
      continueTurnFlow();
    } else {
      log(`🤔 ${p.name} (CPU) chose not to buy ${t.n}. Auctioning to all players...`);
      startAuction(t);
    }
    return;
  }
  pendingBuy = {p, t};
  modal(`<h3>${t.n}</h3><p>Price: ₦${t.price}</p><p class="muted">Your cash: ₦${p.cash}</p>
    <div class="row">
      <button data-act="confirmBuy" data-args="[true]" ${p.cash<t.price?'disabled':''}>Buy for ₦${t.price}</button>
      <button class="secondary" data-act="confirmBuy" data-args="[false]">Skip (goes to auction)</button>
    </div>`);
}
function confirmBuy(yes){
  const {p, t} = pendingBuy;
  pendingBuy = null;
  if(yes && p.cash>=t.price){
    buyProperty(p, t);
    closeModal();
    renderAll();
    blocking = false;
    continueTurnFlow();
  } else {
    if(yes) log(`❌ ${p.name} cannot afford ${t.n}.`);
    else log(`${p.name} skipped buying ${t.n}.`);
    closeModal();
    startAuction(t);
  }
}
function buyProperty(p, t){
  changeCash(p,-t.price);
  t.owner = p;
  p.props.push(TILES.indexOf(t));
  sfxBuy();
  log(`🏠 ${p.name} bought ${t.n} for ₦${t.price}.`);
}

function startAuction(t){
  auction = {
    tileIdx: TILES.indexOf(t),
    stillIn: players.map((pl,i)=>i).filter(i=>!players[i].bankrupt),
    currentBid: 0,
    currentBidder: null,
    turnPtr: 0
  };
  log(`🔨 Auction started for ${t.n}! All players may bid.`);
  advanceAuction();
}
function advanceAuction(){
  if(!auction) return;
  if(auction.stillIn.length<=1){ finishAuction(); return; }
  if(auction.turnPtr>=auction.stillIn.length) auction.turnPtr=0;
  const playerIdx = auction.stillIn[auction.turnPtr];
  const p = players[playerIdx];
  const t = TILES[auction.tileIdx];
  const nextBid = auction.currentBid + 10;
  if(p.type==='cpu'){
    setTimeout(()=>{
      if(!auction) return;
      const maxWilling = Math.round(t.price*(0.4+Math.random()*0.7));
      if(nextBid<=maxWilling && nextBid<=p.cash){
        auction.currentBid = nextBid;
        auction.currentBidder = playerIdx;
        sfxAuctionBid();
        log(`🔨 ${p.name} bids ₦${nextBid} for ${t.n}.`);
        auction.turnPtr++;
      } else {
        log(`🔨 ${p.name} passes on ${t.n}.`);
        auction.stillIn.splice(auction.turnPtr,1);
      }
      advanceAuction();
    }, 500);
  } else {
    modal(`<h3>🔨 Auction: ${t.n}</h3>
      <p>Current bid: ₦${auction.currentBid} ${auction.currentBidder!==null? '('+players[auction.currentBidder].name+')':'(no bids yet)'}</p>
      <p class="muted">${p.name}, your cash: ₦${p.cash}</p>
      <div class="row">
        <button data-act="auctionBid" data-args="[]" ${nextBid>p.cash?'disabled':''}>Bid ₦${nextBid}</button>
        <button class="secondary" data-act="auctionPass" data-args="[]">Pass</button>
      </div>`);
  }
}
function auctionBid(){
  const t = TILES[auction.tileIdx];
  const playerIdx = auction.stillIn[auction.turnPtr];
  const nextBid = auction.currentBid + 10;
  auction.currentBid = nextBid;
  auction.currentBidder = playerIdx;
  sfxAuctionBid();
  log(`🔨 ${players[playerIdx].name} bids ₦${nextBid} for ${t.n}.`);
  auction.turnPtr++;
  closeModal();
  advanceAuction();
}
function auctionPass(){
  const t = TILES[auction.tileIdx];
  const playerIdx = auction.stillIn[auction.turnPtr];
  log(`🔨 ${players[playerIdx].name} passes on ${t.n}.`);
  auction.stillIn.splice(auction.turnPtr,1);
  closeModal();
  advanceAuction();
}
function finishAuction(){
  const t = TILES[auction.tileIdx];
  if(auction.currentBidder!==null){
    const p = players[auction.currentBidder];
    changeCash(p,-auction.currentBid);
    t.owner = p;
    p.props.push(auction.tileIdx);
    sfxBuy();
    log(`🔨 ${p.name} won the auction for ${t.n} at ₦${auction.currentBid}!`);
  } else {
    log(`🔨 No bids — ${t.n} remains unowned with the bank.`);
  }
  auction = null;
  renderAll();
  blocking = false;
  continueTurnFlow();
}

/* ============================= DEED / MORTGAGE ============================= */
function showTileInfo(i){
  const t = TILES[i];
  if(!(t.t==='prop'||t.t==='rail'||t.t==='util')) return;
  const groupColor = t.grp ? GROUP_COLORS[t.grp] : (t.t==='rail'?'#333':'#555');
  let rentHtml='';
  if(t.t==='prop'){
    const labels = ['Base rent','With 1 house','With 2 houses','With 3 houses','With 4 houses','With hotel'];
    rentHtml = `<table class="rent-table"><tbody>${labels.map((l,k)=>`<tr><th scope="row">${l}</th><td>₦${t.rent[k]}</td></tr>`).join('')}</tbody></table>`;
  } else if(t.t==='rail'){
    rentHtml = `<p class="small">Rent: ₦25 / ₦50 / ₦100 / ₦200 depending on how many stations the owner controls.</p>`;
  } else {
    rentHtml = `<p class="small">Rent: 4× dice roll (one utility owned) or 10× dice roll (both owned).</p>`;
  }
  let actions='';
  const cp = currentPlayer();
  if(t.owner===cp && !blocking){
    if(t.mortgaged){
      const cost = Math.round(t.price*0.55);
      actions += `<button data-act="unmortgage" data-args="[${i}]" ${cp.cash<cost?'disabled':''}>Unmortgage (₦${cost})</button>`;
    } else if(t.t!=='prop' || t.houses===0){
      actions += `<button data-act="mortgage" data-args="[${i}]">Mortgage (₦${Math.round(t.price*0.5)})</button>`;
    } else {
      actions += `<p class="muted">Sell all houses on this property before mortgaging.</p>`;
    }
  }
  modal(`<h3 class="deed-title" data-deed="${groupColor}">${t.n}</h3>
    <p>Price: ₦${t.price} ${t.mortgaged?'<strong class="warn-text">(Mortgaged)</strong>':''}</p>
    <p class="owner-line">Owner:
      ${t.owner
        ? `<span class="owner-chip" data-bg="${t.owner.color}">${t.owner.token} ${t.owner.name}</span>`
        : `<span class="muted">Bank (unowned)</span>`}
    </p>
    ${t.t==='prop'?`<p>Buildings: ${t.houses===5?'🏨 Hotel':(t.houses>0?'🏠'.repeat(t.houses):'None')}</p>`:''}
    ${rentHtml}
    <div class="row">${actions}<button class="secondary" data-act="closeModal" data-args="[]">Close</button></div>`, {dismissible:true});
}
function mortgage(i){
  const t = TILES[i];
  t.mortgaged = true;
  sfxMortgage();
  changeCash(t.owner, Math.round(t.price*0.5));
  log(`🏦 ${t.owner.name} mortgaged ${t.n} for ₦${Math.round(t.price*0.5)}.`);
  closeModal();
  renderAll();
}
function unmortgage(i){
  const t = TILES[i];
  const cost = Math.round(t.price*0.55);
  if(t.owner.cash>=cost){
    changeCash(t.owner,-cost);
    t.mortgaged = false;
    sfxUnmortgage();
    log(`🏦 ${t.owner.name} paid off the mortgage on ${t.n} (₦${cost}).`);
  }
  closeModal();
  renderAll();
}

/* ============================= BUILD / SELL HOUSES ============================= */
function buildHouse(i){
  const t = TILES[i];
  if(!canBuildOn(t) || blocking) return;
  const p = currentPlayer();
  const cost = Math.round(t.price*0.5);
  if(p.cash<cost) return;
  changeCash(p,-cost);
  if(t.houses===4){
    houseBank += 4; hotelBank -= 1; t.houses = 5;
    log(`🏨 ${p.name} built a Hotel on ${t.n}!`);
    sfxHotel();
  } else {
    houseBank -= 1; t.houses += 1;
    log(`🏠 ${p.name} built a house on ${t.n} (level ${t.houses}).`);
    sfxHouse();
  }
  renderAll();
}
function sellHouseRaw(t){
  const refund = Math.round(t.price*0.25);
  if(t.houses===5){ houseBank -= 4; hotelBank += 1; t.houses = 4; }
  else { houseBank += 1; t.houses -= 1; }
  changeCash(t.owner, refund);
  return refund;
}
function sellHouseUI(i){
  const t = TILES[i];
  if(t.houses<=0 || blocking || !canSellOn(t)) return;
  const refund = sellHouseRaw(t);
  log(`💰 ${t.owner.name} sold a building on ${t.n} for ₦${refund}.`);
  renderAll();
}

/* ============================= JAIL ============================= */
function handleJailRoll(p){
  pendingWasDouble = false;
  turnRolled = true;
  inMotion = true;
  document.getElementById('rollBtn').disabled = true;
  const d1 = 1+Math.floor(Math.random()*6);
  const d2 = 1+Math.floor(Math.random()*6);
  animateDiceRoll(d1, d2, ()=>{
    if(d1===d2){
      log(`🔓 ${p.name} rolled doubles and escapes Kirikiri Prison!`);
      p.inJail=false; p.jailTurns=0;
      movePlayerSteps(p, d1+d2, ()=>{ renderAll(); if(!blocking) continueTurnFlow(); });
    } else {
      p.jailTurns++;
      if(p.jailTurns>=3){
        log(`⏰ ${p.name} served 3 turns — released, but must pay ₦50 bail now.`);
        changeCash(p,-50); p.inJail=false; p.jailTurns=0;
        checkBankrupt(p);
        movePlayerSteps(p, d1+d2, ()=>{ renderAll(); if(!blocking) continueTurnFlow(); });
      } else {
        log(`🔒 ${p.name} stays in Kirikiri Prison (attempt ${p.jailTurns}/3).`);
        renderAll();
        if(!blocking) continueTurnFlow();
      }
    }
  });
}
function payBail(){
  const p = currentPlayer();
  if(p.inJail && p.cash>=50 && !turnRolled){
    changeCash(p,-50); p.inJail=false; p.jailTurns=0;
    log(`💵 ${p.name} paid ₦50 bail and is free.`);
    renderAll();
    document.getElementById('payBailBtn').classList.add('hidden');
    document.getElementById('useCardBtn').classList.add('hidden');
  }
}
function useJailCard(){
  const p = currentPlayer();
  if(p.inJail && p.getOutOfJail>0 && !turnRolled){
    p.getOutOfJail--; p.inJail=false; p.jailTurns=0;
    log(`🎟️ ${p.name} used a Get Out of Jail Free card.`);
    renderAll();
    document.getElementById('payBailBtn').classList.add('hidden');
    document.getElementById('useCardBtn').classList.add('hidden');
  }
}

/* ============================= BANKRUPTCY / WIN ============================= */
function checkBankrupt(p){
  if(p.cash<0){
    let propsWithHouses = p.props.filter(i=>TILES[i].t==='prop' && TILES[i].houses>0)
      .sort((a,b)=>TILES[b].houses-TILES[a].houses);
    for(const i of propsWithHouses){
      while(p.cash<0 && TILES[i].houses>0){ sellHouseRaw(TILES[i]); }
      if(p.cash>=0) break;
    }
    let idx = p.props.findIndex(i=>!TILES[i].mortgaged);
    while(p.cash<0 && idx!==-1){
      const t = TILES[p.props[idx]];
      t.mortgaged = true;
      changeCash(p, Math.round(t.price*0.5));
      log(`🏦 ${p.name} mortgaged ${t.n} for ₦${Math.round(t.price*0.5)}.`);
      idx = p.props.findIndex(i=>!TILES[i].mortgaged);
    }
    if(p.cash<0){
      p.bankrupt = true;
      sfxBankrupt();
      log(`💀 ${p.name} is bankrupt and out of the game! All properties return to the bank.`);
      p.props.forEach(i=>{ TILES[i].owner=null; TILES[i].houses=0; TILES[i].mortgaged=false; });
      p.props=[];
      checkWin();
    }
  }
}
function checkWin(){
  const alive = players.filter(p=>!p.bankrupt);
  if(alive.length===1){
    gameOver = true;
    clearSave();
    setTimeout(()=>{
      sfxWin();
      launchConfetti();
      modal(`<h3>🏆 ${alive[0].name} wins!</h3><p>Congratulations — you own Naija!</p>
        <div class="row"><button data-act="reloadGame" data-args="[]">Play again</button></div>`);
    }, 300);
  }
}
function launchConfetti(){
  const holder = document.getElementById('winnerConfetti');
  const colors = ['#008751','#ffffff','#d4a017','#e8590c','#1e90ff'];
  for(let i=0;i<80;i++){
    const piece = document.createElement('div');
    piece.className='confetti-piece';
    piece.style.left = Math.random()*100+'vw';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDuration = (2+Math.random()*2)+'s';
    piece.style.animationDelay = (Math.random()*0.6)+'s';
    holder.appendChild(piece);
    setTimeout(()=>piece.remove(), 5000);
  }
}

/* ============================= TURN PROGRESSION ============================= */
function endTurn(){
  if(!turnRolled || blocking) return;
  nextPlayerAuto();
}
function nextPlayerAuto(){
  turnRolled = false;
  doublesCount = 0;
  document.getElementById('rollBtn').disabled = false;
  document.getElementById('endTurnBtn').disabled = true;
  do{
    currentIdx = (currentIdx+1)%players.length;
  } while(players[currentIdx].bankrupt);
  renderAll();
  log(`— ${players[currentIdx].name}'s turn —`);
  maybeAutoPlayTurn();
}
function maybeAutoPlayTurn(){
  const p = currentPlayer();
  document.getElementById('payBailBtn').classList.toggle('hidden', !(p.inJail && !p.bankrupt));
  document.getElementById('useCardBtn').classList.toggle('hidden', !(p.inJail && p.getOutOfJail>0));
  document.getElementById('tradeBtn').classList.toggle('hidden', p.type==='cpu' || p.bankrupt);
  if(p.type==='cpu' && !p.bankrupt){
    setTimeout(()=>{
      if(p.inJail){
        if(p.getOutOfJail>0){ useJailCard(); }
        else if(p.cash>150 && Math.random()<0.4){ payBail(); }
      }
      rollDice();
    }, 900);
  }
}

/* ============================= TRADING ============================= */
function openTradeModal(){
  const me = currentPlayer();
  const others = players.filter(p=>p!==me && !p.bankrupt);
  if(others.length===0) return;
  renderTradeModal(players.indexOf(others[0]));
}
function renderTradeModal(targetIdx){
  const me = currentPlayer();
  const target = players[targetIdx];
  const otherPlayers = players.filter(p=>!p.bankrupt && p!==me);
  const propList = (owner, cls)=> owner.props.length
    ? owner.props.map(i=>`<label class="check"><input type="checkbox" class="${cls}" value="${i}"> ${TILES[i].n}</label>`).join('')
    : '<span class="muted">None</span>';
  modal(`
    <h3>Propose a trade</h3>
    <div class="trade-form">
      <label class="field"><span class="field-label">Trade with</span>
        <select id="tradeTargetSel" data-change="renderTradeModal">
          ${otherPlayers.map(p=>`<option value="${players.indexOf(p)}" ${p===target?'selected':''}>${p.name}</option>`).join('')}
        </select></label>
      <div class="trade-cols">
        <fieldset><legend>Your properties</legend>${propList(me,'myProp')}</fieldset>
        <fieldset><legend>${target.name}'s properties</legend>${propList(target,'theirProp')}</fieldset>
      </div>
      <div class="trade-cash">
        <label class="field"><span class="field-label">Cash you add (₦)</span>
          <input id="cashFromMe" type="number" inputmode="numeric" min="0" max="${Math.max(0,me.cash)}" value="0"></label>
        <label class="field"><span class="field-label">Cash they add (₦)</span>
          <input id="cashFromThem" type="number" inputmode="numeric" min="0" max="${Math.max(0,target.cash)}" value="0"></label>
      </div>
    </div>
    <div class="row">
      <button data-act="submitTrade" data-args="[${targetIdx}]">Send offer</button>
      <button class="secondary" data-act="closeModal" data-args="[]">Cancel</button>
    </div>
  `, {dismissible:true});
}
function submitTrade(targetIdx){
  const me = currentPlayer();
  const target = players[targetIdx];
  const myProps = [...document.querySelectorAll('.myProp:checked')].map(e=>+e.value);
  const theirProps = [...document.querySelectorAll('.theirProp:checked')].map(e=>+e.value);
  const cashFromMe = Math.min(Math.max(0, +document.getElementById('cashFromMe').value || 0), Math.max(0, me.cash));
  const cashFromThem = Math.min(Math.max(0, +document.getElementById('cashFromThem').value || 0), Math.max(0, target.cash));
  closeModal();
  const trade = {meIdx: currentIdx, targetIdx, myProps, theirProps, cashFromMe, cashFromThem};
  if(target.type==='cpu'){
    const valueGivenByMe = myProps.reduce((s,i)=>s+TILES[i].price,0) + cashFromMe;
    const valueGivenByThem = theirProps.reduce((s,i)=>s+TILES[i].price,0) + cashFromThem;
    const ratio = valueGivenByMe===0 ? (valueGivenByThem>0?0:1) : valueGivenByThem/valueGivenByMe;
    if(ratio>=0.85 && target.cash>=cashFromThem && me.cash>=cashFromMe){
      executeTrade(trade);
      log(`🤝 ${target.name} accepted the trade with ${me.name}!`);
    } else {
      log(`🤝 ${target.name} rejected the trade offer.`);
    }
  } else {
    modal(`<h3>🤝 Trade Offer from ${me.name}</h3>
      <p>${me.name} offers: ${myProps.map(i=>TILES[i].n).join(', ')||'nothing'} ${cashFromMe?('+ ₦'+cashFromMe):''}</p>
      <p>In exchange for: ${theirProps.map(i=>TILES[i].n).join(', ')||'nothing'} ${cashFromThem?('+ ₦'+cashFromThem):''}</p>
      <div class="row">
        <button data-act="acceptTrade" data-args="[]">Accept</button>
        <button class="secondary" data-act="closeModal" data-args="[]">Decline</button>
      </div>`);
    pendingTrade = trade;
  }
  renderAll();
}
function acceptTrade(){
  executeTrade(pendingTrade);
  pendingTrade = null;
  closeModal();
  renderAll();
}
function executeTrade(trade){
  const me = players[trade.meIdx];
  const target = players[trade.targetIdx];
  trade.myProps.forEach(i=>{ me.props = me.props.filter(x=>x!==i); target.props.push(i); TILES[i].owner = target; });
  trade.theirProps.forEach(i=>{ target.props = target.props.filter(x=>x!==i); me.props.push(i); TILES[i].owner = me; });
  changeCash(me,-trade.cashFromMe); changeCash(target,trade.cashFromMe);
  changeCash(target,-trade.cashFromThem); changeCash(me,trade.cashFromThem);
  log(`🤝 Trade complete between ${me.name} and ${target.name}.`);
  renderAll();
}
