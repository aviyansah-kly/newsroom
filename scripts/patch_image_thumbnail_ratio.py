from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */'
end = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */
/* Force the actual rendered gallery card image to 3:2. The gallery markup renders
   the <img> directly inside .v34-card, so older wrapper-based selectors never applied. */
body.alt-editor-layout #imageLibraryPopup .v34-card > img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:3/2!important;
  object-fit:cover!important;
  background:#e2e8f0!important;
}

/* Keep selected state from visually shrinking the media area. */
body.alt-editor-layout #imageLibraryPopup .v34-card{
  align-self:start!important;
}

/* Keep the right-side preview consistent with the selected thumbnail ratio. */
body.alt-editor-layout #imageLibraryPopup .v34-preview-image img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:3/2!important;
  object-fit:cover!important;
}

@media(max-width:1100px){
  body.alt-editor-layout #imageLibraryPopup .v34-card > img,
  body.alt-editor-layout #imageLibraryPopup .v34-preview-image img{
    aspect-ratio:3/2!important;
  }
}
/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Image gallery thumbnail and preview ratio fixed to 3:2.')
