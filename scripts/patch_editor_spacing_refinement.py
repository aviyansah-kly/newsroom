from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Remove previous runtime geometry syncs. They caused sticky threshold jitter/glitches
# because several scripts kept rewriting top/margin while the page was scrolling.
for js_start, js_end in [
    ('// NEWSROOM_EDITOR_SPACING_SYNC_START', '// NEWSROOM_EDITOR_SPACING_SYNC_END'),
    ('// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_START', '// NEWSROOM_STICKY_EDITOR_HEADER_SYNC_END'),
]:
    if js_start in text and js_end in text:
        text = re.sub(r'<script>\s*' + re.escape(js_start) + r'.*?' + re.escape(js_end) + r'\s*</script>\s*', '', text, flags=re.S)

css_start = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */'
css_end = '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */'
if css_start in text and css_end in text:
    text = re.sub(re.escape(css_start) + r'.*?' + re.escape(css_end) + r'\n?', '', text, flags=re.S)

# Also neutralize the older sticky layering block so there is exactly one owner of
# the WYSIWYG top offset.
old_start = '/* NEWSROOM_STICKY_EDITOR_LAYERING_START */'
old_end = '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'
if old_start in text and old_end in text:
    text = re.sub(re.escape(old_start) + r'.*?' + re.escape(old_end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */
/* One source of truth for every surface that sits below the app header. */
:root{
  --newsroom-app-header-height:64px;
}

body.alt-editor-layout .topbar{
  height:var(--newsroom-app-header-height)!important;
  min-height:var(--newsroom-app-header-height)!important;
  max-height:var(--newsroom-app-header-height)!important;
  top:0!important;
  z-index:400!important;
}

/* WYSIWYG: CSS-only sticky. No JS writes top/margin while scrolling. */
body.alt-editor-layout .alt-content-card[data-type="text"],
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  overflow:visible!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding-top:0!important;
  margin-top:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,
body.alt-editor-layout #classicToolbar{
  position:sticky!important;
  top:var(--newsroom-app-header-height)!important;
  z-index:160!important;
  margin:0!important;
  transform:none!important;
  border-radius:0!important;
}

/* Keep normal (non-sticky) card geometry compact and predictable. */
body.alt-editor-layout .alt-content-card[data-type="text"] .alt-content-card-head{
  margin-bottom:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar + #tiptap-editor{
  margin-top:0!important;
}

/* Right settings column must begin directly below the global header, not an old 72/84px offset. */
body.alt-editor-layout .context{
  top:var(--newsroom-app-header-height)!important;
  margin-top:0!important;
  padding-top:0!important;
}
body.alt-editor-layout .context>.panel{
  margin-top:0!important;
}
body.alt-editor-layout .context>.panel>.tabs.article-tabs-promoted,
body.alt-editor-layout .context .tabs{
  top:var(--newsroom-app-header-height)!important;
}

/* Common CMS navigation shells: align with the same header edge when sticky/fixed. */
body.alt-editor-layout .cms-sidebar,
body.alt-editor-layout .cms-menu,
body.alt-editor-layout .sidebar,
body.alt-editor-layout .left-sidebar,
body.alt-editor-layout .navigation-sidebar,
body.alt-editor-layout .editor-sidebar-left{
  top:var(--newsroom-app-header-height)!important;
  margin-top:0!important;
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

# One-time class discovery is allowed for the legacy left CMS shell; importantly,
# it does not run on scroll and therefore cannot cause sticky jitter.
js = r'''<script>
// NEWSROOM_LEGACY_SIDEBAR_ALIGN_START
(function(){
  function markLegacySidebar(){
    const candidates=[...document.querySelectorAll('aside,nav,section,div')];
    const title=candidates.find(el=>{
      const own=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).join(' ');
      return own==='Menu CMS';
    }) || [...document.querySelectorAll('h1,h2,h3,h4,strong')].find(el=>(el.textContent||'').trim()==='Menu CMS');
    const shell=title?.closest('aside,nav,.sidebar,.cms-menu,.cms-sidebar');
    if(shell)shell.classList.add('editor-sidebar-left');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',markLegacySidebar,{once:true});
  else markLegacySidebar();
})();
// NEWSROOM_LEGACY_SIDEBAR_ALIGN_END
</script>
'''
body_idx = text.rfind('</body>')
if body_idx == -1:
    raise SystemExit('Could not find closing </body>')
text = text[:body_idx] + js + '\n' + text[body_idx:]

path.write_text(text, encoding='utf-8')
print('Stable CSS-only sticky layout applied with one 64px header offset.')
