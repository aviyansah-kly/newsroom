from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */'
end = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

# Keep both image empty states consistent: centered copy, centered actions,
# and no decorative icon in the content-block empty state.
css = r'''/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */
body.alt-editor-layout .alt-content-card[data-type="image"] .alt-content-card-body{
  padding:16px!important;
}
body.alt-editor-layout .newsroom-image-empty{
  width:100%!important;
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
  grid-area:auto!important;
  position:static!important;
  inset:auto!important;
  width:100%!important;
  max-width:440px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  align-self:center!important;
  justify-self:center!important;
  text-align:center!important;
  gap:4px!important;
  min-width:0!important;
  margin:0 auto!important;
  padding:0!important;
}
body.alt-editor-layout .newsroom-image-empty-copy strong,
body.alt-editor-layout .newsroom-image-empty-copy span{
  display:block!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
  text-align:center!important;
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
  display:none!important;
}
body.alt-editor-layout .newsroom-image-empty-actions{
  grid-area:auto!important;
  position:static!important;
  width:100%!important;
  margin:6px auto 0!important;
  padding:0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  align-self:center!important;
  justify-self:center!important;
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

/* Headline Image uses the same centered empty-state hierarchy. */
body.alt-editor-layout .headline-drop:not(.has-image) #headlineEmpty,
body.alt-editor-layout .headline-drop.v59-empty #headlineEmpty,
body.alt-editor-layout #headlineEmpty{
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  min-height:150px!important;
  margin:0!important;
  padding:24px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  text-align:center!important;
}
body.alt-editor-layout #headlineEmpty strong,
body.alt-editor-layout #headlineEmpty p{
  width:100%!important;
  max-width:440px!important;
  margin:0 auto!important;
  padding:0!important;
  text-align:center!important;
}
body.alt-editor-layout #headlineEmpty strong{
  font-size:14px!important;
  line-height:20px!important;
  color:#0f172a!important;
}
body.alt-editor-layout #headlineEmpty p{
  display:block!important;
  font-size:13px!important;
  line-height:19px!important;
  color:#475569!important;
}
body.alt-editor-layout #headlineEmpty .headline-empty-actions{
  width:100%!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  flex-wrap:wrap!important;
  margin-top:4px!important;
}
body.alt-editor-layout #headlineEmpty .headline-empty-actions .btn{
  height:36px!important;
  min-height:36px!important;
  padding:0 12px!important;
}

@media(max-width:720px){
  body.alt-editor-layout .newsroom-image-empty,
  body.alt-editor-layout #headlineEmpty{
    min-height:0!important;
    padding:20px 16px!important;
  }
  body.alt-editor-layout .newsroom-image-empty-copy,
  body.alt-editor-layout #headlineEmpty strong,
  body.alt-editor-layout #headlineEmpty p{
    max-width:360px!important;
  }
}
/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_END */
'''

# Upgrade headline image empty state to the same two-action pattern used by image blocks.
headline_re = re.compile(
    r'<div class="headline-empty" id="headlineEmpty">.*?</div><img id="headlineImg"',
    flags=re.S,
)
headline_markup = (
    '<div class="headline-empty" id="headlineEmpty">'
    '<strong>Tambahkan Headline Image</strong>'
    '<p>Pilih image dari gallery atau upload file dari perangkat.</p>'
    '<div class="headline-empty-actions">'
    '<button class="btn primary sm" id="chooseHeadline" type="button"><i data-lucide="images"></i><span>Pilih dari Gallery</span></button>'
    '<button class="btn sm" id="uploadHeadline" type="button" onclick="document.getElementById(\'headlineFile\').value=\'\';document.getElementById(\'headlineFile\').click()"><i data-lucide="upload"></i><span>Upload Image</span></button>'
    '</div>'
    '</div><img id="headlineImg"'
)
text, count = headline_re.subn(headline_markup, text, count=1)
if count == 0 and 'id="uploadHeadline"' not in text:
    raise SystemExit('Could not locate headline empty-state markup')

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Centered image and headline image empty states applied.')
