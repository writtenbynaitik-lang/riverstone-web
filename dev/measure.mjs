import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--hide-scrollbars'] });
for (const w of [320,390,430,768,1024,1440,1920]) {
  const p = await b.newPage({ viewport:{width:w,height:860} });
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{await document.fonts.ready});
  await p.waitForTimeout(500);
  const r = await p.evaluate(()=>{
    const el=document.querySelector('.hero__word');
    const wrap=el.closest('.wrap');
    const cs=getComputedStyle(wrap);
    const avail=wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const spans=[...el.querySelectorAll('span')];
    const l=spans[0].getBoundingClientRect(), r2=spans[spans.length-1].getBoundingClientRect();
    return { avail:Math.round(avail), word:Math.round(r2.right-l.left),
             fs:Math.round(parseFloat(getComputedStyle(el).fontSize)),
             docOver: document.documentElement.scrollWidth-document.documentElement.clientWidth };
  });
  console.log(`w=${String(w).padStart(4)} fontSize=${String(r.fs).padStart(4)}px  word=${String(r.word).padStart(5)}px  available=${String(r.avail).padStart(5)}px  ${r.word>r.avail?'OVERFLOWS by '+(r.word-r.avail)+'px':'fits'}   docOverflow=${r.docOver}`);
  await p.close();
}
await b.close();
