const passages = {
  bn: [
    'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
    'বাংলাদেশ নদীমাতৃক দেশ, এখানে অনেক নদী আছে।',
    'সকালে সূর্য ওঠে এবং পাখিরা গান গায়।',
    'বই পড়া মানুষের জ্ঞান ও চিন্তাশক্তি বাড়ায়।',
    'প্রতিদিনের ছোট অভ্যাস একদিন বড় পরিবর্তন আনে।',
    'নতুন কিছু শেখার জন্য কখনোই দেরি হয়ে যায় না।',
  ],
  en: [
    'Small steps every day lead to remarkable progress over time.',
    'A calm mind can focus on the words right in front of it.',
    'Learning to type well makes every idea easier to share.',
    'The best way to improve is to practice with care and patience.',
    'Clear writing begins with a thoughtful choice of words.',
    'Take your time, find your rhythm, and keep moving forward.',
  ],
};

const passageEl = document.getElementById('passage');
const inputEl = document.getElementById('typingInput');
const errorsEl = document.getElementById('errors');
const messageEl = document.getElementById('message');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timerEl = document.getElementById('timer');
const bestWpmEl = document.getElementById('bestWpm');
const bestAccuracyEl = document.getElementById('bestAccuracy');
const progressLabel = document.getElementById('progressLabel');
const skipBtn = document.getElementById('skipBtn');
const speedUnitEl = document.getElementById('speedUnit');
const speedFootEl = document.getElementById('speedFoot');
const bestUnitEl = document.getElementById('bestUnit');
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const toChars = (text) => Array.from(segmenter.segment(text), (part) => part.segment);
const letterSets = {
  bn: toChars('অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়'),
  en: toChars('abcdefghijklmnopqrstuvwxyz'),
};

let targetChars = [];
let charSpans = [];
let language = 'bn';
let mode = 'sentence';
let duration = 30;
let remaining = duration;
let startedAt = null;
let timerId = null;
let finished = false;
let previousPassage = '';
let isComposing = false;
let correctLetters = 0;
let letterMistakes = 0;
let letterIndex = 0;

function loadPassage() {
  stopTimer();
  finished = false;
  startedAt = null;
  remaining = duration;
  correctLetters = 0;
  letterMistakes = 0;
  letterIndex = 0;
  if (mode === 'letter') {
    targetChars = makeLetterRow();
  } else {
    previousPassage = pickPassage();
    targetChars = toChars(previousPassage);
  }
  passageEl.lang = language;
  passageEl.classList.toggle('single-letter', mode === 'letter');
  passageEl.replaceChildren();
  charSpans = targetChars.map((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    passageEl.appendChild(span);
    return span;
  });

  inputEl.value = '';
  inputEl.disabled = false;
  inputEl.focus();
  errorsEl.textContent = '0';
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100';
  timerEl.textContent = String(remaining);
  progressLabel.textContent = mode === 'letter' ? `০ / ${targetChars.length} অক্ষর` : 'শুরু করতে টাইপ করুন';
  messageEl.textContent = mode === 'letter'
    ? 'দেখানো অক্ষরগুলো ধারাবাহিকভাবে টাইপ করুন'
    : 'টাইপ করা শুরু করলেই সময় গণনা শুরু হবে';
  speedUnitEl.textContent = mode === 'letter' ? 'CPM' : 'WPM';
  bestUnitEl.textContent = mode === 'letter' ? 'CPM' : 'WPM';
  speedFootEl.textContent = mode === 'letter' ? 'প্রতি মিনিটে অক্ষর' : 'প্রতি মিনিটে শব্দ';
  inputEl.placeholder = mode === 'letter'
    ? 'কিবোর্ড / Avro / Bijoy দিয়ে অক্ষরটি লিখুন...'
    : 'এখানে টাইপ করা শুরু করুন...';
  updateBestDisplay();
  updateDisplay();
}

function pickLetter() {
  const letters = letterSets[language];
  let letter;
  do {
    letter = letters[Math.floor(Math.random() * letters.length)];
  } while (letter === previousPassage && letters.length > 1);
  return letter;
}

function makeLetterRow() {
  const row = [];
  for (let index = 0; index < 5; index++) {
    const letter = pickLetter();
    row.push(letter);
    previousPassage = letter;
  }
  return row;
}

function pickPassage() {
  let text;
  do {
    text = passages[language][Math.floor(Math.random() * passages[language].length)];
  } while (text === previousPassage && passages[language].length > 1);
  return text;
}

function appendPassage() {
  const nextPassage = pickPassage();
  previousPassage = nextPassage;
  const nextChars = [' ', ...toChars(nextPassage)];
  targetChars.push(...nextChars);
  nextChars.forEach((character) => {
    const span = document.createElement('span');
    span.textContent = character;
    charSpans.push(span);
    passageEl.appendChild(span);
  });
  progressLabel.textContent = `${toChars(inputEl.value).length} / ${targetChars.length} অক্ষর`;
}

function stopTimer() {
  if (timerId !== null) window.clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  startedAt = Date.now();
  messageEl.textContent = 'সেশন চলছে, টাইপ করতে থাকুন';
  timerId = window.setInterval(() => {
    remaining = Math.max(0, duration - Math.floor((Date.now() - startedAt) / 1000));
    timerEl.textContent = String(remaining);
    if (remaining === 0) finishSession();
  }, 200);
}

