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
/* Text card: no empty visual band between the card header and the WYSIWYG toolbar. */
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding-top:0!important;
  margin-top:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  margin-block-start:0!important;
}

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

  function syncToolbar(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(!header)return;
    const headerBottom=header.getBoundingClientRect().bottom;

    document.querySelectorAll('body.alt-editor-layout .alt-content-card[data-type="text"]').forEach(card=>{
      const head=card.querySelector(':scope > .alt-content-card-head');
      const body=card.querySelector(':scope > .alt-content-card-body');
      const toolbar=card.querySelector('.classic-toolbar');
      if(!head||!body||!toolbar)return;

      body.style.setProperty('padding-top','0px','important');
      body.style.setProperty('margin-top','0px','important');
      toolbar.style.setProperty('position','sticky','important');
      toolbar.style.setProperty('top',Math.max(0,headerBottom-1)+'px','important');
      toolbar.style.setProperty('transform','none','important');

      /* Remove the large non-sticky band only once per rendered geometry.
         The correction is based on the actual gap between the card head and toolbar. */
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
print('Editor spacing refined: stable sticky toolbar and improved Tags input spacing.')
