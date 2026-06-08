const UNIT_META = {
  wayin: { title: 'Way In', icon: '🎯', color: 'var(--unit-wayin)' },
  '1': { title: "Unit 1 – I'm from Greenwich", icon: '👨‍👩‍👧‍👦', color: 'var(--unit-1)' },
  '2': { title: 'Unit 2 – This is my school', icon: '🏫', color: 'var(--unit-2)' },
  '3': { title: 'Unit 3 – My free time', icon: '⚽', color: 'var(--unit-3)' },
  '4': { title: "Unit 4 – Let's Celebrate!", icon: '🎂', color: 'var(--unit-4)' },
  '5': { title: 'Unit 5 – Where I Live', icon: '🏠', color: 'var(--unit-5)' },
  '6': { title: 'Unit 6 – A trip to the country', icon: '🌳', color: 'var(--unit-6)' }
};
const MODES = [
  { id: 'flashcards', name: 'Karteikarten', icon: '🗂️' },
  { id: 'writing', name: 'Schreibtraining', icon: '✍️' },
  { id: 'quiz', name: 'Quiz', icon: '❓' }
];
let appState = { vocab: null, unit: '1', mode: null, current: 0, sessionWords: [], xp: 0, streak: 0 };
const $ = s => document.querySelector(s);
function showScreen(id){ document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active'); s.hidden=true}); const el = document.getElementById(id); el.classList.add('active'); el.hidden=false; }
fetch('vocab.json').then(r=>r.json()).then(data=>{ appState.vocab = data; renderHome(); }).catch(()=>alert('vocab.json konnte nicht geladen werden.'));
function renderHome(){
  const grid = $('#units-grid'); grid.innerHTML='';
  appState.vocab.units.forEach(u=>{
    const meta = UNIT_META[u.id];
    const el = document.createElement('button'); el.className='unit-card'; el.innerHTML=`<span class="unit-icon">${meta.icon}</span><span class="unit-name">${meta.title}</span><div class="unit-progress"><div style="width:0%;background:${meta.color}"></div></div><span class="unit-percent">${u.words.length} Wörter</span>`;
    el.onclick=()=>{ appState.unit=u.id; document.querySelectorAll('.unit-card').forEach(x=>x.style.outline='none'); el.style.outline='3px solid #333'; };
    grid.appendChild(el);
  });
  const first = grid.querySelector('.unit-card'); if(first) first.style.outline='3px solid #333';
  const mgrid = $('#modes-grid'); mgrid.innerHTML='';
  MODES.forEach(m=>{ const el = document.createElement('button'); el.className='mode-card'; el.innerHTML=`<span class="mode-icon">${m.icon}</span><span class="mode-name">${m.name}</span>`; el.onclick=()=>startMode(m.id); mgrid.appendChild(el); });
}
function startMode(mode){
  appState.mode = mode;
  const unit = appState.vocab.units.find(u=>u.id===appState.unit);
  appState.sessionWords = unit.words.slice(0,10);
  appState.current = 0;
  $('#progress-total').textContent = appState.sessionWords.length;
  $('#exercise-title').textContent = MODES.find(m=>m.id===mode).icon + ' ' + MODES.find(m=>m.id===mode).name + ' – ' + UNIT_META[appState.unit].title;
  showScreen('screen-exercise');
  renderExercise();
}
function renderExercise(){
  const item = appState.sessionWords[appState.current];
  $('#progress-current').textContent = appState.current + 1;
  const wrap = $('#exercise-content'); const actions = $('#exercise-actions'); wrap.innerHTML=''; actions.innerHTML='';
  if(appState.mode==='flashcards'){
    wrap.innerHTML = `<div class="flashcard panel"><div class="flashcard-de">${item.de}</div><button class="check-btn" id="show-answer">Antwort anzeigen</button><div id="answer" style="display:none"><div class="flashcard-en">${item.en}</div><div class="flashcard-example">${item.example||''}</div><div class="rating-btns"><button class="rating-btn again">Nochmal</button><button class="rating-btn hard">Schwer</button><button class="rating-btn good">Gut</button><button class="rating-btn easy">Leicht</button></div></div></div>`;
    $('#show-answer').onclick=()=>$('#answer').style.display='block';
    document.querySelectorAll('.rating-btn').forEach(btn=>btn.onclick=()=>next());
  } else if(appState.mode==='writing'){
    wrap.innerHTML = `<div class="flashcard panel"><div class="write-form"><p>Übersetze ins Englische:</p><div class="write-target">${item.de}</div><input class="write-input" id="write-input" placeholder="Deine Antwort"><button class="check-btn" id="check-btn">Prüfen</button><div class="write-feedback" id="write-feedback"></div></div></div>`;
    $('#check-btn').onclick=()=>{ const val = $('#write-input').value.trim().toLowerCase(); const ok = val===item.en.toLowerCase() || (item.alt||[]).map(x=>x.toLowerCase()).includes(val); const fb = $('#write-feedback'); fb.textContent = ok ? '✅ Richtig!' : `❌ Richtig wäre: ${item.en}`; fb.className = 'write-feedback ' + (ok ? 'correct' : 'wrong'); actions.innerHTML='<button class="btn-primary" id="next-btn">Weiter</button>'; $('#next-btn').onclick=()=>next(); };
  } else {
    const unit = appState.vocab.units.find(u=>u.id===appState.unit);
    const opts = [item.en, ...unit.words.filter(w=>w.en!==item.en).slice(0,3).map(w=>w.en)].sort(()=>Math.random()-0.5);
    wrap.innerHTML = `<div class="flashcard panel"><div class="flashcard-de">Was bedeutet: ${item.de}?</div><div class="rating-btns" id="opts"></div></div>`;
    const optsWrap = $('#opts');
    opts.forEach(o=>{ const b=document.createElement('button'); b.className='rating-btn good'; b.textContent=o; b.onclick=()=>{ alert(o===item.en ? '✅ Richtig' : '❌ Falsch'); next(); }; optsWrap.appendChild(b); });
  }
}
function next(){
  appState.current++;
  if(appState.current >= appState.sessionWords.length){ alert('🎉 Runde geschafft!'); showScreen('screen-home'); return; }
  renderExercise();
}
$('#back-btn').onclick=()=>showScreen('screen-home');