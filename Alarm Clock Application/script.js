const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const alarmForm = document.getElementById('alarmForm');
const alarmTimeInput = document.getElementById('alarmTime');
const alarmLabelInput = document.getElementById('alarmLabel');
const alarmStatus = document.getElementById('alarmStatus');
const clearAlarmButton = document.getElementById('clearAlarm');
const enableSoundButton = document.getElementById('enableSound');
const soundNotice = document.getElementById('soundNotice');

let alarmTime = null;
let alarmLabel = '';
let alarmActive = false;
let alarmTriggered = false;
let alarmSound = null;
let audioContext = null;
let alarmSoundReady = false;

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentTimeEl.textContent = timeString;
  currentDateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  if (alarmActive && !alarmTriggered) {
    const alarmNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (alarmNow === alarmTime) {
      triggerAlarm();
    }
  }
}

function triggerAlarm() {
  alarmTriggered = true;
  alarmStatus.textContent = `Alarm ringing: ${alarmLabel || 'Alarm'}`;
  playAlarmSound();
  if (navigator.vibrate) {
    navigator.vibrate([250, 150, 250, 200, 400]);
  }
}

function unlockAudio() {
  if (alarmSoundReady) {
    return;
  }

  if (audioContext && audioContext.state === 'closed') {
    audioContext = null;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.02);

  alarmSoundReady = true;
  if (enableSoundButton) {
    enableSoundButton.textContent = 'Sound Enabled';
    enableSoundButton.disabled = true;
  }
  if (soundNotice) {
    soundNotice.textContent = 'Sound is enabled. Set your alarm now.';
  }
}

function playAlarmSound() {
  if (!alarmSoundReady) {
    unlockAudio();
  }

  if (alarmSound) {
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.connect(audioContext.destination);

  const notes = [440, 494, 523, 587, 659, 698, 784];
  let startTime = audioContext.currentTime;
  const oscillators = [];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = index % 2 === 0 ? 'triangle' : 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gainNode);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.25);
    oscillators.push(oscillator);
    startTime += 0.25;
  });

  gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.08);
  gainNode.gain.setTargetAtTime(0.02, audioContext.currentTime + 1.5, 0.15);

  alarmSound = { audioContext, gainNode, oscillators };

  setTimeout(() => {
    stopAlarmSound();
  }, 3000);
}

function stopAlarmSound() {
  if (!alarmSound) {
    return;
  }
  const { gainNode } = alarmSound;
  gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.8);
  setTimeout(() => {
    alarmSound = null;
  }, 900);
}

function updateAlarmStatus() {
  if (!alarmActive) {
    alarmStatus.textContent = 'No active alarm.';
    return;
  }
  alarmStatus.textContent = `Alarm set for ${alarmTime}${alarmLabel ? ` (${alarmLabel})` : ''}.`;
}

alarmForm.addEventListener('submit', event => {
  event.preventDefault();
  unlockAudio();
  alarmTime = alarmTimeInput.value;
  alarmLabel = alarmLabelInput.value.trim();
  if (!alarmTime) {
    return;
  }
  alarmActive = true;
  alarmTriggered = false;
  updateAlarmStatus();
  alarmForm.reset();
});

if (enableSoundButton) {
  enableSoundButton.addEventListener('click', unlockAudio);
}

document.body.addEventListener('click', unlockAudio, { once: true });

clearAlarmButton.addEventListener('click', () => {
  alarmActive = false;
  alarmTriggered = false;
  alarmTime = null;
  alarmLabel = '';
  stopAlarmSound();
  updateAlarmStatus();
});

setInterval(updateClock, 1000);
updateClock();
