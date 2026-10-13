(() => {
  'use strict';

  const canvas = document.getElementById('unity-canvas');
  const cue = document.createElement('div');
  cue.id = 'arena-cue';
  cue.setAttribute('role', 'status');
  cue.setAttribute('aria-live', 'polite');
  cue.hidden = true;
  document.getElementById('frame').append(cue);

  const style = document.createElement('style');
  style.textContent = `
    #arena-cue {
      position: absolute;
      z-index: 3;
      top: 10.15%;
      left: 50%;
      transform: translateX(-50%);
      max-width: 92%;
      padding: 5px 12px;
      border: 1px solid rgba(235, 193, 77, .82);
      border-radius: 999px;
      background: rgba(10, 16, 18, .88);
      box-shadow: 0 2px 10px rgba(0, 0, 0, .45);
      color: #ffe49b;
      font: 600 clamp(10px, 2.8vw, 14px)/1.25 system-ui, sans-serif;
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
    }
    #arena-cue[hidden] { display: none; }
  `;
  document.head.append(style);

  const prompts = [
    { from: 32, to: 36, text: 'ボス接近！ ゾンビの攻撃を阻止しよう' },
    { from: 67, to: 71, text: 'ボス接近！ ゾンビの攻撃を阻止しよう' },
    { from: 97, to: 101, text: 'ボス接近！ ゾンビの攻撃を阻止しよう' },
    { from: 110, to: 120, text: '残り10秒！ ライフを守って撃破を狙おう' }
  ];

  let matchStartedAt = null;
  let waitingForStart = true;
  let retryPending = false;
  let lastText = '';

  window.addEventListener('zombie-match-started',()=>{waitingForStart=false;matchStartedAt=performance.now();});

  const originalFinished = window.onZombieScoreMatchFinished;
  window.onZombieScoreMatchFinished = json => {
    if (typeof originalFinished === 'function') originalFinished(json);
    waitingForStart = true;
    retryPending = true;
    matchStartedAt = null;
    lastText = '';
    cue.hidden = true;
  };

  function updateCue() {
    if (matchStartedAt !== null) {
      const elapsed = (performance.now() - matchStartedAt) / 1000;
      const prompt = prompts.find(item => elapsed >= item.from && elapsed < item.to);
      const text = prompt ? prompt.text : '';
      if (text !== lastText) {
        lastText = text;
        cue.textContent = text;
        cue.hidden = !text;
      }
    }
    requestAnimationFrame(updateCue);
  }
  requestAnimationFrame(updateCue);

})();
