from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

css_start = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */'
css_end = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */'
if css_start in text and css_end in text:
    text = re.sub(re.escape(css_start) + r'.*?' + re.escape(css_end) + r'\n?', '', text, flags=re.S)

for js_start, js_end in [
    ('// NEWSROOM_LEGACY_SIDEBAR_ALIGN_START', '// NEWSROOM_LEGACY_SIDEBAR_ALIGN_END'),
    ('// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_START', '// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_END'),
    ('// NEWSROOM_EDITOR_SPACING_SYNC_START', '// NEWSROOM_EDITOR_SPACING_SYNC_END'),
    ('// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_START', '// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_END'),
]:
    if js_start in text and js_end in text:
        text = re.sub(r'<script>\s*' + re.escape(js_start) + r'.*?' + re.escape(js_end) + r'\s*</script>\s*', '', text, flags=re.S)

old_start = '/* NEWSROOM_STICKY_EDITOR_LAYERING_START */'
old_end = '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'
if old_start in text and old_end in text:
    text = re.sub(re.escape(old_start) + r'.*?' + re.escape(old_end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */
:root{--newsroom-editor-header-height:64px}

/* Scope intentionally limited to the Text WYSIWYG only. Do not touch sidebars,
   Article Settings, tabs, or other sticky surfaces. */
body.alt-editor-layout .alt-editor-section,
body.alt-editor-layout .alt-block-list,
body.alt-editor-layout .alt-content-card[data-type="text"],
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  overflow:visible!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding-top:0!important;
  margin-top:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .alt-content-card-head{
  margin-bottom:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] #classicToolbar{
  position:sticky!important;
  top:calc(var(--newsroom-editor-header-height) - 1px)!important;
  z-index:160!important;
  margin:0!important;
  transform:none!important;
  border-radius:0!important;
}

/* Tags spacing remains an independent field-level refinement. */
body.alt-editor-layout #altEditorialTagsSection .tag-wrap #tagInput{
  display:block!important;
  width:100%!important;
  margin-top:10px!important;
}
body.alt-editor-layout #altEditorialTagsSection .tag-list:empty + #tagInput{
  margin-top:0!important;
}
/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */
'''

style_idx = text.rfind('</style>')
if style_idx == -1:
    raise SystemExit('Could not find closing </style>')
text = text[:style_idx] + css + '\n' + text[style_idx:]

js = r'''<script>
// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_START
(function(){
  let mountObserver=null;

  function syncEditorHeaderHeight(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(!header)return;
    const h=Math.round(header.getBoundingClientRect().height);
    if(h>0)document.documentElement.style.setProperty('--newsroom-editor-header-height',h+'px');
  }

  function finalizeToolbar(){
    const toolbar=document.getElementById('classicToolbar');
    const card=toolbar?.closest('.alt-content-card[data-type="text"]');
    if(!toolbar||!card)return false;

    syncEditorHeaderHeight();
    toolbar.dataset.stickyReady='1';
    void toolbar.offsetHeight;

    if(mountObserver){mountObserver.disconnect();mountObserver=null;}
    return true;
  }

  function boot(){
    syncEditorHeaderHeight();
    if(finalizeToolbar())return;
    if('MutationObserver' in window){
      mountObserver=new MutationObserver(()=>finalizeToolbar());
      mountObserver.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('load',()=>{syncEditorHeaderHeight();finalizeToolbar();},{once:true});
  window.addEventListener('resize',syncEditorHeaderHeight,{passive:true});
})();
// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_END
</script>
'''

body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body>')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('Sticky refinement isolated to the WYSIWYG toolbar only.')
