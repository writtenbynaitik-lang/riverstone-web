import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--hide-scrollbars'] });

/* --- 1. what overflows at 320? --- */
const p1 = await b.newPage({ viewport:{width:320,height:800} });
await p1.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p1.evaluate(async()=>{await document.fonts.ready});
await p1.waitForTimeout(600);
console.log('320 OVERFLOW SOURCES:');
console.log(await p1.evaluate(()=>{
  const de=document.documentElement, W=de.clientWidth, out=[];
  document.querySelectorAll('body *').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.width>0 && r.right>W+1){
      // only report if no clipping ancestor
      let n=el.parentElement, clipped=false;
      while(n && n!==document.body){ const o=getComputedStyle(n).overflowX; if(o==='hidden'||o==='clip'){clipped=true;break;} n=n.parentElement; }
      if(!clipped) out.push({t:el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.split(' ').filter(Boolean).slice(0,2).join('.'):''),
        w:Math.round(r.width), right:Math.round(r.right), text:(el.textContent||'').trim().slice(0,28)});
    }
  });
  return JSON.stringify({clientW:W, scrollW:de.scrollWidth, unclipped:out.slice(0,8)},null,1);
}));
await p1.close();

/* --- 2. card hover --- */
const p2 = await b.newPage({ viewport:{width:1440,height:900} });
await p2.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p2.evaluate(async()=>{await document.fonts.ready});
await p2.evaluate(()=>document.getElementById('kitchen').scrollIntoView({behavior:'instant'}));
await p2.waitForTimeout(1600);
const box = await p2.locator('#kitchen .card .card__media').first().boundingBox();
console.log('\nCARD MEDIA BOX:', JSON.stringify(box));
await p2.mouse.move(box.x+box.width/2, box.y+box.height/2);
await p2.waitForTimeout(2000);
console.log('AFTER MOUSE MOVE:', await p2.evaluate(()=>{
  const c=document.querySelector('#kitchen .card');
  return JSON.stringify({
    cardRevealed:c.classList.contains('in'),
    matchesHover:c.matches(':hover'),
    img:getComputedStyle(c.querySelector('img')).transform,
    ov:getComputedStyle(c.querySelector('.card__overlay')).opacity,
    btn:getComputedStyle(c.querySelector('.card__reveal')).transform
  });
}));
await p2.close();

/* --- 3. reduced motion .rv --- */
const p3 = await b.newPage({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
await p3.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p3.waitForTimeout(900);
console.log('\nREDUCED MOTION — .rv not at opacity 1:');
console.log(await p3.evaluate(()=>{
  const bad=[...document.querySelectorAll('.rv')].filter(e=>getComputedStyle(e).opacity!=='1')
    .map(e=>({t:e.tagName.toLowerCase()+'.'+(typeof e.className==='string'?e.className.split(' ').filter(Boolean).slice(0,2).join('.'):''),
              op:getComputedStyle(e).opacity, tr:getComputedStyle(e).transform, hasIn:e.classList.contains('in')}));
  return JSON.stringify({count:bad.length, sample:bad.slice(0,4), mq:matchMedia('(prefers-reduced-motion: reduce)').matches},null,1);
}));
await p3.close();
await b.close();
