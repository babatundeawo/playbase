/* ============================= LOG ============================= */
function log(msg){
  const l = document.getElementById('log');
  if(!l) return;
  const d = document.createElement('div');
  d.textContent = msg;
  l.prepend(d);
  while(l.children.length>7) l.removeChild(l.lastChild);
}

/* ============================= MODALS ============================= */
/* Accessible dialog: role=dialog, focus moves in, Tab is trapped, focus returns on close.
   Only informational dialogs (deeds, rules, confirmations) are dismissible with Esc or a backdrop click;
   game decisions (buy, auction, cards) must be answered. */
let modalState = null;
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function modal(html, opts){
  const root = document.getElementById('modalRoot');
  const dismissible = !!(opts && opts.dismissible);
  const opener = modalState ? modalState.opener : document.activeElement;
  root.innerHTML = `<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">${html}</div></div>`;
  const dlg = root.querySelector('.modal');
  const heading = dlg.querySelector('h3');
  if(heading) heading.id = 'modalTitle';
  modalState = { dismissible, opener };
  document.body.classList.add('modal-open');
  (dlg.querySelector(FOCUSABLE) || dlg).focus({preventScroll:true});
  updateCamera();
}
function closeModal(){
  const root = document.getElementById('modalRoot');
  const opener = modalState && modalState.opener;
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  modalState = null;
  if(opener && opener.focus && document.contains(opener)) opener.focus({preventScroll:true});
  updateCamera();
}
document.addEventListener('keydown', (e)=>{
  if(!modalState) return;
  const dlg = document.querySelector('#modalRoot .modal');
  if(!dlg) return;
  if(e.key==='Escape' && modalState.dismissible){ e.preventDefault(); closeModal(); return; }
  if(e.key!=='Tab') return;
  const items = [...dlg.querySelectorAll(FOCUSABLE)];
  if(!items.length){ e.preventDefault(); dlg.focus(); return; }
  const first = items[0], last = items[items.length-1];
  if(e.shiftKey && (document.activeElement===first || document.activeElement===dlg)){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
});
document.addEventListener('mousedown', (e)=>{
  if(modalState && modalState.dismissible && e.target.classList && e.target.classList.contains('modal-bg')) closeModal();
});

function showRules(){
  const src = document.getElementById('rulesBody');
  modal(`<h3>Official rules</h3>
    <div class="rules-list rules-in-modal">${src ? src.innerHTML : ''}</div>
    <div class="row"><button class="secondary" data-act="closeModal" data-args="[]">Close</button></div>`, {dismissible:true});
}
function confirmNewGame(){
  modal(`<h3>Start a new game?</h3>
    <p class="muted">Your current game will be lost.</p>
    <div class="row">
      <button class="danger" data-act="reloadGame" data-args="[]">Yes, start over</button>
      <button class="secondary" data-act="closeModal" data-args="[]">Keep playing</button>
    </div>`, {dismissible:true});
}
