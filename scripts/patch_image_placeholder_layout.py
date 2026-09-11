from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */'
end = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */
body.alt-editor-layout .alt-content-card[data-type="image"] .alt-content-card-body{
  padding:16px!important;
}
body.alt-editor-layout .newsroom-image-empty{
  min-height:168px!important;
  padding:22px 24px!important;
  display:grid!important;
  grid-template-columns:48px minmax(0,1fr)!important;
  grid-template-areas:
    'icon copy'
    '. actions'!important;
  align-items:start!important;
  justify-items:stretch!important;
  column-gap:16px!important;
  row-gap:12px!important;
  text-align:left!important;
  background:#f8fafc!important;
  border:1px dashed #cbd5e1!important;
  border-radius:10px!important;
}
body.alt-editor-layout .newsroom-image-empty-icon{
  grid-area:icon!important;
  width:44px!important;
  height:44px!important;
  margin-top:1px!important;
  border-radius:10px!important;
  display:grid!important;
  place-items:center!important;
  background:#fff!important;
  border:1px solid #e2e8f0!important;
  color:#475569!important;
}
body.alt-editor-layout .newsroom-image-empty-icon svg{
  width:20px!important;
  height:20px!important;
}
body.alt-editor-layout .newsroom-image-empty-copy{
  grid-area:copy!important;
  max-width:540px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  text-align:left!important;
  gap:4px!important;
  min-width:0!important;
}
body.alt-editor-layout .newsroom-image-empty-copy strong{
  font-size:14px!important;
  line-height:20px!important;
  color:#0f172a!important;
}
body.alt-editor-layout .newsroom-image-empty-copy span{
  font-size:13px!important;
  line-height:19px!important;
  color:#475569!important;
}
body.alt-editor-layout .newsroom-image-empty-copy small{
  font-size:12px!important;
  line-height:18px!important;
  color:#64748b!important;
  max-width:520px!important;
}
body.alt-editor-layout .newsroom-image-empty-actions{
  grid-area:actions!important;
  width:auto!important;
  margin:0!important;
  padding:0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  gap:8px!important;
  flex-wrap:wrap!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button{
  min-height:36px!important;
  padding:0 12px!important;
  font-size:13px!important;
  border-radius:8px!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button svg{
  width:15px!important;
  height:15px!important;
}
@media(max-width:720px){
  body.alt-editor-layout .newsroom-image-empty{
    min-height:0!important;
    padding:20px 16px!important;
    grid-template-columns:1fr!important;
    grid-template-areas:'icon' 'copy' 'actions'!important;
    justify-items:center!important;
    row-gap:10px!important;
    text-align:center!important;
  }
  body.alt-editor-layout .newsroom-image-empty-copy{
    align-items:center!important;
    text-align:center!important;
  }
  body.alt-editor-layout .newsroom-image-empty-actions{
    width:100%!important;
    justify-content:center!important;
  }
  body.alt-editor-layout .newsroom-image-empty-actions button{
    flex:1 1 150px!important;
  }
}
/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Image placeholder layout patch applied.')
