from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Normalize visible labels in the Validation pane.
text = text.replace('>Checks <span class="guardian-count" id="guardianTabCount">0</span>', '>Validasi <span class="guardian-count" id="guardianTabCount">0</span>')
text = text.replace('Live spelling aktif saat Anda mengetik.', 'Pemeriksaan ejaan aktif saat mengetik.')

# Replace renderGuardian with a clearer information hierarchy.
pattern = r'function renderGuardian\(\)\{.*?\}\nlet heavyRenderTimer=null;'
replacement = r'''function renderGuardian(){
  const issues=[],plain=[title.value,dek.value,editor.getText()].join(' ');
  const typos=[];
  activeTypoRules().forEach(([bad,good])=>{
    const re=new RegExp('\\b'+bad+'\\b','gi'),m=plain.match(re);
    if(m)typos.push({bad,good,count:m.length});
  });
  if(typos.length)issues.push({level:'danger',category:'Ejaan',icon:'spell-check-2',title:typos.reduce((n,x)=>n+x.count,0)+' kemungkinan typo',desc:typos.slice(0,3).map(x=>x.bad+' → '+x.good).join(' · '),needle:typos[0].bad});
  if(title.value.trim().length>90)issues.push({level:'warn',category:'Headline',icon:'heading-1',title:'Headline cukup panjang',desc:title.value.trim().length+' karakter. Pertimbangkan headline yang lebih ringkas.'});
  if(dek.value.trim().length<70)issues.push({level:'warn',category:'Ringkasan',icon:'align-left',title:'Dek terlalu singkat',desc:'Tambahkan konteks utama agar pembaca memahami inti artikel.'});
  const html=editor.getHTML(),doc=new DOMParser().parseFromString(html,'text/html');
  const quotes=[...doc.querySelectorAll('blockquote')];
  if(quotes.length&&!quotes.some(q=>q.nextElementSibling?.querySelector('em')))issues.push({level:'warn',category:'Atribusi',icon:'quote',title:'Kutipan perlu atribusi',desc:'Pastikan kutipan mempunyai nama narasumber atau sumber yang jelas.',needle:quotes[0]?.textContent?.slice(0,28)});
  const imgs=[...doc.querySelectorAll('img')],missing=imgs.filter(i=>!i.alt&&!i.title).length;
  if(missing)issues.push({level:'warn',category:'Media',icon:'image',title:missing+' gambar belum punya caption/alt',desc:'Lengkapi caption dan atribusi media sebelum publish.'});
  if(/(?:Rp|US\\$|%|\\b\\d{2,}[.,]?\\d*\\b)/.test(plain))issues.push({level:'warn',category:'Data',icon:'binary',title:'Angka/data perlu verifikasi',desc:'Cocokkan angka, nominal, persen, skor, atau statistik dengan sumber primer.',needle:/62%/.test(plain)?'62%':null});
  if(currentScenario==='sports'){
    const scores=[...plain.matchAll(/\\b\\d{1,2}-\\d{1,2}\\b/g)].map(m=>m[0]),uniq=[...new Set(scores)];
    if(uniq.length>1)issues.push({level:'danger',category:'Konsistensi',icon:'badge-alert',title:'Skor pertandingan tidak konsisten',desc:'Ditemukan lebih dari satu skor: '+uniq.join(' dan ')+'. Pastikan skor final dan konteks setiap penyebutan benar.',needle:uniq.find(x=>x!=='2-1')||uniq[0]});
    if(/Marselino Ferdinan\\b/i.test(plain)&&/Marselino Ferdinand\\b/i.test(plain))issues.push({level:'warn',category:'Nama / entitas',icon:'user-round-search',title:'Nama pemain perlu dicek',desc:'Ditemukan variasi “Marselino Ferdinan” dan “Marselino Ferdinand”.',needle:'Marselino Ferdinand'});
    if(/Data statistik ini masih perlu/i.test(plain))issues.push({level:'warn',category:'Statistik',icon:'chart-no-axes-column',title:'Statistik belum terverifikasi',desc:'Statistik pertandingan perlu dihubungkan ke sumber data resmi sebelum publish.',needle:'Data statistik ini masih perlu'});
  }
  if(sourceInfo&&/Agent|Claude|Chat|AI/i.test(sourceInfo.source||''))issues.push({level:'warn',category:'AI',icon:'bot',title:'Konten dibantu AI',desc:'Periksa fakta, atribusi, kutipan, dan konteks sebelum diterbitkan.'});
  if((editor.getJSON().content||[]).length<10)issues.push({level:'warn',category:'Struktur',icon:'files',title:'Struktur artikel masih pendek',desc:'Artikel memiliki kurang dari 10 bagian utama. Pastikan struktur sudah cukup untuk kebutuhan editorial.'});

  const sorted=[...issues].sort((a,b)=>(a.level==='danger'?0:1)-(b.level==='danger'?0:1));
  const high=sorted.filter(x=>x.level==='danger').length;
  const review=sorted.length-high;
  $('#guardianTabCount').textContent=sorted.length;

  const summary=$('.guardian-summary');
  if(summary){
    summary.className='guardian-summary '+(high?'has-danger':sorted.length?'has-warning':'is-clear');
    summary.innerHTML=sorted.length
      ? '<div class="guardian-summary-main"><span class="guardian-summary-icon"><i data-lucide="shield-alert"></i></span><div class="guardian-summary-copy"><strong>'+sorted.length+' temuan perlu ditinjau</strong><span>Periksa prioritas sebelum artikel diterbitkan.</span></div></div><div class="guardian-summary-stats">'+(high?'<span class="guardian-stat danger">'+high+' prioritas tinggi</span>':'')+(review?'<span class="guardian-stat warn">'+review+' perlu dicek</span>':'')+'</div>'
      : '<div class="guardian-summary-main"><span class="guardian-summary-icon"><i data-lucide="shield-check"></i></span><div class="guardian-summary-copy"><strong>Tidak ada temuan utama</strong><span>Tetap lakukan review editorial sebelum publish.</span></div></div>';
  }

  $('#guardianList').innerHTML=sorted.length?sorted.map((x,i)=>{
    const severity=x.level==='danger'?'Prioritas tinggi':'Perlu dicek';
    return '<article class="guardian-item '+x.level+'">'
      +'<div class="guardian-icon"><i data-lucide="'+x.icon+'"></i></div>'
      +'<div class="guardian-item-content">'
      +'<div class="guardian-item-meta"><span class="guardian-category">'+esc(x.category||'Editorial')+'</span><span class="guardian-severity '+x.level+'">'+severity+'</span></div>'
      +'<strong>'+esc(x.title)+'</strong>'
      +'<p>'+esc(x.desc)+'</p>'
      +(x.needle?'<button class="guardian-action" data-guardian-locate="'+i+'"><span>Tinjau di artikel</span><i data-lucide="arrow-right"></i></button>':'')
      +'</div></article>';
  }).join(''):'<div class="guardian-empty"><i data-lucide="circle-check-big"></i><div><strong>Artikel lolos pemeriksaan utama</strong><span>Tetap lakukan review editorial sebelum diterbitkan.</span></div></div>';

  $$('[data-guardian-locate]').forEach(b=>b.onclick=()=>focusChecksText(sorted[+b.dataset.guardianLocate].needle));
  lucide.createIcons();
}
let heavyRenderTimer=null;'''

