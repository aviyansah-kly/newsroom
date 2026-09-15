from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_STICKY_EDITOR_LAYERING_START */'
end = '/* NEWSROOM_STICKY_EDITOR_LAYERING_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_STICKY_EDITOR_LAYERING_START */
/* Single source of truth for the compact editor header + sticky WYSIWYG relationship. */
:root{
  --newsroom-editor-header-height:64px;
}

/* Header-owned popovers must stay above editor chrome and must not be clipped. */
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

/* The WYSIWYG toolbar should touch the header edge with no stale 72/84px offset. */
body.alt-editor-layout .classic-toolbar,
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  top:var(--newsroom-editor-header-height)!important;
  z-index:160!important;
  margin-top:0!important;
}

/* Keep the active toolbar visually continuous with the header while remaining a lower layer. */
body.alt-editor-layout .alt-content-card[data-type="text"] .classic-toolbar{
  box-shadow:0 5px 12px rgba(15,23,42,.05)!important;
}
/* NEWSROOM_STICKY_EDITOR_LAYERING_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Sticky editor offset and header popover layering fixed.')
