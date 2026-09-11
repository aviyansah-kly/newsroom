from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_EDITOR_RESPONSIVE_WIDTH_FIX_START */'
end = '/* NEWSROOM_EDITOR_RESPONSIVE_WIDTH_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_EDITOR_RESPONSIVE_WIDTH_FIX_START */
/* Prevent center-column content cards from escaping their available width. */
body.alt-editor-layout .workspace,
body.alt-editor-layout .workspace > section,
body.alt-editor-layout .alt-editor-main,
body.alt-editor-layout .paper,
body.alt-editor-layout .alt-meta-section,
body.alt-editor-layout .alt-editor-section,
body.alt-editor-layout .alt-block-list,
body.alt-editor-layout .alt-content-card,
body.alt-editor-layout .alt-content-card-head,
body.alt-editor-layout .alt-content-card-body,
body.alt-editor-layout .alt-content-card-foot{
  min-width:0!important;
  max-width:100%!important;
  box-sizing:border-box!important;
}

body.alt-editor-layout .workspace > section,
body.alt-editor-layout .alt-editor-main,
body.alt-editor-layout .paper,
body.alt-editor-layout .alt-editor-section,
body.alt-editor-layout .alt-block-list,
body.alt-editor-layout .alt-content-card{
  width:100%!important;
}

/* A card itself must never create horizontal page overflow. */
body.alt-editor-layout .alt-content-card{
  overflow:hidden!important;
}

/* Header actions may compress/wrap inside the card instead of widening it. */
body.alt-editor-layout .alt-content-card-head{
  flex-wrap:wrap!important;
}
body.alt-editor-layout .alt-content-card-title{
  flex:1 1 180px!important;
  min-width:0!important;
}
body.alt-editor-layout .alt-content-actions{
  flex:0 1 auto!important;
  max-width:100%!important;
}

/* Form/media layouts must shrink with the center column. */
body.alt-editor-layout .alt-content-card-body > *,
body.alt-editor-layout .alt-content-card-body input,
body.alt-editor-layout .alt-content-card-body textarea,
body.alt-editor-layout .alt-content-card-body select,
body.alt-editor-layout .alt-content-card-body img,
body.alt-editor-layout .alt-content-card-body video,
body.alt-editor-layout .alt-content-card-body iframe{
  max-width:100%!important;
  box-sizing:border-box!important;
}

body.alt-editor-layout .alt-content-card-body [style*="grid-template-columns"],
body.alt-editor-layout .alt-content-card-body .alt-video-grid,
body.alt-editor-layout .alt-content-card-body .alt-embed-grid{
  min-width:0!important;
}

/* Long editor toolbars stay inside the card and scroll locally. */
body.alt-editor-layout .alt-content-card .classic-toolbar,
body.alt-editor-layout .alt-content-card .alt-mini-toolbar{
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
}

/* Tables/widgets can scroll inside the card instead of pushing the full card wider. */
body.alt-editor-layout .alt-content-card table,
body.alt-editor-layout .alt-content-card .standings-table,
body.alt-editor-layout .alt-content-card .widget-preview{
  max-width:100%!important;
}
body.alt-editor-layout .alt-content-card-body{
  overflow-x:auto!important;
  overflow-y:visible!important;
}

@media(max-width:1180px){
  body.alt-editor-layout .alt-content-card-head{
    gap:8px!important;
  }
  body.alt-editor-layout .alt-content-card-body{
    padding-left:12px!important;
    padding-right:12px!important;
  }
}

@media(max-width:900px){
  body.alt-editor-layout .alt-content-card-head{
    align-items:flex-start!important;
  }
  body.alt-editor-layout .alt-content-actions{
    margin-left:auto!important;
  }
}
/* NEWSROOM_EDITOR_RESPONSIVE_WIDTH_FIX_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Responsive editor card containment applied.')
