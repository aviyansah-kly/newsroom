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

# Use the same remove affordance for every chip, including the first person.
old_primary='''+(i===0?'<button class="team-change-primary" type="button" data-change-primary aria-label="Ganti '+escHtml(name)+'">Ganti</button>':'<button class="team-remove" type="button" data-remove-team="'+i+'" aria-label="Hapus '+escHtml(name)+'"><i data-lucide="x"></i></button>')+'''
new_primary='''+'<button class="team-remove" type="button" data-remove-team="'+i+'" aria-label="Hapus '+escHtml(name)+'"><i data-lucide="x"></i></button>'+'''
text=text.replace(old_primary,new_primary)

# Remove the now-unused primary replacement wiring if it exists.
text=re.sub(r"\s*list\.querySelectorAll\('\[data-change-primary\]'\)\.forEach\(btn=>btn\.onclick=.*?\);",'',text)
text=text.replace("if(group.dataset.replacePrimary==='1'){selected[0]=name;delete group.dataset.replacePrimary}else selected.push(name);","selected.push(name);")

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
body.alt-editor-layout .team-change-primary{display:none!important}
/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_END */'''
idx=text.rfind('</style>')
if idx==-1: raise SystemExit('No </style>')
text=text[:idx]+css+'\n'+text[idx:]

js=r'''// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_START
(function(){
  const roleNames=new Set(['Reporter','Editorial','Editor']);

  function removeLegacyFields(){
    document.querySelectorAll('.field').forEach(field=>{
      if(field.closest('.newsroom-team-section')) return;
      const label=field.querySelector(':scope > label, :scope > .field-label label, label');
      const name=(label?.textContent||'').trim();
      if(roleNames.has(name)){
        const visibleControl=field.querySelector('input:not([type="hidden"]), textarea, select');
        if(visibleControl) field.remove();
      }
    });

    document.querySelectorAll('input:not([type="hidden"])').forEach(input=>{
      if(input.closest('.newsroom-team-section')) return;
      const key=((input.id||input.name||'')+'').toLowerCase();
      if(['reporter','editor','editorial','editorname'].includes(key)){
        const field=input.closest('.field')||input.parentElement;
        if(field && !field.closest('.newsroom-team-section')) field.remove();
      }
    });
  }

  function normalizeTeamChips(){
    document.querySelectorAll('[data-team-role] .team-member').forEach(chip=>{
      chip.style.height='36px';
      chip.style.minHeight='36px';
    });
  }

  removeLegacyFields();
  normalizeTeamChips();

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      removeLegacyFields();
      normalizeTeamChips();
    });
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_END'''
body=text.rfind('</body>')
if body==-1: raise SystemExit('No </body>')
text=text[:body]+'\n<script>\n'+js+'\n</script>\n'+text[body:]

path.write_text(text,encoding='utf-8')
print('Final editorial team cleanup applied')
