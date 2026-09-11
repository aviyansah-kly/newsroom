from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

css_start='/* NEWSROOM_MULTI_EDITORIAL_PEOPLE_START */'
css_end='/* NEWSROOM_MULTI_EDITORIAL_PEOPLE_END */'
js_start='// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_START'
js_end='// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_END'

text = re.sub(re.escape(css_start)+r'.*?'+re.escape(css_end)+r'\n?', '', text, flags=re.S)
text = re.sub(re.escape(js_start)+r'.*?'+re.escape(js_end)+r'\n?', '', text, flags=re.S)

old_reporter='<div class="field"><label>Reporter</label><div class="profile"><span class="avatar">AR</span><input id="reporter" value="Arief Rahman H" placeholder="Nama reporter…"></div></div>'
old_editor='<div class="field"><label>Editor</label><div class="profile"><span class="avatar editor">BP</span><input id="editorName" value="Bima Pratama" placeholder="Nama editor…"></div></div>'

new_reporter='''<div class="field people-field"><label>Reporter</label><input id="reporter" type="hidden" value="Arief Rahman H"><div class="people-picker" data-people-picker="reporter" data-target="reporter"><div class="people-selected" data-people-selected></div><div class="people-input-row"><span class="people-add-icon"><i data-lucide="user-plus"></i></span><input class="people-search" data-people-search type="text" autocomplete="off" placeholder="Tambah reporter…" aria-label="Tambah reporter"><span class="people-hint">Enter</span></div><div class="people-suggestions" data-people-suggestions hidden></div></div><div class="setting-help">Bisa menambahkan lebih dari satu reporter.</div></div>'''
new_editor='''<div class="field people-field"><label>Editor</label><input id="editorName" type="hidden" value="Bima Pratama"><div class="people-picker" data-people-picker="editor" data-target="editorName"><div class="people-selected" data-people-selected></div><div class="people-input-row"><span class="people-add-icon"><i data-lucide="user-plus"></i></span><input class="people-search" data-people-search type="text" autocomplete="off" placeholder="Tambah editor…" aria-label="Tambah editor"><span class="people-hint">Enter</span></div><div class="people-suggestions" data-people-suggestions hidden></div></div><div class="setting-help">Bisa menambahkan lebih dari satu editor.</div></div>'''

if old_reporter not in text or old_editor not in text:
    raise SystemExit('Could not find original reporter/editor fields')
text=text.replace(old_reporter,new_reporter,1).replace(old_editor,new_editor,1)

css=r'''/* NEWSROOM_MULTI_EDITORIAL_PEOPLE_START */
body.alt-editor-layout .people-field{gap:7px!important}
body.alt-editor-layout .people-picker{position:relative;border:1px solid #cbd5e1;border-radius:10px;background:#fff;padding:8px;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}
body.alt-editor-layout .people-picker:hover{border-color:#94a3b8}
body.alt-editor-layout .people-picker:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12);background:#fff}
body.alt-editor-layout .people-selected{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
body.alt-editor-layout .people-selected:empty{display:none;margin:0}
body.alt-editor-layout .people-chip{min-width:0;max-width:100%;height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 8px 0 5px;border:1px solid #dbe3ee;border-radius:999px;background:#f8fafc;color:#0f172a;font-size:13px;font-weight:600}
body.alt-editor-layout .people-chip-avatar{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;background:#e2e8f0;color:#475569;font-size:10px;font-weight:700}
body.alt-editor-layout [data-people-picker="editor"] .people-chip-avatar{background:#eef2ff;color:#4f46e5}
body.alt-editor-layout .people-chip-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
body.alt-editor-layout .people-chip-remove{width:20px;height:20px;display:grid;place-items:center;flex:none;border:0;border-radius:50%;background:transparent;color:#94a3b8;padding:0}
body.alt-editor-layout .people-chip-remove:hover{background:#e2e8f0;color:#334155}
body.alt-editor-layout .people-chip-remove svg{width:13px;height:13px}
body.alt-editor-layout .people-input-row{min-height:34px;display:flex;align-items:center;gap:7px}
body.alt-editor-layout .people-add-icon{width:24px;height:24px;display:grid;place-items:center;flex:none;color:#64748b}
body.alt-editor-layout .people-add-icon svg{width:15px;height:15px}
body.alt-editor-layout .people-search{min-width:80px!important;height:32px!important;flex:1 1 120px!important;border:0!important;outline:0!important;box-shadow:none!important;padding:0!important;background:transparent!important;font-size:13px!important}
body.alt-editor-layout .people-hint{flex:none;padding:2px 6px;border:1px solid #e2e8f0;border-radius:5px;background:#f8fafc;color:#94a3b8;font-size:10px;line-height:16px}
body.alt-editor-layout .people-picker:focus-within .people-hint{color:#64748b;border-color:#cbd5e1}
body.alt-editor-layout .people-suggestions{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:45;padding:6px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;box-shadow:0 14px 34px rgba(15,23,42,.14)}
body.alt-editor-layout .people-suggestion{width:100%;min-height:40px;display:flex;align-items:center;gap:9px;border:0;border-radius:7px;background:#fff;padding:6px 8px;text-align:left;color:#0f172a}
body.alt-editor-layout .people-suggestion:hover,.people-suggestion.active{background:#f1f5f9}
body.alt-editor-layout .people-suggestion-avatar{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:none;background:#e2e8f0;color:#475569;font-size:10px;font-weight:700}
body.alt-editor-layout .people-suggestion-copy{min-width:0;display:flex;flex-direction:column}
body.alt-editor-layout .people-suggestion-copy strong{font-size:13px;line-height:17px}
body.alt-editor-layout .people-suggestion-copy span{font-size:11px;line-height:15px;color:#64748b}
body.alt-editor-layout .people-field>.setting-help{margin-top:1px}
@media(max-width:520px){body.alt-editor-layout .people-hint{display:none}}
/* NEWSROOM_MULTI_EDITORIAL_PEOPLE_END */'''

