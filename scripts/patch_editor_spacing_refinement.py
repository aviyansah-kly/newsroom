from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Remove every experimental spacing/sticky patch we own so only one system remains.
for css_start, css_end in [
    ('/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */', '/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */'),
    ('/* NEWSROOM_STICKY_EDITOR_LAYERING_START */', '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'),
    ('/* NEWSROOM_LEGACY_SIDEBAR_ALIGN_START */', '/* NEWSROOM_LEGACY_SIDEBAR_ALIGN_END */'),
]:
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

css = r'''/* NEWSROOM_EDITOR_SPACING_REFINEMENT_START */
:root{--newsroom-editor-header-height:64px}

/* One source of truth for the refined app header and the two outer shells. */
body.alt-editor-layout .topbar{
  height:var(--newsroom-editor-header-height)!important;
  min-height:var(--newsroom-editor-header-height)!important;
}
body.alt-editor-layout .cms-nav-drawer{
  top:var(--newsroom-editor-header-height)!important;
  height:calc(100vh - var(--newsroom-editor-header-height))!important;
}
body.alt-editor-layout .cms-nav-backdrop{
  inset:var(--newsroom-editor-header-height) 0 0 0!important;
}
body.alt-editor-layout .context{
  top:var(--newsroom-editor-header-height)!important;
  height:calc(100vh - var(--newsroom-editor-header-height))!important;
}

/* Native sticky only. No fixed positioning, observers, left/width measurements, or runtime offset rewrites. */
body.alt-editor-layout .alt-editor-section,
body.alt-editor-layout .alt-block-list,
body.alt-editor-layout .alt-content-card[data-type="text"],
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  overflow:visible!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-head{
  margin:0!important;
  margin-bottom:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] > .alt-content-card-body{
  padding:0!important;
  margin:0!important;
}
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] #classicToolbar{
  position:sticky!important;
  top:var(--newsroom-editor-header-height)!important;
  left:auto!important;
  width:auto!important;
  z-index:180!important;
  margin:0!important;
  transform:none!important;
  border-radius:0!important;
  background:#fff!important;
}

/* Keep the field refinements already approved. */
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
  body.alt-editor-layout .newsroom-team-section .team-assignment{grid-template-columns:1fr!important}
  body.alt-editor-layout .newsroom-team-section .team-role-head,
  body.alt-editor-layout .newsroom-team-section .team-member-list,
  body.alt-editor-layout .newsroom-team-section .team-add-trigger,
  body.alt-editor-layout .newsroom-team-section .team-add-panel{grid-column:1!important}
  body.alt-editor-layout .newsroom-team-section .team-add-trigger{justify-self:start!important}
}
/* NEWSROOM_EDITOR_SPACING_REFINEMENT_END */
'''

style_idx = text.rfind('</style>')
if style_idx == -1:
    raise SystemExit('Could not find closing </style>')
text = text[:style_idx] + css + '\n' + text[style_idx:]

path.write_text(text, encoding='utf-8')
print('Reset to native sticky with a single 64px header offset.')