text, count = re.subn(pattern, replacement, text, flags=re.S)
if count != 1:
    raise SystemExit(f'Expected to replace renderGuardian once, got {count}')

start = '/* NEWSROOM_VALIDATION_INFO_HIERARCHY_START */'
end = '/* NEWSROOM_VALIDATION_INFO_HIERARCHY_END */'
if start in text and end in text:
    text = re.sub(re.escape(start)+r'.*?'+re.escape(end)+r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_VALIDATION_INFO_HIERARCHY_START */
body.alt-editor-layout #guardianPane>.spell-status{
  min-height:42px!important;
  padding:11px 20px!important;
  gap:8px!important;
  color:#64748b!important;
  font-size:13px!important;
  background:#fff!important;
}
body.alt-editor-layout #guardianPane>.spell-status svg{
  width:14px!important;
  height:14px!important;
  color:#64748b!important;
}

body.alt-editor-layout #guardianPane>.guardian-summary{
  display:block!important;
  padding:14px 20px!important;
  background:#f8fafc!important;
  border:0!important;
  border-radius:0!important;
}
body.alt-editor-layout .guardian-summary-main{
  display:flex!important;
  align-items:flex-start!important;
  gap:10px!important;
}
body.alt-editor-layout .guardian-summary-icon{
  width:34px!important;
  height:34px!important;
  border-radius:9px!important;
  display:grid!important;
  place-items:center!important;
  flex:none!important;
  background:#fff7ed!important;
  color:#c2410c!important;
}
body.alt-editor-layout .guardian-summary.has-danger .guardian-summary-icon{
  background:#fef2f2!important;
  color:#dc2626!important;
}
body.alt-editor-layout .guardian-summary.is-clear .guardian-summary-icon{
  background:#ecfdf3!important;
  color:#15803d!important;
}
body.alt-editor-layout .guardian-summary-icon svg{
  width:17px!important;
  height:17px!important;
}
body.alt-editor-layout .guardian-summary-copy{
  min-width:0!important;
}
body.alt-editor-layout .guardian-summary-copy strong{
  display:block!important;
  font-size:14px!important;
  line-height:19px!important;
  color:#0f172a!important;
}
body.alt-editor-layout .guardian-summary-copy span{
  display:block!important;
  margin-top:2px!important;
  font-size:12px!important;
  line-height:17px!important;
  color:#64748b!important;
}
body.alt-editor-layout .guardian-summary-stats{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:6px!important;
  margin-top:10px!important;
  padding-left:44px!important;
}
body.alt-editor-layout .guardian-stat{
  min-height:24px!important;
  display:inline-flex!important;
  align-items:center!important;
  padding:2px 8px!important;
  border-radius:999px!important;
  font-size:11px!important;
  line-height:16px!important;
  font-weight:650!important;
}
body.alt-editor-layout .guardian-stat.danger{
  background:#fef2f2!important;
  color:#b91c1c!important;
}
body.alt-editor-layout .guardian-stat.warn{
  background:#fff7ed!important;
  color:#c2410c!important;
}

