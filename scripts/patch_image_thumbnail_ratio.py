from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */'
end = '/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_START */
/* Gallery cards are visual-only. Keep a real row/column gap and prevent grid rows
   from collapsing into one another. */
body.alt-editor-layout #imageLibraryPopup .v34-grid{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  grid-auto-rows:max-content!important;
  align-items:start!important;
  align-content:start!important;
  column-gap:14px!important;
  row-gap:14px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card{
  display:block!important;
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  align-self:start!important;
  overflow:hidden!important;
  border:1px solid #dbe4ee!important;
  border-radius:10px!important;
  background:#fff!important;
  box-shadow:none!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card.selected{
  border-color:#2563eb!important;
  outline:2px solid #2563eb!important;
  outline-offset:-2px!important;
  box-shadow:0 0 0 3px rgba(37,99,235,.12)!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card > img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  aspect-ratio:3/2!important;
  object-fit:cover!important;
  background:#e2e8f0!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card .v34-copy,
body.alt-editor-layout #imageLibraryPopup .v34-card .v59-media-copy{display:none!important}
body.alt-editor-layout #imageLibraryPopup .v34-check{top:8px!important;right:8px!important}
body.alt-editor-layout #imageLibraryPopup .v34-preview-image img{
  display:block!important;width:100%!important;height:auto!important;aspect-ratio:3/2!important;object-fit:cover!important
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy{padding-top:14px!important}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy > strong{display:block!important;margin:0 0 4px!important;font-size:15px!important;line-height:21px!important;color:#0f172a!important}
body.alt-editor-layout #imageLibraryPopup .v34-preview-copy > span{display:none!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-summary{margin-top:10px!important;padding:10px 11px!important;border:1px solid #e2e8f0!important;border-radius:9px!important;background:#f8fafc!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px 12px!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-item{min-width:0!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-item.full{grid-column:1/-1!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-item small{display:block!important;margin:0 0 2px!important;font-size:11px!important;line-height:16px!important;font-weight:600!important;color:#94a3b8!important;text-transform:uppercase!important;letter-spacing:.03em!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-item span{display:block!important;font-size:13px!important;line-height:18px!important;color:#334155!important;overflow-wrap:anywhere!important}
body.alt-editor-layout #imageLibraryPopup .v34-detail-badge{display:inline-flex!important;align-items:center!important;width:auto!important;min-height:24px!important;padding:2px 7px!important;border-radius:999px!important;background:#eff6ff!important;color:#1d4ed8!important;font-size:12px!important;font-weight:600!important}
@media(max-width:1100px){body.alt-editor-layout #imageLibraryPopup .v34-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:12px!important;row-gap:12px!important}}
/* NEWSROOM_IMAGE_THUMBNAIL_RATIO_FIX_END */
'''

# Only migrate the old compact preview function once. If the structured detail
# implementation is already present, leave it intact so this patch stays idempotent.
if 'v34-detail-summary' not in text[text.find('function preview(i)'):text.find('function preview(i)') + 5000]:
    preview_re = re.compile(r"function preview\(i\)\{const p=\$\('#v34Preview'\),u=\$\('#v34Use'\);.*?\}\n", flags=re.S)
    preview_fn = r'''function preview(i){
    const p=$('#v34Preview'),u=$('#v34Use');
    p.classList.toggle('has-selection',!!i);u.disabled=!i;if(!i)return;
    const im=$('#v34PreviewImg');im.src=src(i);safeImg(im,i);
    const all=data();const idx=Math.max(0,all.findIndex(x=>x.id===i.id));
    const usage=(idx*7+(i.source==='bank'?3:1))%28;
    const orientation=idx%5===1?'Square':'Landscape';
    const channel=i.source==='bank'?'Image Bank':'Liputan6.com';
    const author=['Achmad Dwi Afriyadi','Adhitya Warman','Dewi Divianta','Faizal Fanani'][idx%4];
    const age=idx%3===0?'1 Minggu yang lalu':idx%3===1?'3 Hari yang lalu':'2 Minggu yang lalu';
    const metaParts=(i.meta||'').split('·').map(x=>x.trim()).filter(Boolean);
    const sourceName=metaParts[0]||channel;
    const category=metaParts.slice(1).join(' · ')||'—';
    $('#v34PreviewTitle').textContent=i.title;$('#v34PreviewMeta').textContent='';
    const copy=p.querySelector('.v34-preview-copy');let detail=copy.querySelector('.v34-detail-summary');
    if(!detail){detail=document.createElement('div');detail.className='v34-detail-summary';copy.appendChild(detail)}
    detail.innerHTML='<div class="v34-detail-grid">'+'<div class="v34-detail-item full"><small>Sumber</small><span>'+esc(sourceName)+'</span></div>'+'<div class="v34-detail-item"><small>Channel</small><span>'+esc(channel)+'</span></div>'+'<div class="v34-detail-item"><small>Kategori</small><span>'+esc(category)+'</span></div>'+'<div class="v34-detail-item"><small>Dipakai</small><span class="v34-detail-badge">'+usage+' kali</span></div>'+'<div class="v34-detail-item"><small>Orientasi</small><span>'+esc(orientation)+'</span></div>'+'<div class="v34-detail-item"><small>Terakhir</small><span>'+esc(age)+'</span></div>'+'<div class="v34-detail-item full"><small>Kontributor</small><span>'+esc(author)+'</span></div>'+'</div>';
  }
'''
    text, count = preview_re.subn(preview_fn, text, count=1)
    if count == 0:
        print('Preview function already differs; keeping current implementation.')

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Image gallery spacing and selected-image detail panel refined.')
