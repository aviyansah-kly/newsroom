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

css=r'''/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_START */
body.alt-editor-layout .newsroom-team-section{padding-bottom:12px!important}
body.alt-editor-layout .newsroom-team-section>.settings-section-head{margin-bottom:12px!important}
body.alt-editor-layout .team-role-head{margin-bottom:8px!important}
body.alt-editor-layout .team-role-head strong{font-size:13px!important;line-height:18px!important}
body.alt-editor-layout .team-member-list{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;min-height:36px!important;margin-bottom:8px!important}
body.alt-editor-layout .team-member{height:36px!important;min-height:36px!important;display:inline-flex!important;align-items:center!important;gap:7px!important;padding:0 8px 0 5px!important;border:1px solid #dbe3ee!important;border-radius:999px!important;background:#fff!important;box-sizing:border-box!important}
body.alt-editor-layout .team-member.primary{background:#fff!important;border-color:#cbd5e1!important}
body.alt-editor-layout .team-member-avatar{width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;font-size:10px!important}
body.alt-editor-layout .team-member-name{font-size:12px!important;line-height:16px!important;font-weight:600!important;max-width:170px!important}
body.alt-editor-layout .team-change-primary{width:24px!important;height:24px!important;min-width:24px!important;padding:0!important;display:grid!important;place-items:center!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#94a3b8!important;font-size:0!important}
body.alt-editor-layout .team-change-primary:after{content:'⌄';font-size:16px;line-height:1;transform:translateY(-1px)}
body.alt-editor-layout .team-change-primary:hover{background:#f1f5f9!important;color:#475569!important}
body.alt-editor-layout .team-remove{width:24px!important;height:24px!important;min-width:24px!important}
body.alt-editor-layout .team-remove svg{width:13px!important;height:13px!important}
body.alt-editor-layout .team-add-trigger{min-height:32px!important;margin-left:0!important;padding:0 4px!important;font-size:12px!important}
body.alt-editor-layout .team-role-divider{margin:12px 0!important}
/* NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_END */'''
idx=text.rfind('</style>')
if idx==-1: raise SystemExit('No </style>')
text=text[:idx]+css+'\n'+text[idx:]

js=r'''// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_START
(function(){
  const roleNames=new Set(['Reporter','Editorial','Editor']);
  function removeLegacyFields(){
    const info=document.getElementById('infoPane');
    if(!info)return;
    info.querySelectorAll('label').forEach(label=>{
      const name=(label.textContent||'').trim();
      if(!roleNames.has(name))return;
      if(label.closest('.newsroom-team-section'))return;
      const field=label.closest('.field')||label.parentElement;
      if(field && !field.closest('.newsroom-team-section')) field.remove();
    });
    info.querySelectorAll('input').forEach(input=>{
      if(input.type==='hidden')return;
      const id=(input.id||'').toLowerCase();
      const name=(input.name||'').toLowerCase();
      if(['reporter','editor','editorial','editorname'].includes(id)||['reporter','editor','editorial','editorname'].includes(name)){
        const field=input.closest('.field');
        if(field && !field.closest('.newsroom-team-section')) field.remove();
      }
    });
  }
  removeLegacyFields();
  const info=document.getElementById('infoPane');
  if(info){
    const observer=new MutationObserver(()=>removeLegacyFields());
    observer.observe(info,{childList:true,subtree:true});
  }

  document.querySelectorAll('[data-team-role]').forEach(group=>{
    const list=group.querySelector('[data-team-members]');
    if(!list)return;
    const normalize=()=>{
      list.querySelectorAll('.team-member').forEach(chip=>{
        chip.style.height='36px';
        chip.style.minHeight='36px';
      });
    };
    normalize();
    new MutationObserver(normalize).observe(list,{childList:true,subtree:true});
  });
})();
// NEWSROOM_EDITORIAL_TEAM_FINAL_CLEANUP_JS_END'''
body=text.rfind('</body>')
if body==-1: raise SystemExit('No </body>')
text=text[:body]+'\n<script>\n'+js+'\n</script>\n'+text[body:]

path.write_text(text,encoding='utf-8')
print('Final editorial team cleanup applied')
