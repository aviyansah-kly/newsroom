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

old='''<div class="settings-section"><div class="settings-section-head"><div><strong>Editorial Ownership</strong><span>Orang yang bertanggung jawab atas sumber dan finalisasi artikel.</span></div></div><div class="field people-field"><label>Reporter</label><input id="reporter" type="hidden" value="Arief Rahman H"><div class="people-picker" data-people-picker="reporter" data-target="reporter"><div class="people-selected" data-people-selected></div><div class="people-input-row"><span class="people-add-icon"><i data-lucide="user-plus"></i></span><input class="people-search" data-people-search type="text" autocomplete="off" placeholder="Tambah reporter…" aria-label="Tambah reporter"><span class="people-hint">Enter</span></div><div class="people-suggestions" data-people-suggestions hidden></div></div><div class="setting-help">Bisa menambahkan lebih dari satu reporter.</div></div><div class="field people-field"><label>Editor</label><input id="editorName" type="hidden" value="Bima Pratama"><div class="people-picker" data-people-picker="editor" data-target="editorName"><div class="people-selected" data-people-selected></div><div class="people-input-row"><span class="people-add-icon"><i data-lucide="user-plus"></i></span><input class="people-search" data-people-search type="text" autocomplete="off" placeholder="Tambah editor…" aria-label="Tambah editor"><span class="people-hint">Enter</span></div><div class="people-suggestions" data-people-suggestions hidden></div></div><div class="setting-help">Bisa menambahkan lebih dari satu editor.</div></div></div>'''

new='''<div class="settings-section newsroom-team-section"><div class="settings-section-head"><div><strong>Tim Editorial</strong><span>Penugasan utama terisi otomatis dari artikel dan pengguna yang sedang login.</span></div></div><input id="reporter" type="hidden" value="Arief Rahman H"><input id="editorName" type="hidden" value="Bima Pratama"><div class="team-assignment" data-team-role="reporter" data-target="reporter"><div class="team-role-head"><div><strong>Reporter</strong><span>Reporter utama mengikuti artikel yang dipilih.</span></div><span class="team-source-badge"><i data-lucide="file-check-2"></i>Dari artikel</span></div><div class="team-member-list" data-team-members></div><button class="team-add-trigger" type="button" data-team-add><i data-lucide="user-plus"></i><span>Tambah reporter</span></button><div class="team-add-panel" data-team-add-panel hidden><div class="team-search-wrap"><i data-lucide="search"></i><input data-team-search type="text" autocomplete="off" placeholder="Cari nama reporter…" aria-label="Cari reporter"><button type="button" data-team-cancel aria-label="Batal"><i data-lucide="x"></i></button></div><div class="team-suggestions" data-team-suggestions></div></div></div><div class="team-role-divider"></div><div class="team-assignment" data-team-role="editor" data-target="editorName"><div class="team-role-head"><div><strong>Editor</strong><span>Editor utama mengikuti akun yang sedang login.</span></div><span class="team-source-badge login"><i data-lucide="circle-user-round"></i>Anda</span></div><div class="team-member-list" data-team-members></div><button class="team-add-trigger" type="button" data-team-add><i data-lucide="user-plus"></i><span>Tambah editor</span></button><div class="team-add-panel" data-team-add-panel hidden><div class="team-search-wrap"><i data-lucide="search"></i><input data-team-search type="text" autocomplete="off" placeholder="Cari nama editor…" aria-label="Cari editor"><button type="button" data-team-cancel aria-label="Batal"><i data-lucide="x"></i></button></div><div class="team-suggestions" data-team-suggestions></div></div></div><div class="team-assignment-note"><i data-lucide="info"></i><span>Orang pertama adalah penugasan utama. Tambahkan kolaborator hanya jika artikel dikerjakan bersama.</span></div></div>'''

if old not in text:
    raise SystemExit('Could not find current Editorial Ownership block')
text=text.replace(old,new,1)

