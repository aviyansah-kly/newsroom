from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */'
end = '/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

# Final image empty-state pattern:
# - hard override old v56 two-column composition
# - centered title/subtitle
# - actions on a dedicated row below, side by side
# - equal 24px gutters between the center canvas and fixed left/right panels
css = r'''/* NEWSROOM_IMAGE_PLACEHOLDER_LAYOUT_FIX_START */

/* Balance the center canvas against the fixed CMS menu (236px) and Article Settings (390px). */
body.alt-editor-layout .workspace{
  padding-left:260px!important;  /* 236 + 24 */
  padding-right:414px!important; /* 390 + 24 */
  column-gap:0!important;
}
body.alt-editor-layout.cms-sidebar-collapsed .workspace{
  padding-left:88px!important;   /* 64 + 24 */
  padding-right:414px!important;
}

body.alt-editor-layout .alt-content-card[data-type="image"] .alt-content-card-body{
  padding:16px!important;
}

/* IMPORTANT: selector intentionally matches v56 to beat the older 2-column !important rule. */
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty{
  width:100%!important;
  min-height:168px!important;
  padding:24px 18px!important;
  display:flex!important;
  grid-template-columns:none!important;
  grid-template-rows:none!important;
  grid-template-areas:none!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:0!important;
  text-align:center!important;
  background:#f8fafc!important;
  border:1px dashed #cbd5e1!important;
  border-radius:12px!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-icon{
  display:none!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy{
  grid-column:auto!important;
  grid-row:auto!important;
  grid-area:auto!important;
  position:static!important;
  inset:auto!important;
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
  padding:0!important;
  flex:none!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy strong,
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy span{
  display:block!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
  text-align:center!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy strong{
  font-size:15px!important;
  line-height:21px!important;
  font-weight:700!important;
  color:#0f172a!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy span{
  font-size:13px!important;
  line-height:19px!important;
  color:#475569!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-copy small{
  display:none!important;
}
body.alt-editor-layout .alt-content-card[data-type="image"] .v56-image-empty.newsroom-image-empty .newsroom-image-empty-actions{
  grid-column:auto!important;
  grid-row:auto!important;
  grid-area:auto!important;
  position:static!important;
  width:auto!important;
  max-width:100%!important;
  margin:16px auto 0!important;
  padding:0!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  flex-wrap:nowrap!important;
  text-align:center!important;
  flex:none!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button,
body.alt-editor-layout #headlineEmpty .headline-empty-actions .btn{
  width:auto!important;
  min-width:0!important;
  height:38px!important;
  min-height:38px!important;
  padding:0 12px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:7px!important;
  border-radius:8px!important;
  font-size:13px!important;
  line-height:1!important;
  font-weight:600!important;
  white-space:nowrap!important;
  flex:0 0 auto!important;
  box-shadow:none!important;
}
body.alt-editor-layout .newsroom-image-empty-actions button svg,
body.alt-editor-layout #headlineEmpty .headline-empty-actions .btn svg{
  width:15px!important;
  height:15px!important;
  stroke-width:2!important;
}
body.alt-editor-layout .newsroom-image-gallery-btn,
body.alt-editor-layout #headlineEmpty #chooseHeadline{
  background:#2563eb!important;
  border:1px solid #2563eb!important;
  color:#fff!important;
}
body.alt-editor-layout .newsroom-image-gallery-btn:hover,
body.alt-editor-layout #headlineEmpty #chooseHeadline:hover{
  background:#1d4ed8!important;
  border-color:#1d4ed8!important;
}
body.alt-editor-layout .newsroom-image-upload-btn,
body.alt-editor-layout #headlineEmpty #uploadHeadline{
  background:#fff!important;
  border:1px solid #cbd5e1!important;
  color:#334155!important;
}
body.alt-editor-layout .newsroom-image-upload-btn:hover,
body.alt-editor-layout #headlineEmpty #uploadHeadline:hover{
  background:#f1f5f9!important;
  border-color:#b8c4d4!important;
}

/* Headline Image: same centered hierarchy and button row. */
body.alt-editor-layout .headline-drop:not(.has-image) #headlineEmpty,
body.alt-editor-layout .headline-drop.v59-empty #headlineEmpty,
body.alt-editor-layout #headlineEmpty{
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  min-height:168px!important;
  margin:0!important;
  padding:24px 14px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:0!important;
  text-align:center!important;
}
body.alt-editor-layout #headlineEmpty strong,
body.alt-editor-layout #headlineEmpty p{
  width:100%!important;
  max-width:360px!important;
  margin:0 auto!important;
  padding:0!important;
  text-align:center!important;
}
body.alt-editor-layout #headlineEmpty strong{
  font-size:15px!important;
  line-height:21px!important;
  font-weight:700!important;
  color:#0f172a!important;
}
body.alt-editor-layout #headlineEmpty p{
  display:block!important;
  margin-top:4px!important;
  font-size:13px!important;
  line-height:19px!important;
  color:#475569!important;
}
body.alt-editor-layout #headlineEmpty .headline-empty-actions{
  width:auto!important;
  max-width:100%!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  flex-wrap:nowrap!important;
  margin:16px auto 0!important;
  padding:0!important;
}

/* General editor buttons: consistent radius/weight without forcing large widths. */
body.alt-editor-layout .btn{
  border-radius:8px!important;
  font-weight:600!important;
  gap:7px!important;
}
body.alt-editor-layout .btn:not(.sm){
  min-height:38px!important;
}
body.alt-editor-layout .btn.sm{
  min-height:34px!important;
  border-radius:8px!important;
}
body.alt-editor-layout .btn svg{
  flex:none!important;
}

@media(max-width:1320px){
  /* Article Settings becomes a drawer at compact widths; keep canvas padding symmetric. */
  body.alt-editor-layout .workspace,
  body.alt-editor-layout.cms-sidebar-collapsed .workspace{
    padding-right:24px!important;
  }
}
@media(max-width:1024px){
  body.alt-editor-layout .workspace,
  body.alt-editor-layout.cms-sidebar-collapsed .workspace{
    padding-left:24px!important;
    padding-right:24px!important;
  }
}
@media(max-width:720px){
  body.alt-editor-layout .newsroom-image-empty,
  body.alt-editor-layout #headlineEmpty{
    min-height:0!important;
    padding:22px 12px!important;
  }
  body.alt-editor-layout .newsroom-image-empty-copy,
  body.alt-editor-layout #headlineEmpty strong,
  body.alt-editor-layout #headlineEmpty p{
    max-width:330px!important;
  }
  body.alt-editor-layout .newsroom-image-empty-actions,
  body.alt-editor-layout #headlineEmpty .headline-empty-actions{
    gap:6px!important;
    margin-top:14px!important;
    flex-wrap:nowrap!important;
  }
  body.alt-editor-layout .newsroom-image-empty-actions button,
  body.alt-editor-layout #headlineEmpty .headline-empty-actions .btn{
    height:36px!important;
    min-height:36px!important;
    padding:0 10px!important;
    font-size:12px!important;
    gap:6px!important;
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
    '<button class="btn primary" id="chooseHeadline" type="button"><i data-lucide="images"></i><span>Pilih dari Gallery</span></button>'
    '<button class="btn" id="uploadHeadline" type="button" onclick="document.getElementById(\'headlineFile\').value=\'\';document.getElementById(\'headlineFile\').click()"><i data-lucide="upload"></i><span>Upload Image</span></button>'
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
print('Image empty-state stacking and editor gutters fixed.')
