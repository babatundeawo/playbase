/* ============================= AUDIO ============================= */
let muted = store.get('nm-muted') === '1';
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; }
  }
  return audioCtx;
}
function playTone(freq, duration=140, type='sine', vol=0.14, delay=0){
  if(muted) return;
  const ctx = getAudioCtx();
  if(!ctx) return;
  try{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain); gain.connect(ctx.destination);
    const start = ctx.currentTime + delay;
    osc.start(start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration/1000);
    osc.stop(start + duration/1000 + 0.02);
  }catch(e){}
}
function playNoise(duration=150, vol=0.1, delay=0, filterFreq=1200){
  if(muted) return;
  const ctx = getAudioCtx();
  if(!ctx) return;
  try{
    const bufferSize = ctx.sampleRate * (duration/1000);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start(ctx.currentTime+delay);
  }catch(e){}
}
/* Haptics follow the same switch as sound and are skipped when the visitor prefers reduced motion. */
function buzz(pattern){
  if(muted || reduceMotion.matches || !navigator.vibrate) return;
  try{ navigator.vibrate(pattern); }catch(e){ /* not supported */ }
}
function sfxRoll(){ playTone(220,70,'square',0.08); playNoise(90,0.05,0,900); }
function sfxSettle(){ playTone(440,120,'triangle',0.12); buzz(25); }
function sfxGain(amt){
  if(amt>0) playTone(700,140,'sine',0.12);
  else if(amt<0) playTone(180,160,'sawtooth',0.1);
  if(amt>=150) sfxLaugh();
  else if(amt<=-150) sfxSad();
}
function sfxLaugh(){
  const base=[520,470,560,500,600];
  base.forEach((f,i)=>playTone(f,110,'square',0.09,i*0.095));
}
function sfxSad(){
  [300,270,230,190,150].forEach((f,i)=>playTone(f,240,'sine',0.11,i*0.14));
}
function sfxBuy(){ buzz(20); playTone(520,90,'triangle',0.14); playTone(780,140,'triangle',0.14,0.09); playTone(980,160,'triangle',0.12,0.18); }
function sfxMortgage(){ playTone(500,90,'square',0.1); playTone(300,120,'square',0.1,0.1); playNoise(140,0.06,0.15,700); }
function sfxUnmortgage(){ playTone(420,90,'triangle',0.11); playTone(620,120,'triangle',0.11,0.09); playTone(880,150,'triangle',0.12,0.18); }
function sfxJail(){
  buzz([40,30,40]);
  playTone(160,90,'square',0.12); playTone(140,90,'square',0.12,0.14); playTone(120,180,'square',0.12,0.28);
  playNoise(200,0.08,0,400);
}
function sfxCard(){ playTone(660,70,'triangle',0.1); playTone(880,90,'triangle',0.1,0.07); }
function sfxCardReveal(){ playTone(500,60,'sine',0.07); playTone(750,80,'sine',0.08,0.08); playTone(1000,120,'sine',0.09,0.16); }
function sfxDoubles(){ [660,880,1046].forEach((f,i)=>playTone(f,120,'triangle',0.12,i*0.09)); }
function sfxAuctionBid(){ playTone(350,60,'square',0.09); }
function sfxHouse(){ playTone(600,90,'triangle',0.12); playTone(750,90,'triangle',0.1,0.06); }
function sfxHotel(){ playTone(500,110,'triangle',0.13); playTone(700,110,'triangle',0.13,0.08); playTone(900,140,'triangle',0.13,0.16); }
function sfxClick(){ playTone(500,45,'square',0.05); }
function sfxBankrupt(){ playTone(300,180,'sawtooth',0.12); playTone(200,220,'sawtooth',0.12,0.18); playTone(120,300,'sawtooth',0.12,0.4); }
function sfxWin(){ buzz([60,40,60,40,120]); [523,659,784,1046,1318].forEach((f,i)=>playTone(f,240,'triangle',0.15,i*0.16)); }
function syncMuteButton(){
  const btn = document.getElementById('muteBtn');
  if(!btn) return;
  btn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
  btn.classList.toggle('is-off', muted);
}
function toggleMute(){
  muted = !muted;
  store.set('nm-muted', muted ? '1' : '0');
  syncMuteButton();
}
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(btn && btn.id!=='muteBtn') sfxClick();
});
syncMuteButton();