function updateDisplay() {
  if (finished || isComposing) return;
  if (mode === 'letter') {
    updateLetterDisplay();
    return;
  }
  const typedChars = toChars(inputEl.value);
  if (typedChars.length && startedAt === null) startTimer();
  let errors = 0;
  let correct = 0;

  charSpans.forEach((span, i) => {
    span.className = '';

    if (i >= typedChars.length) {
      if (i === typedChars.length) span.classList.add('current');
      return;
    }

    const typed = typedChars[i];
    const expected = targetChars[i];
    const isLastTyped = i === typedChars.length - 1;

    if (typed === expected) {
      span.classList.add('correct');
      correct++;
    } else if (isLastTyped && expected.startsWith(typed)) {
      span.classList.add('pending'); // যুক্তবর্ণ লেখা চলছে
    } else {
      span.classList.add('wrong');
      errors++;
    }
  });

  if (typedChars.length > targetChars.length) {
    errors += typedChars.length - targetChars.length;
  }

  errorsEl.textContent = errors;
  const typedCount = typedChars.length;
  accuracyEl.textContent = typedCount ? String(Math.round((correct / typedCount) * 100)) : '100';
  if (startedAt !== null) {
    const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    wpmEl.textContent = String(Math.round((correct / 5) / elapsedMinutes));
  }
  progressLabel.textContent = `${Math.min(typedCount, targetChars.length)} / ${targetChars.length} অক্ষর`;
  if (typedCount === targetChars.length && errors === 0) appendPassage();
}

function updateLetterDisplay() {
  const typedChars = toChars(inputEl.value);
  if (typedChars.length && startedAt === null) startTimer();
  const checkedLength = Math.min(typedChars.length, targetChars.length);
  let correctInRow = 0;
  let errorsInRow = Math.max(typedChars.length - targetChars.length, 0);

  charSpans.forEach((span, index) => {
    span.className = '';
    if (index >= checkedLength) {
      if (index === typedChars.length) span.classList.add('current');
      return;
    }

    if (typedChars[index] === targetChars[index]) {
      span.classList.add('correct');
      correctInRow++;
    } else if (index === typedChars.length - 1 && targetChars[index].startsWith(typedChars[index])) {
      span.classList.add('pending');
    } else {
      span.classList.add('wrong');
      errorsInRow++;
    }
  });

  letterIndex = Math.min(typedChars.length, targetChars.length);
  if (letterIndex === targetChars.length && errorsInRow === 0) {
    correctLetters += targetChars.length;
    correctInRow = 0;
    targetChars = makeLetterRow();
    charSpans = targetChars.map((letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      return span;
    });
    passageEl.replaceChildren(...charSpans);
    inputEl.value = '';
    letterIndex = 0;
    charSpans[0].classList.add('current');
  }

  errorsEl.textContent = letterMistakes + errorsInRow;
  const correctTotal = correctLetters + correctInRow;
  const attempts = correctTotal + letterMistakes + errorsInRow;
  accuracyEl.textContent = attempts ? String(Math.round((correctTotal / attempts) * 100)) : '100';
  progressLabel.textContent = `${letterIndex} / ${targetChars.length} অক্ষর`;
  if (startedAt !== null) {
    const elapsedMinutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    wpmEl.textContent = String(Math.round(correctLetters / elapsedMinutes));
  }
}

function finishSession() {
  if (finished) return;
  finished = true;
  stopTimer();
  inputEl.disabled = true;
  const typedChars = toChars(inputEl.value);
  const errors = Number(errorsEl.textContent);
  const accuracy = Number(accuracyEl.textContent);
  const wpm = Number(wpmEl.textContent);
  messageEl.textContent = typedChars.length === targetChars.length && errors === 0
    ? 'চমৎকার! অনুশীলন সম্পূর্ণ হয়েছে।'
    : 'সময় শেষ। দারুণ চেষ্টা, আবার অনুশীলন করুন।';
  saveBest(wpm, accuracy);
}

inputEl.addEventListener('input', updateDisplay);
inputEl.addEventListener('compositionstart', () => { isComposing = true; });
inputEl.addEventListener('compositionend', () => {
  isComposing = false;
  updateDisplay();
});
document.getElementById('newBtn').addEventListener('click', loadPassage);
skipBtn.addEventListener('click', loadPassage);

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    mode = button.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    loadPassage();
  });
});

document.querySelectorAll('[data-language]').forEach((button) => {
  button.addEventListener('click', () => {
    language = button.dataset.language;
    document.documentElement.lang = language;
    document.querySelectorAll('[data-language]').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    loadPassage();
  });
});

document.querySelectorAll('[data-duration]').forEach((button) => {
  button.addEventListener('click', () => {
    duration = Number(button.dataset.duration);
    document.querySelectorAll('[data-duration]').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    loadPassage();
  });
});

function getBestKey() {
  return `okkhoro-best-${language}-${mode}-${duration}`;
}

function updateBestDisplay() {
  try {
    const best = JSON.parse(localStorage.getItem(getBestKey()) || 'null');
    bestWpmEl.textContent = String(best?.wpm || 0);
    bestAccuracyEl.textContent = String(best?.accuracy || 0);
  } catch {
    bestWpmEl.textContent = '0';
    bestAccuracyEl.textContent = '0';
  }
}

function saveBest(wpm, accuracy) {
  try {
    const best = JSON.parse(localStorage.getItem(getBestKey()) || 'null');
    if (!best || wpm > best.wpm || (wpm === best.wpm && accuracy > best.accuracy)) {
      localStorage.setItem(getBestKey(), JSON.stringify({ wpm, accuracy }));
    }
  } catch {
    // The session still works when browser storage is unavailable.
  }
  updateBestDisplay();
}

loadPassage();