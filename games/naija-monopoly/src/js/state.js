/* ============================= STATE ============================= */
let players = [];
let currentIdx = 0;
let doublesCount = 0;
let turnRolled = false;
let houseBank = 32;
let hotelBank = 12;
let blocking = false;
let pendingWasDouble = false;
let pendingBuy = null;
let auction = null;
let pendingTrade = null;
let pendingCard = null;
let turnEpoch = 0;
const COLORS = ['#e8590c','#1e90ff','#ffd700','#2ecc71'];

