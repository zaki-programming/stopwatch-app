let startTime, interval, elapsed = 0;
let isRunning = false;
let lapCount = 0;
let lastLapTime = 0;
let markTimers = [];

function formatTime(ms) {
  const milliseconds = ms % 1000;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  return `${String(hours).padStart(2, '0')}:` +
         `${String(minutes).padStart(2, '0')}:` +
         `${String(seconds).padStart(2, '0')}.` +
         `${String(milliseconds).padStart(3, '0')}`;
}

function updateDisplay() {
  const now = Date.now();
  const total = now - startTime + elapsed;
  document.getElementById('display').textContent = formatTime(total);
}

function start() {
  if (!isRunning) {
    startTime = Date.now();
    interval = setInterval(updateDisplay, 10);
    isRunning = true;
  }
}

function lap() {
  if (isRunning) {
    const now = Date.now();
    const currentTotal = now - startTime + elapsed;
    const diff = currentTotal - lastLapTime;
    lapCount += 1;
    lastLapTime = currentTotal;
    const note = document.getElementById('note').value.trim();
    const text = `Lap ${lapCount}: ${formatTime(currentTotal)} (+${formatTime(diff)})` +
                 (note ? ` - ${note}` : '');
    addRecord(text);
    saveLapData();
    document.getElementById('note').value = '';
  }
}

function clearLaps() {
  document.getElementById('record-list').innerHTML = '';
  localStorage.removeItem('lapRecords');
}

// Revised mark function: works independently of main timer
function mark() {
  const now = Date.now();
  const note = document.getElementById('note').value.trim();

  const container = document.getElementById('mark-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'mark-block';

  const timeText = document.createElement('span');
  timeText.className = 'mark-time';
  timeText.textContent = 'Mark: 00:00:00.000' + (note ? ` - ${note}` : '');

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Stop';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';

  wrapper.appendChild(timeText);
  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(deleteBtn);
  container.appendChild(wrapper);

  const markData = {
    startTime: now,
    element: wrapper,
    note: note,
    stopped: false,
    elapsed: 0,
    interval: null,
    toggleBtn,
    timeText
  };

  function startMarkInterval() {
    markData.interval = setInterval(() => {
      const diff = Date.now() - markData.startTime + markData.elapsed;
      markData.timeText.textContent = `Mark: ${formatTime(diff)}${note ? ` - ${note}` : ''}`;
    }, 10);
  }

  startMarkInterval();

  toggleBtn.onclick = () => {
    const current = Date.now();
    if (!markData.stopped) {
      markData.elapsed += current - markData.startTime;
      markData.stopped = true;
      clearInterval(markData.interval);
      markData.toggleBtn.textContent = 'Resume';
      const finalText = `Mark (Stopped): ${formatTime(markData.elapsed)}${note ? ` - ${note}` : ''}`;
      addRecord(finalText);
      saveLapData();
    } else {
      markData.startTime = Date.now();
      markData.stopped = false;
      markData.toggleBtn.textContent = 'Stop';
      startMarkInterval();
    }
  };

  deleteBtn.onclick = () => {
    clearInterval(markData.interval);
    container.removeChild(wrapper);
    markTimers = markTimers.filter((m) => m !== markData);
  };

  markTimers.push(markData);
  document.getElementById('note').value = '';
}

function stop() {
  if (isRunning) {
    clearInterval(interval);
    elapsed += Date.now() - startTime;
    isRunning = false;
    markTimers.forEach(mark => {
      if (!mark.stopped) {
        const current = Date.now();
        mark.elapsed += current - mark.startTime;
        mark.stopped = true;
        clearInterval(mark.interval);
        if (mark.toggleBtn) mark.toggleBtn.textContent = 'Resume';
      }
    });
  }
}

function resume() {
  if (!isRunning && elapsed > 0) {
    startTime = Date.now();
    interval = setInterval(updateDisplay, 10);
    isRunning = true;
  }
}

function reset() {
  clearInterval(interval);
  interval = null;
  elapsed = 0;
  lapCount = 0;
  lastLapTime = 0;
  isRunning = false;
  document.getElementById('display').textContent = '00:00:00.000';
  document.getElementById('note').value = '';
}

function fullReset() {
  reset();
  clearLaps();
  markTimers.forEach(m => clearInterval(m.interval));
  markTimers = [];
  document.getElementById('mark-container').innerHTML = '';
}

function addRecord(text) {
  const list = document.getElementById('record-list');
  const li = document.createElement('li');
  li.textContent = text;
  list.appendChild(li);
}

function saveLapData() {
  const items = [];
  document.querySelectorAll('#record-list li').forEach(li => {
    items.push(li.textContent);
  });
  localStorage.setItem('lapRecords', JSON.stringify(items));
}

function loadLapData() {
  const data = localStorage.getItem('lapRecords');
  if (data) {
    const items = JSON.parse(data);
    items.forEach(text => addRecord(text));
  }
}

window.onload = loadLapData;
