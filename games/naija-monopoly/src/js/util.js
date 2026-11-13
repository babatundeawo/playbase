'use strict';
/* Shared helpers: safe storage, motion preference, and CSP-friendly event delegation.
   Buttons rendered by the game carry data-act="functionName" data-args="[...]" instead of inline handlers. */

const store = {
  get(key){ try{ return window.localStorage.getItem(key); }catch(e){ return null; } },
  set(key, value){ try{ window.localStorage.setItem(key, value); }catch(e){ /* storage unavailable: preference simply isn't remembered */ } },
  remove(key){ try{ window.localStorage.removeItem(key); }catch(e){ /* nothing to remove */ } }
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('click', (e)=>{
  const el = e.target.closest('[data-act]');
  if(!el || el.disabled) return;
  const fn = window[el.dataset.act];
  if(typeof fn !== 'function') return;
  let args = [];
  try{ args = JSON.parse(el.dataset.args || '[]'); }catch(err){ args = []; }
  fn(...args);
});
document.addEventListener('change', (e)=>{
  const el = e.target.closest('[data-change]');
  if(!el) return;
  const fn = window[el.dataset.change];
  if(typeof fn === 'function') fn(Number(el.value));
});
/* Starting over removes the saved game first, otherwise it would be offered again after the reload. */
function reloadGame(){ if(typeof clearSave==='function') clearSave(); window.location.reload(); }

/* The game builds some elements from templates with colours that depend on the player or the property group.
   The Content Security Policy forbids inline style attributes, so those colours travel in data-bg / data-deed
   and are applied here through the style object, which the policy allows. */
function paintDynamic(root){
  if(!root || root.nodeType !== 1) return;
  const items = root.matches('[data-bg],[data-deed]') ? [root] : [];
  root.querySelectorAll('[data-bg],[data-deed]').forEach((el)=>items.push(el));
  items.forEach((el)=>{
    if(el.dataset.bg) el.style.background = el.dataset.bg;
    if(el.dataset.deed) el.style.setProperty('--deed', el.dataset.deed);
  });
}
new MutationObserver((records)=>records.forEach((r)=>r.addedNodes.forEach(paintDynamic))).observe(document.documentElement, { childList:true, subtree:true });
paintDynamic(document.documentElement);