body.alt-editor-layout #guardianPane>.guardian-list{
  display:flex!important;
  flex-direction:column!important;
  gap:10px!important;
  padding:14px 20px 18px!important;
  background:#fff!important;
}
body.alt-editor-layout #guardianPane>.guardian-list>*+*{
  border-top:0!important;
}
body.alt-editor-layout #guardianPane .guardian-item{
  display:grid!important;
  grid-template-columns:32px minmax(0,1fr)!important;
  gap:10px!important;
  margin:0!important;
  padding:12px!important;
  border:1px solid #e2e8f0!important;
  border-radius:10px!important;
  background:#fff!important;
  box-shadow:0 1px 2px rgba(15,23,42,.03)!important;
}
body.alt-editor-layout #guardianPane .guardian-item.danger{
  border-color:#fecaca!important;
  background:#fffdfd!important;
}
body.alt-editor-layout #guardianPane .guardian-icon{
  width:32px!important;
  height:32px!important;
  border-radius:8px!important;
}
body.alt-editor-layout #guardianPane .guardian-item-content{
  min-width:0!important;
}
body.alt-editor-layout #guardianPane .guardian-item-meta{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:8px!important;
  margin-bottom:5px!important;
}
body.alt-editor-layout #guardianPane .guardian-category{
  min-width:0!important;
  font-size:11px!important;
  line-height:15px!important;
  font-weight:700!important;
  letter-spacing:.04em!important;
  text-transform:uppercase!important;
  color:#64748b!important;
}
body.alt-editor-layout #guardianPane .guardian-severity{
  flex:none!important;
  padding:2px 6px!important;
  border-radius:999px!important;
  font-size:10px!important;
  line-height:14px!important;
  font-weight:700!important;
}
body.alt-editor-layout #guardianPane .guardian-severity.danger{
  background:#fef2f2!important;
  color:#b91c1c!important;
}
body.alt-editor-layout #guardianPane .guardian-severity.warn{
  background:#fff7ed!important;
  color:#c2410c!important;
}
body.alt-editor-layout #guardianPane .guardian-item strong{
  display:block!important;
  font-size:13px!important;
  line-height:18px!important;
  color:#172033!important;
}
body.alt-editor-layout #guardianPane .guardian-item p{
  margin:3px 0 0!important;
  font-size:12px!important;
  line-height:17px!important;
  color:#64748b!important;
}
body.alt-editor-layout #guardianPane .guardian-action{
  min-height:28px!important;
  margin-top:8px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:#2563eb!important;
  display:inline-flex!important;
  align-items:center!important;
  gap:4px!important;
  font-size:12px!important;
  line-height:16px!important;
  font-weight:600!important;
}
body.alt-editor-layout #guardianPane .guardian-action:hover{
  color:#1d4ed8!important;
  text-decoration:underline!important;
  text-underline-offset:2px!important;
}
body.alt-editor-layout #guardianPane .guardian-action svg{
  width:13px!important;
  height:13px!important;
}
body.alt-editor-layout #guardianPane .guardian-empty{
  display:flex!important;
  align-items:flex-start!important;
  gap:10px!important;
  padding:14px!important;
  border:1px solid #bbf7d0!important;
  border-radius:10px!important;
  background:#f0fdf4!important;
}
body.alt-editor-layout #guardianPane .guardian-empty svg{
  width:18px!important;
  height:18px!important;
  color:#15803d!important;
  flex:none!important;
  margin-top:1px!important;
}
body.alt-editor-layout #guardianPane .guardian-empty strong{
  display:block!important;
  font-size:13px!important;
  color:#166534!important;
}
body.alt-editor-layout #guardianPane .guardian-empty span{
  display:block!important;
  margin-top:2px!important;
  font-size:12px!important;
  line-height:17px!important;
  color:#4d7c5a!important;
}

@media(max-width:420px){
  body.alt-editor-layout .guardian-summary-stats{
    padding-left:0!important;
  }
  body.alt-editor-layout #guardianPane .guardian-item-meta{
    align-items:flex-start!important;
    flex-direction:column!important;
    gap:4px!important;
  }
}
/* NEWSROOM_VALIDATION_INFO_HIERARCHY_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

path.write_text(text, encoding='utf-8')
print('Validation information hierarchy applied.')
