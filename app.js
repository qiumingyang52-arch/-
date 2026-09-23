const weights = { H:1.008,He:4.003,Li:6.94,Be:9.0122,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.18,Na:22.99,Mg:24.305,Al:26.982,Si:28.085,P:30.974,S:32.06,Cl:35.45,Ar:39.948,K:39.098,Ca:40.078,Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,Ga:69.723,Ge:72.63,As:74.922,Se:78.971,Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,Nb:92.906,Mo:95.95,Tc:98,Ru:101.07,Rh:102.906,Pd:106.42,Ag:107.868,Cd:112.414,In:114.818,Sn:118.71,Sb:121.76,Te:127.6,I:126.904,Xe:131.293,Cs:132.905,Ba:137.327,La:138.905,Ce:140.116,Pr:140.908,Nd:144.242,Pm:145,Sm:150.36,Eu:151.964,Gd:157.25,Tb:158.925,Dy:162.5,Ho:164.93,Er:167.259,Tm:168.934,Yb:173.045,Lu:174.967,Hf:178.49,Ta:180.948,W:183.84,Re:186.207,Os:190.23,Ir:192.217,Pt:195.084,Au:196.967,Hg:200.592,Tl:204.38,Pb:207.2,Bi:208.98,Po:209,At:210,Rn:222,Fr:223,Ra:226,Ac:227,Th:232.038,Pa:231.036,U:238.029,Np:237,Pu:244,Am:243,Cm:247,Bk:247,Cf:251,Es:252,Fm:257,Md:258,No:259,Lr:266,Rf:267,Db:268,Sg:269,Bh:270,Hs:277,Mt:278,Ds:281,Rg:282,Cn:285,Nh:286,Fl:289,Mc:290,Lv:293,Ts:294,Og:294 };

function parseFormula(raw) {
  const formula = raw.replace(/\s/g, ''); if (!formula) throw Error('请输入化学式。');
  const parts = formula.split(/[.·]/); if (parts.some(p => !p)) throw Error('化学式不完整。');
  const total = {};
  for (const part of parts) { const p = new Parser([...part]); const counts = p.parse(); Object.entries(counts).forEach(([e,n]) => total[e]=(total[e]||0)+n); }
  const mass = Object.entries(total).reduce((sum,[e,n]) => sum + weights[e]*n, 0); return { formula, mass, total };
}
class Parser {
  constructor(chars) { this.c=chars; this.i=0; }
  parse() { const prefix=this.number(1), result=this.group(null); if (!Object.keys(result).length || this.i!==this.c.length) throw Error('化学式不完整。'); Object.keys(result).forEach(e=>result[e]*=prefix); return result; }
  group(close) { const out={}; while(this.i<this.c.length) { const ch=this.c[this.i]; if (ch===')'||ch===']') { if(ch!==close) throw Error('括号不匹配。'); this.i++; return out; }
      if(ch==='('||ch==='[') { this.i++; const nested=this.group(ch==='('?')':']'); if(!Object.keys(nested).length) throw Error('括号内没有内容。'); const n=this.number(1); Object.entries(nested).forEach(([e,x])=>out[e]=(out[e]||0)+x*n); continue; }
      if(!/[A-Z]/.test(ch)) throw Error(/[0-9]/.test(ch)?'下标必须是正整数。':`不支持字符：${ch}`);
      const e=this.element(), n=this.number(1); out[e]=(out[e]||0)+n;
    } if(close) throw Error('括号不匹配。'); return out; }
  element() { let e=this.c[this.i++]; while(this.i<this.c.length&&/[a-z]/.test(this.c[this.i])) e+=this.c[this.i++]; if(weights[e]===undefined) throw Error(`未找到元素：${e}`); return e; }
  number(def) { const start=this.i; while(this.i<this.c.length&&/[0-9]/.test(this.c[this.i])) this.i++; if(start===this.i)return def; const n=Number(this.c.slice(start,this.i)); if(n<1) throw Error('下标必须是正整数。'); return n; }
}

const entries = [
  ['乙酸','CH₃COOH','acid',1.8e-5,'醋酸'],['氢氟酸','HF','acid',6.8e-4,''],['次氯酸','HClO','acid',3e-8,''],['氢氰酸','HCN','acid',6.2e-10,''],['碳酸（第1级）','H₂CO₃','acid',4.3e-7,''],['碳酸（第2级）','H₂CO₃','acid',4.7e-11,''],['磷酸（第1级）','H₃PO₄','acid',7.1e-3,''],['铵根离子','NH₄⁺','acid',5.6e-10,''],['氨水','NH₃·H₂O','base',1.8e-5,'氨、一水合氨'],['甲胺','CH₃NH₂','base',4.4e-4,''],['吡啶','C₅H₅N','base',1.7e-9,''],['苯胺','C₆H₅NH₂','base',3.8e-10,'']
];
let kind='acid';
const $=id=>document.getElementById(id);
function scientific(n) { return n.toExponential(2).replace('e+','e'); }
function showMass() { try { const r=parseFormula($('formula').value); $('massError').hidden=true; $('massResult').hidden=false; $('massResult').innerHTML=`<div class="result"><span>Mr</span><span class="mass">${r.mass.toFixed(3)}</span></div><p class="hint">元素组成：${Object.keys(r.total).sort().map(e=>`${e} × ${r.total[e]}`).join('，')}</p>`; } catch(e) { $('massResult').hidden=true; $('massError').hidden=false; $('massError').textContent=e.message; } }
function showEntries() { const q=$('search').value.trim().toLowerCase(); const list=entries.filter(x=>x[2]===kind&&(!q||[x[0],x[1],x[4]].join(' ').toLowerCase().includes(q))); $('entries').innerHTML=list.length?list.map(x=>`<div class="entry"><div class="entry-top"><span>${x[0]}</span><span class="formula">${x[1]}</span></div><div class="constant">${kind==='acid'?'Ka':'Kb'} = ${scientific(x[3])}</div><div class="note">p${kind==='acid'?'Ka':'Kb'} ≈ ${(-Math.log10(x[3])).toFixed(2)} · 25 ℃ 水溶液近似值</div></div>`).join(''):'<p class="hint">没有匹配结果</p>'; }
$('calculate').onclick=showMass; $('formula').onkeydown=e=>{if(e.key==='Enter')showMass();}; $('massTab').onclick=()=>{ $('massTab').classList.add('active');$('constantTab').classList.remove('active');$('massPanel').hidden=false;$('constantPanel').hidden=true;}; $('constantTab').onclick=()=>{ $('constantTab').classList.add('active');$('massTab').classList.remove('active');$('massPanel').hidden=true;$('constantPanel').hidden=false;showEntries();}; document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));showEntries();}); $('search').oninput=showEntries; showMass();
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js'));
