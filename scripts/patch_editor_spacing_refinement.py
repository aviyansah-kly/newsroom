from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

css_start = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */'
css_end = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */'
if css_start in text and css_end in text:
    text = re.sub(re.escape(css_start) + r'.*?' + re.escape(css_end) + r'\n?', '', text, flags=re.S)

js_start = '// NEWSROOM_EDITOR_SPACING_SYNC_START'
js_end = '// NEWSROOM_EDITOR_SPACING_SYNC_END'
if js_start in text and js_end in text:
    text = re.sub(r'<script>\s*' + re.escape(js_start) + r'.*?' + re.escape(js_end) + r'\s*</script>\s*', '', text, flags=re.S)

css = r'''/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */
/* One shared live offset. JS writes this from the actual rendered topbar bottom edge. */
:root{--newsroom-live-header-bottom:64px}

/* Text card: no empty visual band between card header and WYSIWYG toolbar. */
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding-top:0!important;
  margin-top:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  margin-block-start:0!important;
  top:calc(var(--newsroom-live-header-bottom) - 4px)!important;
}

/* A tiny overlap sits underneath the higher-z topbar so zoom/subpixel rounding can never show a seam. */
body.alt-editor-layout .topbar{z-index:400!important}
body.alt-editor-layout .classic-toolbar{z-index:160!important}

/* Tags input needs breathing room after the generated/existing chips. */
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
// NEWSROOM_EDITOR_SPACING_SYNC_START
(function(){
  let raf=0;
  const OVERLAP=4;

  function syncToolbar(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(!header)return;

    const rect=header.getBoundingClientRect();
    const headerBottom=Math.max(0,rect.bottom);
    document.documentElement.style.setProperty('--newsroom-live-header-bottom',headerBottom+'px');

    document.querySelectorAll('body.alt-editor-layout .alt-content-card[data-type="text"]').forEach(card=>{
      const head=card.querySelector(':scope > .alt-content-card-head');
      const body=card.querySelector(':scope > .alt-content-card-body');
      const toolbar=card.querySelector('.classic-toolbar');
      if(!head||!body||!toolbar)return;

      body.style.setProperty('padding-top','0px','important');
      body.style.setProperty('margin-top','0px','important');
      toolbar.style.setProperty('position','sticky','important');
      toolbar.style.setProperty('top',Math.max(0,headerBottom-OVERLAP)+'px','important');
      toolbar.style.setProperty('transform','none','important');

      /* Normal (not yet sticky) state: collapse only a real accidental empty band. */
      if(toolbar.dataset.spacingMeasured!=='1'){
        toolbar.style.setProperty('margin-top','0px','important');
        const gap=toolbar.getBoundingClientRect().top-head.getBoundingClientRect().bottom;
        if(gap>8 && gap<180){
          const shift=Math.max(0,Math.round(gap-4));
          toolbar.style.setProperty('margin-top','-'+shift+'px','important');
          toolbar.dataset.normalGapShift=String(shift);
        }else{
          toolbar.style.setProperty('margin-top','0px','important');
          toolbar.dataset.normalGapShift='0';
        }
        toolbar.dataset.spacingMeasured='1';
      }
    });
  }

  function schedule(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(syncToolbar);
  }

  function remeasure(){
    document.querySelectorAll('body.alt-editor-layout .classic-toolbar').forEach(toolbar=>{
      delete toolbar.dataset.spacingMeasured;
      toolbar.style.setProperty('margin-top','0px','important');
    });
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',remeasure,{once:true});
  window.addEventListener('resize',remeasure,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});

  if('ResizeObserver' in window){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(header)new ResizeObserver(schedule).observe(header);
  }
  if('MutationObserver' in window){
    const root=document.querySelector('body.alt-editor-layout') || document.body;
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  }
})();
// NEWSROOM_EDITOR_SPACING_SYNC_END
</script>
'''

body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body>')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('Editor spacing now follows the actual rendered header bottom edge.')
