from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */'
end = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */
/* Gallery cards should stay image-only. Metadata belongs in the right preview pane. */
body.alt-editor-layout #imageLibraryPopup .v34-grid{
  gap:14px!important;
  row-gap:14px!important;
  align-items:start!important;
  align-content:start!important;
  grid-auto-rows:auto!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card{
  position:relative!important;
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:3/2!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  align-self:start!important;
  overflow:hidden!important;
  border:1px solid #dbe4ee!important;
  border-radius:10px!important;
  background:#e2e8f0!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card.selected{
  border:3px solid #2563eb!important;
  box-shadow:0 0 0 2px rgba(37,99,235,.12)!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card > img{
  display:block!important;
  width:100%!important;
  height:100%!important;
  aspect-ratio:auto!important;
  object-fit:cover!important;
  background:#e2e8f0!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card .v34-copy,
body.alt-editor-layout #imageLibraryPopup .v34-card .v59-media-copy{
  display:none!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-check{
  right:8px!important;
  top:8px!important;
}

/* Selected image details live only in the right-hand preview. */
body.alt-editor-layout #imageLibraryPopup .v34-preview-image{
  overflow:hidden!important;
  aspect-ratio:3/2!important;
  border-radius:10px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-image img{
  display:block!important;
  width:100%!important;
  height:100%!important;
  aspect-ratio:auto!important;
  object-fit:cover!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy{
  padding-top:12px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy strong{
  display:block!important;
  font-size:14px!important;
  line-height:20px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy span{
  display:block!important;
  margin-top:4px!important;
  font-size:12px!important;
  line-height:18px!important;
  white-space:normal!important;
  overflow:visible!important;
  text-overflow:clip!important;
  color:#64748b!important;
}

@media(max-width:1100px){
  body.alt-editor-layout #imageLibraryPopup .v34-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:12px!important;
  }
}
/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */
'''

# Enrich the existing right-side preview with the metadata that used to live in cards.
preview_re = re.compile(
    r"function preview\(i\)\{const p=\$\('#v34Preview'\),u=\$\('#v34Use'\);p\.classList\.toggle\('has-selection',!!i\);u\.disabled=!i;if\(!i\)return;const im=\$\('#v34PreviewImg'\);im\.src=src\(i\);safeImg\(im,i\);\$\('#v34PreviewTitle'\)\.textContent=i\.title;\$\('#v34PreviewMeta'\)\.textContent=i\.meta\|\|''\}"
)
preview_js = "function preview(i){const p=$('#v34Preview'),u=$('#v34Use');p.classList.toggle('has-selection',!!i);u.disabled=!i;if(!i)return;const im=$('#v34PreviewImg');im.src=src(i);safeImg(im,i);const all=data(),idx=Math.max(0,all.findIndex(x=>x.id===i.id));const usage=(idx*7+(i.source==='bank'?3:1))%28;const orientation=idx%5===1?'square':'landscape';const channel=i.source==='bank'?'Image Bank':'Liputan6.com';const author=['Achmad Dwi Afriyadi','Adhitya Warman','Dewi Divianta','Faizal Fanani'][idx%4];const age=idx%3===0?'1 Minggu yang lalu':idx%3===1?'3 Hari yang lalu':'2 Minggu yang lalu';$('#v34PreviewTitle').textContent=i.title;$('#v34PreviewMeta').textContent=[i.meta||'',channel+' used ('+usage+')',orientation,age,author].filter(Boolean).join(' · ')}"
text, preview_count = preview_re.subn(preview_js, text, count=1)
if preview_count == 0:
    print('Warning: preview function pattern not replaced; CSS cleanup still applied.')

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Image gallery cards simplified to spaced 3:2 thumbnails; details moved to right preview.')
