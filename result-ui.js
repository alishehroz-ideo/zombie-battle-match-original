/* The sealed Unity result remains authoritative. Animation only changes text. */
(()=>{'use strict';
const rows=[['パズル','puzzle'],['ゾンビ撃破','normalKills'],['ボス撃破','bossKills'],['技巧・攻撃阻止','technique'],['防衛ボーナス','defense'],['2分クリアボーナス','clearBonus']];
const fmt=n=>Math.max(0,Math.trunc(Number(n)||0)).toLocaleString('en-US');
const host=document.getElementById('frame');
const screen=document.createElement('section');screen.id='battle-result';screen.hidden=true;screen.setAttribute('aria-labelledby','result-heading');
screen.innerHTML=`<div class="result-panel"><h2 id="result-heading" class="result-title"><span class="result-metal">戦闘結果</span></h2><p class="result-status"></p><div class="result-total"><span class="result-gold" aria-hidden="true">0</span></div><dl class="result-breakdown">${rows.map(([label,key])=>`<div class="result-row"><dt>${label}</dt><dd data-score="${key}">0</dd></div>`).join('')}</dl><dl class="result-stats">${['最大COMBO','撃破','ライフ'].map(label=>`<div class="result-stat"><dt>${label}</dt><dd>0</dd></div>`).join('')}</dl><p class="result-note"></p><button id="result-register" type="button"><span class="result-button-text result-metal">スコア登録</span></button></div>`;
host.append(screen);
const panel=screen.querySelector('.result-panel'),total=screen.querySelector('.result-total'),digits=total.firstElementChild,status=screen.querySelector('.result-status'),button=screen.querySelector('button');
let finalResult=null,animation=0,serial=0,locked=false,closeTimer=0;
const fit=(el,max)=>{el.style.fontSize=max+'px';if(el.scrollWidth>el.clientWidth)el.style.fontSize=Math.max(8,max*el.clientWidth/el.scrollWidth-.3)+'px';};
function fitNumbers(){if(screen.hidden)return;const w=panel.clientWidth;const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit';probe.textContent=fmt(finalResult.score);total.append(probe);total.style.fontSize=w*.18+'px';const natural=probe.getBoundingClientRect().width;total.style.fontSize=Math.min(w*.18,(w*.84)/Math.max(1,natural)*w*.18)+'px';probe.remove();screen.querySelectorAll('.result-row dd').forEach(el=>fit(el,w*.051));screen.querySelectorAll('.result-stat dd').forEach(el=>fit(el,w*.07));}
function hide(){serial++;cancelAnimationFrame(animation);clearTimeout(closeTimer);screen.hidden=true;host.classList.remove('result-showing');finalResult=null;}
function show(result){
 serial++;const token=serial;cancelAnimationFrame(animation);clearTimeout(closeTimer);host.classList.add('result-showing');
 // Copy the sealed values once. Never replace them with the interpolated display value.
 finalResult=Object.freeze({...result,scoreBreakdown:Object.freeze({...result.scoreBreakdown})});locked=false;button.disabled=false;button.classList.remove('is-pressed');button.removeAttribute('aria-busy');button.firstElementChild.textContent='スコア登録';
 const b=finalResult.scoreBreakdown;screen.querySelectorAll('[data-score]').forEach(el=>{const k=el.dataset.score;el.textContent=fmt(k==='technique'?Number(b.technique||0)+Number(b.interrupts||0):b[k]);});
 screen.querySelectorAll('.result-stat dd').forEach((el,i)=>el.textContent=fmt([finalResult.maxChain,finalResult.kills,finalResult.lives][i]));
 const clear=Object.prototype.hasOwnProperty.call(b,'clearBonus')?Number(b.clearBonus)>0:finalResult.endReason==='time_up';status.textContent=clear?'GAME CLEAR':'GAME OVER';status.classList.toggle('is-clear',clear);
 screen.querySelector('.result-note').textContent=finalResult.validity&&finalResult.validity!=='valid'?'中断あり：参考記録':'';
 total.classList.remove('score-settled');total.setAttribute('aria-label','合計スコア '+fmt(finalResult.score)+'点');digits.textContent='0';screen.hidden=false;screen.scrollTop=0;fitNumbers();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const start=performance.now();
 function tick(now){if(serial!==token)return;const p=reduced?1:Math.min(1,(now-start)/800);digits.textContent=fmt(Math.round(finalResult.score*(1-Math.pow(1-p,3))));if(p<1)animation=requestAnimationFrame(tick);else{digits.textContent=fmt(finalResult.score);total.classList.add('score-settled');}}
 animation=requestAnimationFrame(tick);document.fonts.ready.then(()=>{if(serial===token)fitNumbers();});
}
button.addEventListener('click',()=>{if(locked||!finalResult)return;locked=true;button.disabled=true;button.setAttribute('aria-busy','true');button.classList.add('is-pressed');const sealed=finalResult;
 // Keep the current label-only registration action: return to the existing title scene.
 closeTimer=setTimeout(()=>{try{window.returnToZombieTitle(sealed);hide();}catch(e){locked=false;button.disabled=false;button.removeAttribute('aria-busy');button.classList.remove('is-pressed');screen.querySelector('.result-note').textContent='もう一度お試しください';}},120);
});
new ResizeObserver(fitNumbers).observe(panel);
window.addEventListener('zombie-score-match-finished',e=>show(e.detail));window.addEventListener('zombie-match-started',hide);
window.BattleResultUI={show,hide};
})();
