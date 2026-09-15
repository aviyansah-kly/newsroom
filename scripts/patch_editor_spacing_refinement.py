from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

css_start = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */'
css_end = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */'
if css_start in text and css_end in text:
    text = re.sub(re.escape(css_start) + r'.*?' + re.escape(css_end) + r'\n?', '', text, flags=re.S)

for js_start, js_end in [
    ('// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_START', '// NEWSROOM_EDITOR_STICKY_BOOTSTRAP_END'),
    ('// NEWSROOM_EDITOR_FLOATING_TOOLBAR_START', '// NEWSROOM_EDITOR_FLOATING_TOOLBAR_END'),
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

/* Text card geometry only. Do not alter Article Settings or CMS navigation. */
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding:0!important;
  margin:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .alt-content-card-head{
  margin-bottom:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] #classicToolbar{
  position:relative!important;
  top:auto!important;
  left:auto!important;
  z-index:160!important;
  margin:0!important;
  transform:none!important;
  border-radius:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar.newsroom-toolbar-fixed{
  position:fixed!important;
  top:var(--newsroom-editor-header-height)!important;
  z-index:320!important;
  margin:0!important;
  background:rgba(255,255,255,.99)!important;
  box-shadow:0 5px 14px rgba(15,23,42,.08)!important;
}
body.alt-editor-layout .newsroom-toolbar-placeholder{
  display:block;
  width:100%;
  height:0;
  margin:0;
  padding:0;
}
body.alt-editor-layout .newsroom-toolbar-placeholder.active{
  height:var(--newsroom-toolbar-height,48px);
}

/* Tags spacing remains independent. */
body.alt-editor-layout #altEditorialTagsSection .tag-wrap #tagInput{
  display:block!important;
  width:100%!important;
  margin-top:10px!important;
}
body.alt-editor-layout #altEditorialTagsSection .tag-list:empty + #tagInput{
  margin-top:0!important;
}

/* Compact Editorial Team: assigned person and add action share one row. */
body.alt-editor-layout .newsroom-team-section>.settings-section-head{
  margin-bottom:10px!important;
}
body.alt-editor-layout .newsroom-team-section .team-assignment{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  column-gap:8px!important;
  row-gap:6px!important;
  align-items:center!important;
}
body.alt-editor-layout .newsroom-team-section .team-role-head{
  grid-column:1 / -1!important;
  margin-bottom:0!important;
}
body.alt-editor-layout .newsroom-team-section .team-member-list{
  grid-column:1!important;
  min-width:0!important;
  margin:0!important;
}
body.alt-editor-layout .newsroom-team-section .team-add-trigger{
  grid-column:2!important;
  align-self:center!important;
  margin:0!important;
  white-space:nowrap!important;
}
body.alt-editor-layout .newsroom-team-section .team-add-panel{
  grid-column:1 / -1!important;
  width:100%!important;
}
body.alt-editor-layout .newsroom-team-section .team-role-divider{
  margin:10px 0!important;
}
@media(max-width:520px){
  body.alt-editor-layout .newsroom-team-section .team-assignment{
    grid-template-columns:1fr!important;
  }
  body.alt-editor-layout .newsroom-team-section .team-role-head,
  body.alt-editor-layout .newsroom-team-section .team-member-list,
  body.alt-editor-layout .newsroom-team-section .team-add-trigger,
  body.alt-editor-layout .newsroom-team-section .team-add-panel{
    grid-column:1!important;
  }
  body.alt-editor-layout .newsroom-team-section .team-add-trigger{justify-self:start!important}
}
/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */
'''

style_idx = text.rfind('</style>')
if style_idx == -1:
    raise SystemExit('Could not find closing </style>')
text = text[:style_idx] + css + '\n' + text[style_idx:]

js = r'''<script>
// NEWSROOM_EDITOR_FLOATING_TOOLBAR_START
(function(){
  let observer=null;
  let mountObserver=null;
  let placeholder=null;
  let toolbar=null;
  let card=null;

  function headerHeight(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    const h=header ? Math.round(header.getBoundingClientRect().height) : 64;
    document.documentElement.style.setProperty('--newsroom-editor-header-height',Math.max(1,h)+'px');
    return Math.max(1,h);
  }

  function syncFixedGeometry(){
    if(!toolbar||!card||!toolbar.classList.contains('newsroom-toolbar-fixed'))return;
    const rect=card.getBoundingClientRect();
    toolbar.style.setProperty('left',rect.left+'px','important');
    toolbar.style.setProperty('width',rect.width+'px','important');
  }

  function setFixed(fixed){
    if(!toolbar||!placeholder)return;
    if(fixed){
      const h=Math.ceil(toolbar.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--newsroom-toolbar-height',h+'px');
      placeholder.classList.add('active');
      toolbar.classList.add('newsroom-toolbar-fixed');
      syncFixedGeometry();
    }else{
      toolbar.classList.remove('newsroom-toolbar-fixed');
      toolbar.style.removeProperty('left');
      toolbar.style.removeProperty('width');
      placeholder.classList.remove('active');
    }
  }

  function buildObserver(){
    if(observer)observer.disconnect();
    const hh=headerHeight();
    observer=new IntersectionObserver(entries=>{
      const entry=entries[0];
      const shouldFix=!entry.isIntersecting && entry.boundingClientRect.top < hh;
      setFixed(shouldFix);
    },{root:null,threshold:0,rootMargin:'-'+hh+'px 0px 0px 0px'});
    observer.observe(placeholder);
  }

  function initToolbar(){
    toolbar=document.getElementById('classicToolbar');
    card=toolbar?.closest('.alt-content-card[data-type="text"]');
    if(!toolbar||!card)return false;

    if(!placeholder){
      placeholder=document.createElement('div');
      placeholder.className='newsroom-toolbar-placeholder';
      placeholder.setAttribute('aria-hidden','true');
      toolbar.parentNode.insertBefore(placeholder,toolbar);
    }

    buildObserver();
    if(mountObserver){mountObserver.disconnect();mountObserver=null;}
    return true;
  }

  function boot(){
    if(initToolbar())return;
    if('MutationObserver' in window){
      mountObserver=new MutationObserver(()=>initToolbar());
      mountObserver.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('load',()=>{initToolbar();buildObserver();},{once:true});
  window.addEventListener('resize',()=>{headerHeight();syncFixedGeometry();buildObserver();},{passive:true});
})();
// NEWSROOM_EDITOR_FLOATING_TOOLBAR_END
</script>
'''

body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body>')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('WYSIWYG floating toolbar stabilized and Editorial Team compacted.')
