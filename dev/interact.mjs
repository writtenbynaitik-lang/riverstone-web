import { chromium } from 'playwright';
import fs from 'fs';
const S = process.argv[2]; fs.mkdirSync(S,{recursive:true});
const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--force-color-profile=srgb','--font-render-hinting=none','--hide-scrollbars'] });

/* ---------- responsive sweep ---------- */
for (const w of [320,390,768,1024,1440]) {
  const p = await b.newPage({ viewport:{width:w,height:900} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{ await document.fonts.ready; });
  await p.evaluate(async()=>{ const m=document.documentElement.scrollHeight;
    for(let y=0;y<=m;y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,80)); } window.scrollTo(0,0); });
  await p.waitForTimeout(700);
  const r = await p.evaluate(()=>{
    const de=document.documentElement; const off=[];
    document.querySelectorAll('body *').forEach(el=>{ const b=el.getBoundingClientRect();
      if(b.width>0&&(b.right>de.clientWidth+1.5||b.left<-1.5)){
        const t=el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.split(' ').filter(Boolean)[0]:'');
        if(!off.includes(t)) off.push(t); } });
    const small=[]; document.querySelectorAll('a,button').forEach(el=>{ const b=el.getBoundingClientRect();
      if(b.width&&b.height&&b.height<26&&el.offsetParent!==null){ const t=el.className||el.tagName; if(!small.includes(t)) small.push(t);} });
    return { over:de.scrollWidth-de.clientWidth, page:de.scrollHeight, off:off.slice(0,4), small:small.slice(0,3),
             burgerVisible:getComputedStyle(document.getElementById('burger')).display!=='none' };
  });
  console.log(`w=${String(w).padStart(4)} overflow=${r.over} page=${r.page} burger=${r.burgerVisible} small=${JSON.stringify(r.small)} off=${JSON.stringify(r.off)} jsErr=${errs.length}`);
  if(w===390||w===1440) await p.screenshot({path:`${S}/r${w}.jpg`,type:'jpeg',quality:84});
  await p.close();
}

/* ---------- interactions ---------- */
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.evaluate(async()=>{ await document.fonts.ready; });

// card hover: image scale + overlay opacity + button translate
await p.evaluate(()=>document.getElementById('kitchen').scrollIntoView());
await p.waitForTimeout(900);
const card = p.locator('#kitchen .card').first();
const before = await card.evaluate(el=>({
  img:getComputedStyle(el.querySelector('img')).transform,
  ov:getComputedStyle(el.querySelector('.card__overlay')).opacity,
  btn:getComputedStyle(el.querySelector('.card__reveal')).transform }));
await card.hover(); await p.waitForTimeout(1500);
const after = await card.evaluate(el=>({
  img:getComputedStyle(el.querySelector('img')).transform,
  ov:getComputedStyle(el.querySelector('.card__overlay')).opacity,
  btn:getComputedStyle(el.querySelector('.card__reveal')).transform }));
console.log('\ncard hover  before:',JSON.stringify(before));
console.log('card hover   after:',JSON.stringify(after));
await p.screenshot({path:`${S}/hover.jpg`,type:'jpeg',quality:86});

// nav active state
await p.evaluate(()=>document.getElementById('bar').scrollIntoView());
await p.waitForTimeout(700);
console.log('active nav link :', await p.evaluate(()=>{const a=document.querySelector('.navpill a.is-active');return a?a.textContent:'(none)';}));

// back to top visible
console.log('back-to-top shown:', await p.evaluate(()=>document.getElementById('totop').classList.contains('show')));

// newsletter validation then success
await p.evaluate(()=>document.querySelector('.footer').scrollIntoView());
await p.waitForTimeout(600);
await p.fill('#email','not-an-email');
await p.click('#newsletter button[type=submit]'); await p.waitForTimeout(250);
console.log('form invalid msg:', await p.textContent('#f-msg'));
await p.fill('#email','guest@example.com');
await p.click('#newsletter button[type=submit]'); await p.waitForTimeout(250);
console.log('form valid   msg:', await p.textContent('#f-msg'), '| input cleared:', await p.inputValue('#email')==='');
await p.close();

/* ---------- mobile nav ---------- */
const m = await b.newPage({ viewport:{width:390,height:844} });
await m.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await m.waitForTimeout(500);
await m.click('#burger'); await m.waitForTimeout(900);
console.log('\nmobile nav open :', await m.evaluate(()=>document.body.classList.contains('nav-open')),
            '| aria-expanded:', await m.getAttribute('#burger','aria-expanded'),
            '| visible:', await m.evaluate(()=>getComputedStyle(document.getElementById('mobilenav')).visibility));
await m.screenshot({path:`${S}/mobilenav.jpg`,type:'jpeg',quality:84});
await m.keyboard.press('Escape'); await m.waitForTimeout(800);
console.log('after Escape    :', await m.evaluate(()=>document.body.classList.contains('nav-open')));
await m.click('#burger'); await m.waitForTimeout(700);
await m.click('#mobilenav a[href="#bar"]'); await m.waitForTimeout(900);
console.log('closes on link  :', await m.evaluate(()=>document.body.classList.contains('nav-open')),
            '| scrolled:', await m.evaluate(()=>window.scrollY>300));
await m.close();

/* ---------- reduced motion ---------- */
const rm = await b.newPage({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
await rm.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await rm.waitForTimeout(800);
console.log('\nreduced-motion: all .rv visible:', await rm.evaluate(()=>
  [...document.querySelectorAll('.rv')].every(e=>getComputedStyle(e).opacity==='1')),
  '| hero letters visible:', await rm.evaluate(()=>
  [...document.querySelectorAll('.hero__word span')].every(e=>getComputedStyle(e).opacity==='1')));
await rm.close();
await b.close();
