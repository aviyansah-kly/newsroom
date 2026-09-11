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
  min-height:160px!important;
  padding:24px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:10px!important;
  text-align:center!important;
  background:#f8fafc!important;
  border:1px dashed #cbd5e1!important;
  border-radius:10px!important;
}
body.alt-editor-layout .newsroom-image-empty-icon{
  display:none!important;
}
body.alt-editor-layout .newsroom-image-empty-copy{
  width:100%!important;
  max-width:440px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  text-align:center!important;
  gap:4px!important;
  min-width:0!important;
  margin:0 auto!important;
}
body.alt-editor-layout .newsroom-image-empty-copy strong{
  display:block!important;
  width:100%!important;
  font-size:14px!important;
  line-height:20px!important;
  color:#0f172a!important;
  text-align:center!important;
}
body.alt-editor-layout .newsroom-image-empty-copy span{
  display:block!important;
  width:100%!important;
  font-size:13px!important;
  line-height:19px!important;
  color:#475569!important;
  text-align:center!important;
}
body.alt-editor-layout .newsroom-image-empty-copy small{
  display:none!important;
}
body.alt-editor-layout .newsroom-image-empty-actions{
  width:100%!important;
  margin:6px 0 0!important;
  padding:0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  flex-wrap:wrap!important;
  text-align:center!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button{
  min-height:36px!important;
  padding:0 12px!important;
  font-size:13px!important;
  border-radius:8px!important;
  flex:none!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button svg{
  width:15px!important;
  height:15px!important;
}
@media(max-width:720px){
  body.alt-editor-layout .newsroom-image-empty{
    min-height:0!important;
    padding:20px 16px!important;
  }
  body.alt-editor-layout .newsroom-image-empty-copy{
    max-width:360px!important;
  }
  body.alt-editor-layout .newsroom-image-empty-actions{
    width:100%!important;
    justify-content:center!important;
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
