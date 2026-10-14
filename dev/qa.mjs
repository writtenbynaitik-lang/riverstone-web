import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2]; const W = +(process.argv[3]||1600); const H = +(process.argv[4]||1000);
fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--force-color-profile=srgb','--font-render-hinting=none','--hide-scrollbars'] });
const p = await b.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
const errs=[]; p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
const bad=[]; p.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url()); });
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.evaluate(async()=>{ await document.fonts.ready; });

const page = await p.evaluate(()=>document.documentElement.scrollHeight);
const n = Math.ceil((page-H)/H)+1;
let maxUnrevealed=0, overflow=0; const offs=[];
for(let i=0;i<n;i++){
  const y=Math.min(i*H,page-H);
  await p.evaluate(yy=>window.scrollTo(0,yy), y);
  await p.waitForTimeout(950);                       // let IO + lazy images settle
  const r = await p.evaluate(()=>{
    const de=document.documentElement;
    const vis=[...document.querySelectorAll('.rv')].filter(el=>{
      const b=el.getBoundingClientRect();
      return b.top < window.innerHeight*0.85 && b.bottom > 0;
    });
    const bad=[];
    document.querySelectorAll('body *').forEach(el=>{
      const b=el.getBoundingClientRect();
      if(b.width>0 && (b.right>de.clientWidth+1.5 || b.left<-1.5)){
        const t=el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.split(' ').filter(Boolean)[0]:'');
        if(!bad.some(x=>x===t)) bad.push(t);
      }
    });
    return { over: de.scrollWidth-de.clientWidth,
             unrevealed: vis.filter(el=>!el.classList.contains('in')).length,
             off: bad.slice(0,4) };
  });
  overflow=Math.max(overflow,r.over); maxUnrevealed=Math.max(maxUnrevealed,r.unrevealed);
  r.off.forEach(t=>{ if(!offs.includes(t)) offs.push(t); });
  await p.screenshot({path:`${OUT}/v${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:85});
}
const final = await p.evaluate(()=>({
  broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
  h1:document.querySelectorAll('h1').length,
  headings:[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>h.tagName).join(','),
  fonts:[...new Set([...document.querySelectorAll('h1,h2,.card__name')].map(e=>getComputedStyle(e).fontFamily.split(',')[0]))]
}));
console.log(JSON.stringify({ width:W, page, screens:n, overflow, maxUnrevealedInView:maxUnrevealed,
  offscreenEls:offs, brokenImgs:final.broken, h1:final.h1, displayFont:final.fonts,
  consoleErrors:errs.slice(0,5), httpErrors:bad.slice(0,5) },null,1));
await b.close();