css=r'''/* NEWSROOM_MULTI_EDITORIAL_PEOPLE_START */
body.alt-editor-layout .newsroom-team-section{padding-bottom:14px!important}
body.alt-editor-layout .newsroom-team-section>.settings-section-head{margin-bottom:14px!important}
body.alt-editor-layout .team-assignment{position:relative}
body.alt-editor-layout .team-role-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:9px}
body.alt-editor-layout .team-role-head>div{min-width:0;display:flex;flex-direction:column;gap:2px}
body.alt-editor-layout .team-role-head strong{font-size:13px;line-height:18px;color:#0f172a}
body.alt-editor-layout .team-role-head span{font-size:11px;line-height:16px;color:#64748b}
body.alt-editor-layout .team-source-badge{height:24px;display:inline-flex;align-items:center;gap:5px;flex:none;padding:0 7px;border-radius:999px;background:#f1f5f9;color:#475569!important;font-size:10px!important;font-weight:600}
body.alt-editor-layout .team-source-badge.login{background:#eef2ff;color:#4f46e5!important}
body.alt-editor-layout .team-source-badge svg{width:12px;height:12px}
body.alt-editor-layout .team-member-list{display:flex;flex-wrap:wrap;gap:7px;min-height:34px;margin-bottom:8px}
body.alt-editor-layout .team-member{min-width:0;max-width:100%;height:34px;display:inline-flex;align-items:center;gap:7px;padding:0 9px 0 5px;border:1px solid #dbe3ee;border-radius:999px;background:#fff;color:#0f172a}
body.alt-editor-layout .team-member.primary{background:#f8fafc;border-color:#cbd5e1}
body.alt-editor-layout .team-member-avatar{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:none;background:#e2e8f0;color:#475569;font-size:10px;font-weight:700}
body.alt-editor-layout [data-team-role="editor"] .team-member-avatar{background:#eef2ff;color:#4f46e5}
body.alt-editor-layout .team-member-name{min-width:0;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}
body.alt-editor-layout .team-primary-badge{font-size:9px;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:1px 5px;line-height:14px}
body.alt-editor-layout .team-remove{width:20px;height:20px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#94a3b8;padding:0}
body.alt-editor-layout .team-remove:hover{background:#e2e8f0;color:#334155}
body.alt-editor-layout .team-remove svg{width:13px;height:13px}
body.alt-editor-layout .team-add-trigger{min-height:32px;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:7px;background:transparent;color:#2563eb;padding:0 4px;font-size:12px;font-weight:600}
body.alt-editor-layout .team-add-trigger:hover{background:#eff6ff}
body.alt-editor-layout .team-add-trigger svg{width:14px;height:14px}
body.alt-editor-layout .team-add-panel{position:relative;margin-top:7px;padding:8px;border:1px solid #bfdbfe;border-radius:9px;background:#f8fbff;box-shadow:0 0 0 3px rgba(37,99,235,.08)}
body.alt-editor-layout .team-search-wrap{height:36px;display:flex;align-items:center;gap:7px;padding:0 8px;border:1px solid #93c5fd;border-radius:7px;background:#fff}
body.alt-editor-layout .team-search-wrap>svg{width:14px;height:14px;color:#64748b;flex:none}
body.alt-editor-layout .team-search-wrap input{height:34px!important;min-width:0!important;flex:1!important;border:0!important;outline:0!important;box-shadow:none!important;padding:0!important;background:transparent!important;font-size:12px!important}
body.alt-editor-layout .team-search-wrap button{width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:#94a3b8;padding:0}
body.alt-editor-layout .team-search-wrap button:hover{background:#f1f5f9;color:#475569}
body.alt-editor-layout .team-search-wrap button svg{width:13px;height:13px}
body.alt-editor-layout .team-suggestions{display:flex;flex-direction:column;gap:3px;margin-top:6px}
body.alt-editor-layout .team-suggestion{width:100%;min-height:36px;display:flex;align-items:center;gap:8px;border:0;border-radius:7px;background:transparent;padding:5px 6px;text-align:left;color:#0f172a}
body.alt-editor-layout .team-suggestion:hover{background:#fff}
body.alt-editor-layout .team-suggestion-avatar{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:none;background:#e2e8f0;color:#475569;font-size:9px;font-weight:700}
body.alt-editor-layout .team-suggestion strong{font-size:12px;line-height:16px}
body.alt-editor-layout .team-suggestion span{font-size:10px;line-height:14px;color:#64748b}
body.alt-editor-layout .team-role-divider{height:1px;background:#e2e8f0;margin:14px 0}
body.alt-editor-layout .team-assignment-note{display:flex;align-items:flex-start;gap:7px;margin-top:14px;padding:8px 9px;border-radius:8px;background:#f8fafc;color:#64748b;font-size:10px;line-height:15px}
body.alt-editor-layout .team-assignment-note svg{width:13px;height:13px;flex:none;margin-top:1px}
@media(max-width:520px){body.alt-editor-layout .team-role-head{align-items:flex-start;flex-direction:column}body.alt-editor-layout .team-source-badge{align-self:flex-start}}
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
  document.querySelectorAll('[data-team-role]').forEach(group=>{
    const hidden=document.getElementById(group.dataset.target);
    const list=group.querySelector('[data-team-members]');
    const addBtn=group.querySelector('[data-team-add]');
    const panel=group.querySelector('[data-team-add-panel]');
    const input=group.querySelector('[data-team-search]');
    const cancel=group.querySelector('[data-team-cancel]');
    const suggestions=group.querySelector('[data-team-suggestions]');
    const role=group.dataset.teamRole==='editor'?'Editor':'Reporter';
    let selected=String(hidden?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
    const sync=()=>{if(hidden){hidden.value=selected.join(', ');hidden.dispatchEvent(new Event('change',{bubbles:true}))}};
    const render=()=>{
      list.innerHTML=selected.map((name,i)=>'<span class="team-member '+(i===0?'primary':'')+'"><span class="team-member-avatar">'+escHtml(initials(name))+'</span><span class="team-member-name">'+escHtml(name)+'</span>'+(i===0?'<span class="team-primary-badge">Utama</span>':'<button class="team-remove" type="button" data-remove-team="'+i+'" aria-label="Hapus '+escHtml(name)+'"><i data-lucide="x"></i></button>')+'</span>').join('');
      list.querySelectorAll('[data-remove-team]').forEach(btn=>btn.onclick=()=>{selected.splice(+btn.dataset.removeTeam,1);sync();render()});
      if(window.lucide)lucide.createIcons();
    };
    const showSuggestions=()=>{
      const q=input.value.trim().toLowerCase();
      const items=directory.filter(p=>p.role===role&&!selected.some(x=>x.toLowerCase()===p.name.toLowerCase())&&(!q||p.name.toLowerCase().includes(q))).slice(0,4);
      suggestions.innerHTML=items.map(p=>'<button type="button" class="team-suggestion" data-team-person="'+escHtml(p.name)+'"><span class="team-suggestion-avatar">'+escHtml(initials(p.name))+'</span><span><strong>'+escHtml(p.name)+'</strong><br><span>'+escHtml(p.role)+'</span></span></button>').join('');
      suggestions.querySelectorAll('[data-team-person]').forEach(btn=>btn.onclick=()=>{selected.push(btn.dataset.teamPerson);sync();render();panel.hidden=true;input.value=''});
    };
    addBtn.onclick=()=>{panel.hidden=false;input.value='';showSuggestions();setTimeout(()=>input.focus(),0)};
    cancel.onclick=()=>{panel.hidden=true;input.value=''};
    input.addEventListener('input',showSuggestions);
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;input.value=''};if(e.key==='Enter'&&input.value.trim()){e.preventDefault();const exact=directory.find(p=>p.role===role&&p.name.toLowerCase()===input.value.trim().toLowerCase());if(exact&&!selected.some(x=>x.toLowerCase()===exact.name.toLowerCase())){selected.push(exact.name);sync();render();panel.hidden=true;input.value=''}}});
    render();
  });
})();
// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_END'''
body_idx=text.rfind('</body>')
if body_idx==-1: raise SystemExit('No </body>')
text=text[:body_idx]+'\n<script>\n'+js+'\n</script>\n'+text[body_idx:]

path.write_text(text,encoding='utf-8')
print('Editorial team assignment UX applied')
