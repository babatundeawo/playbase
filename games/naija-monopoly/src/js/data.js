/* ============================= BOARD DATA ============================= */
const GROUP_COLORS = {
  brown:'var(--brown)', lightblue:'var(--lightblue)', pink:'var(--pink)', orange:'var(--orange)',
  red:'var(--red)', yellow:'var(--yellow)', darkblue:'var(--darkblue)', green:'#2e8b57',
  rail:'#333', util:'#555'
};

/* ============================= TILE ART (illustrated property scenes) ============================= */
function svgToUrl(svg){ return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`; }
function skyBg(c1,c2){ return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100" height="100" fill="url(#sky)"/>`; }
function windows(x,y,w,h,cols,rows,fill){
  let s='';
  const cw=w/cols, ch=h/rows;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    s+=`<rect x="${x+c*cw+cw*0.18}" y="${y+r*ch+ch*0.18}" width="${cw*0.64}" height="${ch*0.64}" fill="${fill}" opacity="${0.55+((r+c)%3)*0.15}"/>`;
  }
  return s;
}
const TILE_ART = {
  brown: skyBg('#ffb877','#e8873b') + `
    <rect x="0" y="70" width="100" height="30" fill="#7a5230"/>
    <rect x="6" y="52" width="34" height="20" fill="#b5793f"/><polygon points="4,52 23,40 42,52" fill="#5c3a1e"/>
    ${windows(10,58,26,10,3,1,'#ffe9a8')}
    <rect x="46" y="46" width="30" height="26" fill="#c98a4b"/><polygon points="44,46 61,33 78,46" fill="#5c3a1e"/>
    ${windows(50,52,22,16,2,2,'#fff3c4')}
    <rect x="0" y="70" width="100" height="4" fill="#5c3a1e"/>
    <circle cx="86" cy="20" r="8" fill="#ffe9a8"/>`,
  lightblue: skyBg('#bfeaff','#7ec8e3') + `
    <rect x="0" y="76" width="100" height="24" fill="#4c7f93"/>
    <rect x="14" y="18" width="34" height="58" fill="#e8f6fb"/>
    ${windows(18,24,26,46,3,7,'#3ba7d6')}
    <rect x="54" y="34" width="28" height="42" fill="#d3ecf6"/>
    ${windows(58,40,20,30,2,5,'#3ba7d6')}
    <rect x="0" y="76" width="100" height="4" fill="#33566b"/>`,
  pink: skyBg('#ffd6ec','#f39fce') + `
    <rect x="0" y="74" width="100" height="26" fill="#7a9b5e"/>
    <rect x="20" y="46" width="52" height="30" fill="#fff0f7"/>
    <polygon points="14,46 46,26 78,46" fill="#c96f9b"/>
    ${windows(28,54,16,14,2,2,'#e35b93')}
    <rect x="52" y="54" width="14" height="20" fill="#c96f9b"/>
    <rect x="8" y="70" width="10" height="10" fill="#5c7a44"/>
    <circle cx="10" cy="64" r="8" fill="#7a9b5e"/>`,
  orange: skyBg('#ffd39c','#ff8c00') + `
    <rect x="0" y="78" width="100" height="22" fill="#8a6a3a"/>
    <rect x="16" y="50" width="60" height="28" fill="#fff4e0"/>
    <polygon points="10,50 46,30 82,50" fill="#a85b1f"/>
    ${windows(22,58,20,14,2,2,'#e8590c')}
    ${windows(50,58,20,14,2,2,'#e8590c')}
    <rect x="42" y="62" width="12" height="16" fill="#a85b1f"/>
    <rect x="4" y="60" width="4" height="30" fill="#3d6b2e"/><circle cx="6" cy="56" r="9" fill="#4f8a3c"/>`,
  red: skyBg('#ffc4b0','#d7263d') + `
    <rect x="0" y="72" width="100" height="28" fill="#4a1218"/>
    <rect x="10" y="40" width="80" height="34" fill="#e2725a"/>
    <rect x="10" y="40" width="80" height="6" fill="#7f0f1e"/>
    ${windows(16,50,20,18,2,2,'#ffe3b0')}
    ${windows(42,50,20,18,2,2,'#ffe3b0')}
    ${windows(68,50,16,18,2,2,'#ffe3b0')}
    <circle cx="50" cy="30" r="10" fill="#f4c20d" opacity=".85"/>`,
  yellow: skyBg('#fff3b0','#f4c20d') + `
    <rect x="0" y="76" width="100" height="24" fill="#5b4a10"/>
    <rect x="12" y="48" width="76" height="30" fill="#fffbe6"/>
    <rect x="12" y="48" width="76" height="8" fill="#e8590c"/>
    ${windows(18,60,22,14,2,2,'#f4c20d')}
    ${windows(58,60,22,14,2,2,'#f4c20d')}
    <rect x="44" y="62" width="12" height="16" fill="#8a6b0f"/>`,
  green: skyBg('#c8f5da','#2e8b57') + `
    <rect x="0" y="80" width="100" height="20" fill="#0a3320"/>
    <rect x="18" y="14" width="26" height="66" fill="#eafff2"/>
    ${windows(21,18,20,58,2,10,'#2e8b57')}
    <rect x="52" y="30" width="30" height="50" fill="#d7f5e4"/>
    ${windows(55,34,24,42,3,7,'#1f6b41')}
    <rect x="28" y="6" width="2" height="12" fill="#555"/><polygon points="30,6 30,12 40,9" fill="#d4a017"/>`,
  darkblue: skyBg('#dbe8ff','#1b4f8c') + `
    <rect x="0" y="82" width="100" height="18" fill="#0c2646"/>
    <rect x="30" y="8" width="28" height="74" fill="#e7f0ff"/>
    ${windows(33,12,22,66,3,11,'#1b4f8c')}
    <rect x="10" y="46" width="18" height="36" fill="#cfe0f5"/>
    <rect x="62" y="34" width="20" height="48" fill="#cfe0f5"/>
    ${windows(65,38,14,40,2,6,'#1b4f8c')}
    <polygon points="42,2 46,8 38,8" fill="#d4a017"/>`,
  rail: skyBg('#dfe3e6','#8a94a0') + `
    <rect x="0" y="70" width="100" height="30" fill="#3a3f45"/>
    <rect x="0" y="86" width="100" height="4" fill="#111"/>
    <rect x="4" y="88" width="8" height="3" fill="#555"/><rect x="20" y="88" width="8" height="3" fill="#555"/>
    <rect x="36" y="88" width="8" height="3" fill="#555"/><rect x="52" y="88" width="8" height="3" fill="#555"/>
    <rect x="68" y="88" width="8" height="3" fill="#555"/><rect x="84" y="88" width="8" height="3" fill="#555"/>
    <rect x="18" y="42" width="46" height="28" rx="4" fill="#c0392b"/>
    <rect x="22" y="48" width="10" height="10" fill="#fdf6e3"/><rect x="36" y="48" width="10" height="10" fill="#fdf6e3"/>
    <circle cx="28" cy="72" r="5" fill="#222"/><circle cx="54" cy="72" r="5" fill="#222"/>
    <rect x="64" y="52" width="8" height="18" fill="#c0392b"/>`,
  util: skyBg('#eef2f5','#b7c2cc') + `
    <rect x="0" y="78" width="100" height="22" fill="#4a545c"/>
    <polygon points="50,10 30,54 44,54 34,90 70,44 54,44 62,10" fill="#f4c20d"/>
    <rect x="10" y="60" width="10" height="30" fill="#7d8790"/>
    <rect x="80" y="55" width="10" height="35" fill="#7d8790"/>`
};
function tileArtStyle(t){
  const key = t.grp ? t.grp : t.t;
  const art = TILE_ART[key];
  if(!art) return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${art}</svg>`;
  return `background:linear-gradient(to bottom, rgba(8,18,14,.18) 0%, rgba(6,14,11,.6) 58%, rgba(4,9,7,.94) 100%), ${svgToUrl(svg)}; background-size:cover; background-position:center;`;
}

function buildRent(price){
  const base = Math.round(price*0.08);
  return [base, base*5, base*15, base*30, base*45, base*60];
}
const TILES = [
  {n:'BÈRÈ — GO', t:'go'},
  {n:'Yaba', t:'prop', grp:'brown', price:60},
  {n:'Ileya Chest', t:'chest'},
  {n:'Ajegunle', t:'prop', grp:'brown', price:60},
  {n:'Import Duty Tax', t:'tax', amt:200, choice:true},
  {n:'Lagos Railway', t:'rail', price:200},
  {n:'Kubwa', t:'prop', grp:'lightblue', price:100},
  {n:'Aza Chance', t:'chance'},
  {n:'Wuse', t:'prop', grp:'lightblue', price:100},
  {n:'Garki', t:'prop', grp:'lightblue', price:120},
  {n:'Kirikiri — Just Visiting', t:'jail'},
  {n:'Bodija', t:'prop', grp:'pink', price:140},
  {n:'NEPA Power Co.', t:'util', price:150},
  {n:'Dugbe', t:'prop', grp:'pink', price:140},
  {n:'Mokola', t:'prop', grp:'pink', price:160},
  {n:'Ibadan Railway', t:'rail', price:200},
  {n:'GRA Enugu', t:'prop', grp:'orange', price:180},
  {n:'Ileya Chest', t:'chest'},
  {n:'Ogui, Enugu', t:'prop', grp:'orange', price:180},
  {n:'New Haven, Enugu', t:'prop', grp:'orange', price:200},
  {n:'Motor Park — Free Parking', t:'free'},
  {n:'Sabon Gari, Kano', t:'prop', grp:'red', price:220},
  {n:'Aza Chance', t:'chance'},
  {n:'Fagge, Kano', t:'prop', grp:'red', price:220},
  {n:'Kano City', t:'prop', grp:'red', price:240},
  {n:'Kano Railway', t:'rail', price:200},
  {n:'GRA, Port Harcourt', t:'prop', grp:'yellow', price:260},
  {n:'Trans Amadi, PH', t:'prop', grp:'yellow', price:260},
  {n:'NITEL Water Board', t:'util', price:150},
  {n:'Diobu, PH', t:'prop', grp:'yellow', price:280},
  {n:'Go To Kirikiri Prison!', t:'gotojail'},
  {n:'Maitama, Abuja', t:'prop', grp:'green', price:300},
  {n:'Asokoro, Abuja', t:'prop', grp:'green', price:300},
  {n:'Ileya Chest', t:'chest'},
  {n:'Jabi, Abuja', t:'prop', grp:'green', price:320},
  {n:'PH Railway', t:'rail', price:200},
  {n:'Aza Chance', t:'chance'},
  {n:'Ikoyi, Lagos', t:'prop', grp:'darkblue', price:350},
  {n:'Luxury Tax', t:'tax', amt:100, choice:false},
  {n:'Banana Island, Lagos', t:'prop', grp:'darkblue', price:400},
];
TILES.forEach(t=>{
  if(t.t==='prop') t.rent = buildRent(t.price);
  if(t.t==='prop'||t.t==='rail'||t.t==='util'){ t.owner=null; t.houses=0; t.mortgaged=false; }
});

const CHANCE_CARDS = [
  ()=>({msg:'Naija wins AFCON! Collect ₦100 from bank.', fn:p=>{changeCash(p,100);}}),
  ()=>({msg:'NEPA took light. Pay ₦50 for generator fuel.', fn:p=>{changeCash(p,-50);}}),
  ()=>({msg:'Your Jollof rice won a cook-off! Collect ₦75.', fn:p=>{changeCash(p,75);}}),
  ()=>({msg:'Go to Banana Island, Lagos.', fn:p=>{movePlayerTo(p, 39, true);}}),
  ()=>({msg:'Advance to GO. Collect ₦200.', fn:p=>{movePlayerTo(p, 0, false); changeCash(p,200);}}),
  ()=>({msg:'Go directly to Kirikiri Prison. Do not pass GO.', fn:p=>{sendToJail(p);}}),
  ()=>({msg:'Get Out of Jail Free card — keep it until needed.', fn:p=>{p.getOutOfJail++;}}),
  ()=>({msg:'You underpriced fuel at your filling station. Pay ₦150 fine.', fn:p=>{changeCash(p,-150);}}),
  ()=>({msg:'Your Aunty sent Detty December alert. Collect ₦50.', fn:p=>{changeCash(p,50);}}),
  ()=>({msg:'Go back 3 spaces.', fn:p=>{movePlayerTo(p, (p.pos-3+40)%40, false);}}),
  ()=>({msg:'Advance to the nearest Railway Station. Buy it if unowned, or pay double rent if owned.', fn:p=>{advanceToNearest(p,'rail');}}),
  ()=>({msg:'Advance to the nearest Utility. Buy it if unowned, or roll and pay 10× the dice if owned.', fn:p=>{advanceToNearest(p,'util');}}),
];
const CHEST_CARDS = [
  ()=>({msg:'Village people meeting cancelled — collect ₦200 blessing.', fn:p=>{changeCash(p,200);}}),
  ()=>({msg:'School fees due. Pay ₦100.', fn:p=>{changeCash(p,-100);}}),
  ()=>({msg:'Your Owambe contribution refunded. Collect ₦40.', fn:p=>{changeCash(p,40);}}),
  ()=>({msg:'Doctor bills. Pay ₦60.', fn:p=>{changeCash(p,-60);}}),
  ()=>({msg:'It is your birthday! Every player gives you ₦20.', fn:p=>{players.forEach(o=>{ if(o!==p && !o.bankrupt){changeCash(o,-20); changeCash(p,20);} });}}),
  ()=>({msg:'Get Out of Jail Free card — keep it until needed.', fn:p=>{p.getOutOfJail++;}}),
  ()=>({msg:'Go to Kirikiri Prison directly.', fn:p=>{sendToJail(p);}}),
  ()=>({msg:'Land inheritance from Village. Collect ₦100.', fn:p=>{changeCash(p,100);}}),
  ()=>({msg:'Repairs on your properties. Pay ₦40 per house, ₦115 per hotel.', fn:p=>{
      let cost=0; p.props.forEach(i=>{ const t=TILES[i]; if(t.t==='prop'){ if(t.houses>0&&t.houses<5) cost+=40*t.houses; if(t.houses===5) cost+=115; } });
      changeCash(p,-cost);
    }}),
  ()=>({msg:'Advance to GO. Collect ₦200.', fn:p=>{movePlayerTo(p,0,false); changeCash(p,200);}}),
];

