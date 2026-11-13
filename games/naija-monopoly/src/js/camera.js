/* ============================= DYNAMIC CAMERA (follow-player zoom) ============================= */
/* 'auto' follows the current player (zoomed in), 'full' shows the whole board.
   Phones start zoomed in because the full board is tiny there; larger screens start with the full board. */
let camMode = window.matchMedia('(min-width: 900px)').matches ? 'full' : 'auto';
function isModalOpen(){ return !!document.querySelector('.modal-bg'); }
function toggleCamMode(){
  camMode = (camMode==='full') ? 'auto' : 'full';
  const btn = document.getElementById('camToggleBtn');
  if(btn){
    btn.querySelector('.btn-label').textContent = camMode==='full' ? 'Follow player' : 'Full board';
  }
  updateCamera();
}
function syncCamButton(){
  const btn = document.getElementById('camToggleBtn');
  const label = btn && btn.querySelector('.btn-label');
  if(label) label.textContent = camMode==='full' ? 'Follow player' : 'Full board';
}
function updateCamera(immediate){
  syncCamButton();
  const viewport = document.getElementById('boardViewport');
  const board = document.getElementById('board');
  const label = document.getElementById('camLabel');
  if(!viewport || !board || document.getElementById('app').classList.contains('hidden')) return;
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  const bw = board.offsetWidth, bh = board.offsetHeight;
  if(!vw || !bw) return;
  const fitScale = Math.min(vw/bw, vh/bh);
  const showFull = camMode==='full' || isModalOpen() || !players.length;
  let scale, tx, ty, labelText;
  if(showFull){
    scale = fitScale;
    tx = (vw - bw*scale)/2;
    ty = (vh - bh*scale)/2;
    labelText = isModalOpen() ? '' : 'Full board';
  } else {
    const p = currentPlayer();
    const tile = document.getElementById('tile-'+(p?p.pos:0));
    const tileNatural = bw/11;
    scale = Math.min(Math.max((vw/4.3)/tileNatural, fitScale*1.15), fitScale*4.2);
    const Lx = tile ? tile.offsetLeft + tile.offsetWidth/2 : bw/2;
    const Ly = tile ? tile.offsetTop + tile.offsetHeight/2 : bh/2;
    tx = vw/2 - Lx*scale;
    ty = vh/2 - Ly*scale;
    tx = Math.min(0, Math.max(tx, vw - bw*scale));
    ty = Math.min(0, Math.max(ty, vh - bh*scale));
    labelText = p ? `Following ${p.name}${p.type==='cpu'?' (CPU)':''}` : '';
  }
  board.style.transition = (immediate || reduceMotion.matches) ? 'none' : 'transform .4s cubic-bezier(.4,0,.2,1)';
  board.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  if(label){ label.textContent = labelText; label.style.opacity = labelText ? '1' : '0'; }
}
if('ResizeObserver' in window){
  new ResizeObserver(()=>{
    clearTimeout(window._camResizeT);
    window._camResizeT = setTimeout(()=>updateCamera(true), 80);
  }).observe(document.getElementById('boardViewport'));
}
function markOwnership(){
  TILES.forEach((t,i)=>{
    if(t.t!=='prop'&&t.t!=='rail'&&t.t!=='util') return;
    const tile = document.getElementById('tile-'+i);
    if(!tile) return;
    tile.style.boxShadow = t.owner ? `inset 0 0 0 3px ${t.owner.color}` : '';
    tile.classList.toggle('mortgaged', !!t.mortgaged);
    refreshTileVisual(i);
  });
}

