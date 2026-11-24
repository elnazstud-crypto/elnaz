import { createBoard, swapCells, resolveMatches, hasLegalMove, findMatches, GEM_TYPES } from "./engine.js";

const TARGET = 1200;
const $ = id => document.getElementById(id);
const boardEl = $("board");
let board = createBoard();
let selected = null;
let busy = false;
let score = 0;
let moves = 25;
let bestScore = 0;
const SAVE_KEY = "gem-quest-save-v1";
let soundOn = true;
let audioContext = null;
const fa = value => new Intl.NumberFormat("fa-IR").format(value);

function audio(freq=520, duration=.09, type="sine") {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gain.gain.setValueAtTime(.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration + .02);
  } catch {}
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, board, score, moves, bestScore }));
  } catch {}
}
function restoreProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    const validBoard = Array.isArray(saved?.board) && saved.board.length === 8 &&
      saved.board.every(row => Array.isArray(row) && row.length === 8 &&
        row.every(gem => gem === null || (GEM_TYPES.includes(gem.type) && (gem.special === null || ["bomb","rainbow","rocket-h","rocket-v"].includes(gem.special)))));
    if (saved?.version === 1 && validBoard) {
      board = saved.board;
      score = Number.isFinite(saved.score) ? Math.max(0, saved.score) : 0;
      moves = Number.isFinite(saved.moves) ? Math.max(0, Math.min(25, saved.moves)) : 25;
      bestScore = Number.isFinite(saved.bestScore) ? Math.max(0, saved.bestScore) : 0;
    }
  } catch {}
}
restoreProgress();

function render() {
  boardEl.innerHTML = "";
  board.forEach((row, r) => row.forEach((gem, c) => {
    const cell = document.createElement("button");
    cell.className = "cell" + (selected && selected[0]===r && selected[1]===c ? " selected" : "");
    cell.type = "button";
    cell.setAttribute("role","gridcell");
    cell.setAttribute("aria-label", `ردیف ${r+1} ستون ${c+1}`);
    if (gem) {
      const jewel = document.createElement("span");
      jewel.className = "gem " + gem.type + (gem.special ? " special" : "");
      const image = document.createElement("img");
      image.src = `./assets/gems/${gem.type}.svg`;
      image.alt = "";
      image.draggable = false;
      jewel.append(image);
      if (gem.special) {
        const glyph = document.createElement("em");
        glyph.textContent = gem.special === "rainbow" ? "✹" : gem.special.startsWith("rocket") ? "➤" : "✹";
        jewel.append(glyph);
      }
      cell.append(jewel);
    }
    cell.addEventListener("click", () => onCell(r,c));
    boardEl.append(cell);
  }));
  $("score").textContent = fa(score);
  $("moves").textContent = fa(moves);
  bestScore = Math.max(bestScore, score);
  $("bestScore").textContent = fa(bestScore);
  saveProgress();
  $("progressBar").style.width = Math.min(100, score/TARGET*100) + "%";
}
function adjacent(a,b){return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1;}
async function onCell(r,c) {
  if (busy) return;
  audio(380,.045);
  if (!selected) { selected=[r,c]; render(); return; }
  const from=selected; selected=null;
  if (from[0]===r && from[1]===c) { render(); return; }
  if (!adjacent(from,[r,c])) { selected=[r,c]; render(); return; }
  const result=swapCells(board,from,[r,c]);
  if (!result.valid) {
    render(); boardEl.classList.remove("shake"); void boardEl.offsetWidth; boardEl.classList.add("shake"); audio(150,.08,"triangle"); return;
  }
  busy=true; moves--; board=result.board; render(); audio(620,.08);
  await wait(130);
  if (result.matches.specialCombo) $("hint").textContent = "قدرت ویژه فعال شد!";
  await settle(result.matches);
  busy=false; render(); checkEnd();
}
async function settle(initialMatches = null) {
  let safety=0;
  let pending = initialMatches;
  while (safety++<20) {
    const before = pending || findMatches(board);
    if (!before.cells.length) break;
    const resolution=resolveMatches(board, Math.random, 20, pending);
    pending = null;
    score += resolution.totalCleared * 60 + Math.max(0, resolution.waves - 1) * resolution.totalCleared * 15;
    board=resolution.board;
    render();
    audio(500 + Math.min(500,resolution.totalCleared*18),.14,"triangle");
    await wait(190);
  }
  if (!hasLegalMove(board)) {
    board=createBoard(); $("hint").textContent="گوهرها دوباره آمیخته شدند";
    await wait(250);
  } else {
    $("hint").textContent="ترکیب‌های بزرگ‌تر، امتیاز بیشتر!";
  }
}
function checkEnd(){
  if(score>=TARGET){showModal("دروازه بیدار شد!","مرحله‌ی اول را با موفقیت پشت سر گذاشتی. امتیاز تو: "+fa(score), "بازی دوباره", reset);}
  else if(moves<=0){showModal("حرکت‌ها تمام شد","این بار به هدف نرسیدی. دوباره تلاش کن و ترکیب‌های بزرگ‌تر بساز.","تلاش دوباره",reset);}
}
function showModal(title,text,button,action){$("modalTitle").textContent=title;$("modalText").textContent=text;$("modalAction").textContent=button;$("modalAction").onclick=()=>{$("modal").classList.add("hidden");action();};$("modal").classList.remove("hidden");}
function reset(){board=createBoard();score=0;moves=25;selected=null;busy=false;$("hint").textContent="سه گوهر هم‌رنگ را ردیف کن";render();}
$("restartButton").addEventListener("click",()=>showModal("شروع دوباره؟","پیشرفت این مرحله از ابتدا آغاز می‌شود.","شروع دوباره",reset));
$("shuffleButton").addEventListener("click",()=>{if(busy)return;board=createBoard();selected=null;$("hint").textContent="گوهرها آمیخته شدند";audio(740,.12);render();});
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundToggle").textContent=soundOn?"♫":"♩";if(soundOn)audio(700,.08);});
$("pauseButton").addEventListener("click",()=>{if(busy)return;showModal("مکث","هر زمان آماده بودی به ماجراجویی ادامه بده.","ادامه",()=>{});});
render();
