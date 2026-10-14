/* Dark-mode cross-component computed style inventory: no DOM mutations or article saves. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#publishBtn').waitFor({state:'visible',timeout:35000});
 await page.waitForTimeout(1500);
 const audit=await page.evaluate(()=>{
  const sel=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,3).join('.'):''),rgb=str=>{const m=(str||'').match(/[\d.]+/g);return m&&m.length>=3?m.slice(0,3).map(Number):null},lum=v=>v.map(n=>n/255).map(n=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0),contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const visible=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>.05&&r.width>=8&&r.height>=7&&!e.closest('template,[hidden],[aria-hidden="true"]')};
  const effective=e=>{for(let a=e;a;a=a.parentElement){const st=getComputedStyle(a),col=rgb(st.backgroundColor);if(col && !/rgba\([^)]*,\s*0(?:\.0*)?\)/.test(st.backgroundColor)&&(!st.backgroundColor.startsWith('rgba(')||parseFloat((st.backgroundColor.match(/[\d.]+/g)||[])[3])>.9))return col;}return [23,25,29]};
  const white=[],text=[],border=[],targeted=[];
  for(const e of document.querySelectorAll('body *')){
   if(!visible(e))continue;
   const c=getComputedStyle(e),r=e.getBoundingClientRect(),bg=rgb(c.backgroundColor),tag=sel(e),anc=sel(e.parentElement||e);
   if(bg && Math.min(...bg)>=205&&r.width>=24&&r.height>=12&&!e.closest('iframe,svg'))white.push({element:tag,parent:anc,bg:c.backgroundColor,text:(e.innerText||'').trim().slice(0,45),xy:[Math.round(r.x),Math.round(r.y)]});
   const direct=[...e.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join(' ').trim();
   if(direct.length>=3&&r.width>=18&&!e.closest('svg')){const fg=rgb(c.color);if(fg){const back=effective(e),ratio=contrast(fg,back);if(ratio<4.5)text.push({element:tag,parent:anc,text:direct.slice(0,42),color:c.color,bg:back.join(','),ratio:+ratio.toFixed(2),chain:(()=>{let x=e;const a=[];for(let k=0;k<5&&x;k++,x=x.parentElement)a.push(sel(x));return a})()})}}
   if(r.width>60&&r.height>=12&&(!e.matches('input,textarea,select')&&!e.closest('[role="dialog"]'))){for(const side of ['Top','Bottom','Left','Right']){if(parseFloat(c['border'+side+'Width'])>=1){const v=rgb(c['border'+side+'Color']);if(v&&Math.min(...v)>130)border.push({element:tag,side,color:c['border'+side+'Color'],parent:anc});}}}
   if(e.matches('.alt-mini-toolbar,.classic-toolbar,.alt-content-card-head,.alt-content-card-foot,.alt-content-card-body,[role=tab],[data-tab],.context .tabs button,.alt-content-card [class*="icon"],[class*="add-icon"]'))targeted.push({element:tag,bg:c.backgroundColor,fg:c.color,border:c.borderBottomColor,text:(e.innerText||'').trim().slice(0,28),selected:e.getAttribute('aria-selected')||e.classList.contains('active')});
  }
  return {theme:document.documentElement.dataset.theme,count:document.querySelectorAll('body *').length,white:white.slice(0,80),text:text.sort((a,b)=>a.ratio-b.ratio).slice(0,110),border:border.slice(0,70),targeted:targeted.slice(0,100)};
 });
 for(const key of ['theme','count','white','text','border','targeted'])console.log('DARK_INVENTORY_'+key.toUpperCase(),JSON.stringify(audit[key]));
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
