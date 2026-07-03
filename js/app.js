// app.js - Hangman game
const forbidden = new Set(['h','t','c','b','i']);
const SECRET_SEQ = ['b','i','t','c','h']; // consecutive detection
const MAX_WRONG = 5; // user requested 5 wrong guesses cause loss

// initial safe wordlist (no forbidden letters)
const defaultWords = [
  'apple','orange','grape','lemon','mango','pear','plum','melon','guava','papaya',
  'sugar','glass','puzzle','jungle','gold','sun','moon','sky','army','drum','lamp','rope','zero','seven','four'
];

let wordList = [];
let secret = '';
let revealed = [];
let used = new Set();
let wrong = 0;
let lastSecret = null;
let seqIndex = 0; // for consecutive special sequence detection

// DOM
const imgEl = document.getElementById('hangmanImg');
const wordDisplay = document.getElementById('wordDisplay');
const alphabetDiv = document.getElementById('alphabet');
const usedLetters = document.getElementById('usedLetters');
const wrongCount = document.getElementById('wrongCount');
const maxWrongSpan = document.getElementById('maxWrong');
const status = document.getElementById('status');
const wordListDiv = document.getElementById('wordList');
const addBtn = document.getElementById('addWordBtn');
const newWordInput = document.getElementById('newWord');

maxWrongSpan.textContent = MAX_WRONG;

function isValidWord(s){
  if(!s || typeof s !== 'string') return false;
  s = s.trim().toLowerCase();
  if(!/^[a-z]+$/.test(s)) return false;
  for(const ch of s) if(forbidden.has(ch)) return false;
  return true;
}

function loadWords(){
  try{
    const raw = localStorage.getItem('eg_safe_words');
    if(raw){
      const arr = JSON.parse(raw);
      if(Array.isArray(arr) && arr.length) {
        wordList = arr.filter(isValidWord);
        if(wordList.length) return;
      }
    }
  }catch(e){}
  wordList = defaultWords.slice();
}

function saveWords(){
  try{ localStorage.setItem('eg_safe_words', JSON.stringify(wordList)); }catch(e){}
}

function populateWordList(){
  if(!wordList.length){ wordListDiv.textContent = '(no words)'; return; }
  const ul = document.createElement('ul');
  wordList.forEach(w=>{ const li=document.createElement('li'); li.textContent=w; ul.appendChild(li); });
  wordListDiv.innerHTML=''; wordListDiv.appendChild(ul);
}

function pickWord(randomize=true){
  if(!wordList.length){ secret='empty'; }
  else{
    if(randomize) secret = wordList[Math.floor(Math.random()*wordList.length)];
    else secret = lastSecret && wordList.includes(lastSecret) ? lastSecret : wordList[Math.floor(Math.random()*wordList.length)];
    lastSecret = secret;
  }
  revealed = Array.from(secret, ch => ch === ' ' ? ' ' : '_');
  used.clear(); wrong=0; seqIndex=0; updateParts(); updateUI();
}

function updateParts(){
  // map wrong 0..5 to hangman1..hangman6
  const idx = Math.min(wrong, MAX_WRONG);
  const file = `/images/hangman${idx+1}.svg`;
  imgEl.src = file;
}

function updateUI(){
  wordDisplay.textContent = revealed.join(' ');
  usedLetters.textContent = used.size ? Array.from(used).join(', ') : '—';
  wrongCount.textContent = wrong;
  renderAlphabet();
}

function renderAlphabet(){
  alphabetDiv.innerHTML = '';
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l=>{
    const btn = document.createElement('button');
    btn.textContent = l; btn.disabled = used.has(l) || false;
    if(forbidden.has(l)) btn.classList.add('forbidden');
    btn.addEventListener('click', ()=> guessLetter(l));
    alphabetDiv.appendChild(btn);
  });
}

function guessLetter(letter){
  letter = letter.toLowerCase();
  if(used.has(letter)) return;
  used.add(letter);

  // update consecutive sequence detection
  if(letter === SECRET_SEQ[seqIndex]){
    seqIndex++;
  } else if(letter === SECRET_SEQ[0]){
    seqIndex = 1; // restart at 1 if pressed first letter
  } else {
    seqIndex = 0;
  }

  // check special sequence
  if(seqIndex === SECRET_SEQ.length){
    // trigger secret loss: show hangman6 and redirect to pictogrammer.html
    wrong = MAX_WRONG; // treat as loss
    updateParts(); updateUI();
    status.textContent = 'Special sequence triggered — redirecting...';
    // show hangman6 explicitly (index = 6 -> hangman6.svg)
    imgEl.src = `/images/hangman6.svg`;
    setTimeout(()=>{ window.location.href = '/pictogrammer.html'; }, 1200);
    return;
  }

  if(secret.includes(letter)){
    for(let i=0;i<secret.length;i++) if(secret[i]===letter) revealed[i]=letter;
  } else {
    wrong++;
    if(wrong>MAX_WRONG) wrong = MAX_WRONG;
  }

  // check normal end
  if(!revealed.includes('_')){
    status.textContent = 'You win!';
  } else if(wrong >= MAX_WRONG){
    // loss: reveal and show final image (hangman6)
    revealed = Array.from(secret);
    imgEl.src = '/images/hangman6.svg';
    status.textContent = `You lost — the word was: ${secret}`;
  }

  updateParts(); updateUI();
}

// keyboard support
window.addEventListener('keydown', (ev)=>{
  if(ev.ctrlKey||ev.altKey||ev.metaKey) return;
  const k = ev.key.toLowerCase();
  if(!/^[a-z]$/.test(k)) return;
  guessLetter(k);
});

addBtn.addEventListener('click', ()=>{
  const cand = (newWordInput.value||'').trim().toLowerCase();
  if(!isValidWord(cand)){ status.textContent='Invalid: must be letters and not contain h,t,c,b,i.'; return; }
  if(wordList.includes(cand)){ status.textContent='Already in list.'; return; }
  wordList.push(cand); saveWords(); populateWordList(); newWordInput.value=''; status.textContent='Added '+cand;
});
newWordInput.addEventListener('keydown', e=>{ if(e.key==='Enter') addBtn.click(); });

// init
loadWords(); populateWordList(); pickWord(true);
