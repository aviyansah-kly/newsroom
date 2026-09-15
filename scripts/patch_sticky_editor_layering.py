from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_STICKY_EDITOR_LAYERING_START */'
end = '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

js_start = '// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_START'
js_end = '// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_END'
if js_start in text and js_end in text:
    text = re.sub(r'<script>\s*' + re.escape(js_start) + r'.*?' + re.escape(js_end) + r'\s*</script>\s*', '', text, flags=re.S)

css = r'''/* NEWSROOM_STICKY_EDITOR_LAYERING_START */
/* Sticky editor chrome follows the rendered header and deliberately tucks underneath it. */
:root{
  --newsroom-editor-header-height:64px;
  --newsroom-sticky-toolbar-overlap:10px;
}

body.alt-editor-layout .topbar{
  z-index:400!important;
  overflow:visible!important;
}
body.alt-editor-layout .writing-view-wrap{
  z-index:410!important;
  overflow:visible!important;
}
body.alt-editor-layout .writing-view-menu{
  z-index:420!important;
}

/* The toolbar is tucked 10px underneath the higher-z header. This removes any seam
   caused by borders, zoom rounding, card spacing, or a later layout patch. */
body.alt-editor-layout .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  top:calc(var(--newsroom-editor-header-height) - var(--newsroom-sticky-toolbar-overlap))!important;
  z-index:160!important;
  margin-top:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  box-shadow:0 5px 12px rgba(15,23,42,.05)!important;
}
/* NEWSROOM_STICKY_EDITOR_LAYERING_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

js = r'''<script>
// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_START
(function(){
  function syncHeaderHeight(){
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(!header)return;
    const h=header.getBoundingClientRect().height;
    if(h>0)document.documentElement.style.setProperty('--newsroom-editor-header-height',h+'px');
  }
  function bind(){
    syncHeaderHeight();
    const header=document.querySelector('body.alt-editor-layout .topbar');
    if(header&&'ResizeObserver' in window)new ResizeObserver(syncHeaderHeight).observe(header);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
  window.addEventListener('resize',syncHeaderHeight,{passive:true});
  window.addEventListener('load',syncHeaderHeight,{once:true});
})();
// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_END
</script>
'''
body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body> tag')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('Sticky editor toolbar is now visually flush with the top header.')
