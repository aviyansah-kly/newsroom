from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Remove previous refinement block and one-time/sidebar bootstrap scripts.
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

# Older sticky layering must not compete with the final rule.
old_start = '/* NEWSROOM_STICKY_EDITOR_LAYERING_START */'
old_end = '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'
if old_start in text and old_end in text:
    text = re.sub(re.escape(old_start) + r'.*?' + re.escape(old_end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */
:root{
  --newsroom-app-header-height:64px;
}

body.alt-editor-layout .topbar{
  top:0!important;
  z-index:400!important;
  overflow:visible!important;
}

/* Sticky needs an uninterrupted containing chain. Legacy overflow rules on any of
   these editor shells can silently disable position: sticky on first render. */
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

/* Only the toolbar inside the final mounted Text card owns the sticky behavior. */
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] #classicToolbar{
  position:sticky!important;
  top:calc(var(--newsroom-app-header-height) - 1px)!important;
  z-index:160!important;
  margin:0!important;
  transform:none!important;
  border-radius:0!important;
}

/* Settings column and promoted tabs use the exact same measured header height. */
body.alt-editor-layout .context{
  top:var(--newsroom-app-header-height)!important;
  margin-top:0!important;
  padding-top:0!important;
}
body.alt-editor-layout .context>.panel{margin-top:0!important}
body.alt-editor-layout .context>.panel>.tabs.article-tabs-promoted,
body.alt-editor-layout .context .tabs{
  top:var(--newsroom-app-header-height)!important;
}

/* Legacy CMS navigation shell aligns to the same header edge. */
body.alt-editor-layout .editor-sidebar-left{
  top:var(--newsroom-app-header-height)!important;
  margin-top:0!important;
  padding-top:0!important;
}

/* Tags input breathing room after chips. */
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
  let mountedObserver=null;
  let headerObserver=null;

  function syncHeaderHeight(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(!header)return;
    const h=Math.round(header.getBoundingClientRect().height);
    if(h>0)document.documentElement.style.setProperty('--newsroom-app-header-height',h+'px');
  }

  function markLegacySidebar(){
    const label=[...document.querySelectorAll('h1,h2,h3,h4,strong')].find(el=>(el.textContent||'').trim()==='Menu CMS');
    const shell=label?.closest('aside,nav,.sidebar,.cms-menu,.cms-sidebar') || label?.parentElement?.parentElement;
    if(shell)shell.classList.add('editor-sidebar-left');
  }

  function finalizeToolbar(){
    const toolbar=document.getElementById('classicToolbar');
    const body=toolbar?.closest('.alt-content-card[data-type="text"] > .alt-content-card-body');
    if(!toolbar||!body)return false;

    syncHeaderHeight();
    markLegacySidebar();
    toolbar.dataset.stickyReady='1';

    /* Force one layout pass only after the toolbar has reached its final card.
       This removes the previous dependency on Generate Attributes/re-render. */
    void toolbar.offsetHeight;

    if(mountedObserver){mountedObserver.disconnect();mountedObserver=null;}
    return true;
  }

  function boot(){
    syncHeaderHeight();
    markLegacySidebar();
    if(finalizeToolbar())return;

    /* Observe only until the Text card builder moves the toolbar into its final
       container, then disconnect immediately. No scroll-time DOM work. */
    if('MutationObserver' in window){
      mountedObserver=new MutationObserver(()=>finalizeToolbar());
      mountedObserver.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.addEventListener('load',()=>{syncHeaderHeight();finalizeToolbar();},{once:true});
  window.addEventListener('resize',syncHeaderHeight,{passive:true});

  const header=document.querySelector('body.alt-editor-layout .topbar');
  if(header&&'ResizeObserver' in window){
    headerObserver=new ResizeObserver(syncHeaderHeight);
    headerObserver.observe(header);
  }
})();
// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_END
</script>
'''

body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body>')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('Sticky editor initializes on final Text card mount and uses measured header height.')
