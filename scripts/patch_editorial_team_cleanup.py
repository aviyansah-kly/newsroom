from pathlib import Path
import re

path=Path('index.html')
text=path.read_text(encoding='utf-8')

start='/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_START */'
end='/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_END */'
js_start='// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_START'
js_end='// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_END'
text=re.sub(re.escape(start)+r'.*?'+re.escape(end)+r'\n?','',text,flags=re.S)
text=re.sub(re.escape(js_start)+r'.*?'+re.escape(js_end)+r'\n?','',text,flags=re.S)

# Stop legacy V50 from turning the hidden reporter/editor values into duplicate visible fields.
text=text.replace("    enhanceEntity($('#reporter'),'reporter','Reporter');\n    enhanceEntity($('#editorName'),'editorial','Editorial');\n    enhanceEntity($('#altFigureInput'),'figure','Tokoh / Figure');",
                  "    enhanceEntity($('#altFigureInput'),'figure','Tokoh / Figure');")

people_start='// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_START'
people_end='// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_END'
people_js=r'''// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_START
(function(){
  const directory=[
    {name:'Arief Rahman H',role:'Reporter'},
    {name:'Nadia Putri',role:'Reporter'},
    {name:'Rizky Maulana',role:'Reporter'},
    {name:'Bima Pratama',role:'Editor'},
    {name:'Dewi Larassati',role:'Editor'},
    {name:'Hasmi Anwar',role:'Editor'}
  ];
  const defaults={Reporter:'Arief Rahman H',Editor:'Bima Pratama'};
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
    if(!hidden||!list||!addBtn||!panel||!input||!cancel||!suggestions)return;

    let selected=String(hidden.value||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(!selected.length){selected=[defaults[role]];hidden.value=selected[0];}

    const sync=()=>{hidden.value=selected.join(', ');hidden.dispatchEvent(new Event('change',{bubbles:true}))};

    const render=()=>{
      list.innerHTML=selected.map((name,i)=>
        '<span class="team-member '+(i===0?'primary':'')+'">'+
          '<span class="team-member-avatar">'+escHtml(initials(name))+'</span>'+
          '<span class="team-member-name">'+escHtml(name)+'</span>'+
          '<button class="team-remove" type="button" data-remove-team="'+i+'" aria-label="Hapus '+escHtml(name)+'"><i data-lucide="x"></i></button>'+
        '</span>'
      ).join('');
      list.querySelectorAll('[data-remove-team]').forEach(btn=>{
        btn.onclick=()=>{
          const index=Number(btn.dataset.removeTeam);
          if(Number.isNaN(index))return;
          selected.splice(index,1);
          sync();
          render();
        };
      });
      if(window.lucide)lucide.createIcons();
    };

    const showSuggestions=()=>{
      const q=input.value.trim().toLowerCase();
      const items=directory.filter(p=>p.role===role)
        .filter(p=>!selected.some(x=>x.toLowerCase()===p.name.toLowerCase()))
        .filter(p=>!q||p.name.toLowerCase().includes(q)).slice(0,4);
      suggestions.innerHTML=items.map(p=>
        '<button type="button" class="team-suggestion" data-team-person="'+escHtml(p.name)+'">'+
          '<span class="team-suggestion-avatar">'+escHtml(initials(p.name))+'</span>'+
          '<span><strong>'+escHtml(p.name)+'</strong><br><span>'+escHtml(p.role)+'</span></span>'+
        '</button>'
      ).join('');
      suggestions.querySelectorAll('[data-team-person]').forEach(btn=>{
        btn.onclick=()=>{selected.push(btn.dataset.teamPerson);sync();render();panel.hidden=true;input.value=''};
      });
    };

    addBtn.onclick=()=>{panel.hidden=false;input.value='';showSuggestions();setTimeout(()=>input.focus(),0)};
    cancel.onclick=()=>{panel.hidden=true;input.value=''};
    input.addEventListener('input',showSuggestions);
    input.addEventListener('keydown',e=>{
      if(e.key==='Escape'){panel.hidden=true;input.value='';return;}
      if(e.key==='Enter'&&input.value.trim()){
        e.preventDefault();
        const exact=directory.find(p=>p.role===role&&p.name.toLowerCase()===input.value.trim().toLowerCase());
        if(exact&&!selected.some(x=>x.toLowerCase()===exact.name.toLowerCase())){
          selected.push(exact.name);sync();render();panel.hidden=true;input.value='';
        }
      }
    });
    render();
  });
})();
// NEWSROOM_MULTI_EDITORIAL_PEOPLE_JS_END'''
text=re.sub(re.escape(people_start)+r'.*?'+re.escape(people_end),lambda _m:people_js,text,flags=re.S)

css=r'''/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_START */
body.alt-editor-layout .newsroom-team-section{padding-bottom:12px!important}
body.alt-editor-layout .newsroom-team-section>.settings-section-head{margin-bottom:12px!important}
body.alt-editor-layout .team-role-head{margin-bottom:8px!important}
body.alt-editor-layout .team-role-head strong{font-size:13px!important;line-height:18px!important}
body.alt-editor-layout .team-member-list{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;min-height:36px!important;margin-bottom:8px!important}
body.alt-editor-layout .team-member{height:36px!important;min-height:36px!important;display:inline-flex!important;align-items:center!important;gap:7px!important;padding:0 6px 0 5px!important;border:1px solid #dbe3ee!important;border-radius:999px!important;background:#fff!important;box-sizing:border-box!important}
body.alt-editor-layout .team-member.primary{background:#fff!important;border-color:#dbe3ee!important}
body.alt-editor-layout .team-member-avatar{width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;font-size:10px!important}
body.alt-editor-layout .team-member-name{font-size:12px!important;line-height:16px!important;font-weight:600!important;max-width:170px!important}
body.alt-editor-layout .team-remove{width:24px!important;height:24px!important;min-width:24px!important;display:grid!important;place-items:center!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#94a3b8!important;padding:0!important}
body.alt-editor-layout .team-remove:hover{background:#f1f5f9!important;color:#475569!important}
body.alt-editor-layout .team-remove svg{width:13px!important;height:13px!important}
body.alt-editor-layout .team-add-trigger{min-height:32px!important;margin-left:0!important;padding:0 4px!important;font-size:12px!important}
body.alt-editor-layout .team-role-divider{margin:12px 0!important}
body.alt-editor-layout .newsroom-team-section .alt-entity-picker{display:none!important}
/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_END */'''
idx=text.rfind('</style>')
if idx==-1: raise SystemExit('No </style>')
text=text[:idx]+css+'\n'+text[idx:]

js=r'''// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_START
(function(){
  function removeLegacyOwnershipUI(){
    const team=document.querySelector('.newsroom-team-section');
    if(team)team.querySelectorAll('.alt-entity-picker').forEach(el=>el.remove());
    document.querySelectorAll('.field').forEach(field=>{
      if(field.closest('.newsroom-team-section'))return;
      const label=(field.querySelector('label')?.textContent||'').trim();
      if(['Reporter','Editorial','Editor'].includes(label))field.remove();
    });
  }
  removeLegacyOwnershipUI();
  setTimeout(removeLegacyOwnershipUI,300);
  setTimeout(removeLegacyOwnershipUI,700);
  new MutationObserver(removeLegacyOwnershipUI).observe(document.body,{childList:true,subtree:true});
})();
// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_END'''
body=text.rfind('</body>')
if body==-1: raise SystemExit('No </body>')
text=text[:body]+'\n<script>\n'+js+'\n</script>\n'+text[body:]

path.write_text(text,encoding='utf-8')
print('Editorial team source-level cleanup applied')