idx=text.rfind('</style>')
if idx==-1: raise SystemExit('No </style>')
text=text[:idx]+css+'\n'+text[idx:]

js=r'''// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_START
(function(){
  const directory=[
    {name:'Arief Rahman H',role:'Reporter'},
    {name:'Nadia Putri',role:'Reporter'},
    {name:'Rizky Maulana',role:'Reporter'},
    {name:'Bima Pratama',role:'Editor'},
    {name:'Dewi Larassati',role:'Editor'},
    {name:'Hasmi Anwar',role:'Editor'}
  ];
  const initials=name=>String(name).trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const escHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelectorAll('[data-people-picker]').forEach(picker=>{
    const hidden=document.getElementById(picker.dataset.target);
    const selectedEl=picker.querySelector('[data-people-selected]');
    const input=picker.querySelector('[data-people-search]');
    const suggestions=picker.querySelector('[data-people-suggestions]');
    let selected=String(hidden?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
    const role=picker.dataset.peoplePicker==='editor'?'Editor':'Reporter';
    const sync=()=>{ if(hidden){hidden.value=selected.join(', '); hidden.dispatchEvent(new Event('change',{bubbles:true}))} };
    const render=()=>{
      selectedEl.innerHTML=selected.map((name,i)=>'<span class="people-chip"><span class="people-chip-avatar">'+escHtml(initials(name))+'</span><span class="people-chip-name">'+escHtml(name)+'</span><button class="people-chip-remove" type="button" data-remove-person="'+i+'" aria-label="Hapus '+escHtml(name)+'"><i data-lucide="x"></i></button></span>').join('');
      selectedEl.querySelectorAll('[data-remove-person]').forEach(btn=>btn.onclick=()=>{selected.splice(+btn.dataset.removePerson,1);sync();render();input.focus()});
      if(window.lucide)lucide.createIcons();
    };
    const add=name=>{
      name=String(name||'').trim().replace(/,$/,'');
      if(!name||selected.some(x=>x.toLowerCase()===name.toLowerCase()))return;
      selected.push(name);input.value='';suggestions.hidden=true;sync();render();
    };
    const showSuggestions=()=>{
      const q=input.value.trim().toLowerCase();
      const items=directory.filter(p=>p.role===role&&!selected.some(x=>x.toLowerCase()===p.name.toLowerCase())&&(!q||p.name.toLowerCase().includes(q))).slice(0,5);
      suggestions.innerHTML=items.map(p=>'<button type="button" class="people-suggestion" data-person="'+escHtml(p.name)+'"><span class="people-suggestion-avatar">'+escHtml(initials(p.name))+'</span><span class="people-suggestion-copy"><strong>'+escHtml(p.name)+'</strong><span>'+escHtml(p.role)+'</span></span></button>').join('');
      suggestions.hidden=!items.length;
      suggestions.querySelectorAll('[data-person]').forEach(btn=>btn.onclick=()=>add(btn.dataset.person));
    };
    input.addEventListener('focus',showSuggestions);
    input.addEventListener('input',showSuggestions);
    input.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===',')&&input.value.trim()){e.preventDefault();add(input.value)}
      if(e.key==='Backspace'&&!input.value&&selected.length){selected.pop();sync();render()}
      if(e.key==='Escape')suggestions.hidden=true;
    });
    picker.addEventListener('click',e=>{if(!e.target.closest('button'))input.focus()});
    document.addEventListener('click',e=>{if(!picker.contains(e.target))suggestions.hidden=true});
    render();
  });
})();
// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_END'''

body_idx=text.rfind('</body>')
if body_idx==-1: raise SystemExit('No </body>')
text=text[:body_idx]+'\n<script>\n'+js+'\n</script>\n'+text[body_idx:]

path.write_text(text,encoding='utf-8')
print('Multi-person editorial people picker applied')
