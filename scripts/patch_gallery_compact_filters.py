from pathlib import Path
import re

path=Path('index.html')
text=path.read_text(encoding='utf-8')

CSTART='/* NEWSROOM_GALLERY_COMPACT_FILTER_START */'
CEND='/* NEWSROOM_GALLERY_COMPACT_FILTER_END */'
JSTART='// NEWSROOM_GALLERY_COMPACT_FILTER_JS_START'
JEND='// NEWSROOM_GALLERY_COMPACT_FILTER_JS_END'

if CSTART in text and CEND in text:
    text=re.sub(re.escape(CSTART)+r'.*?'+re.escape(CEND), '', text, flags=re.S)
if JSTART in text and JEND in text:
    text=re.sub(r'<script>\s*'+re.escape(JSTART)+r'.*?'+re.escape(JEND)+r'\s*</script>', '', text, flags=re.S)

css=r'''/* NEWSROOM_GALLERY_COMPACT_FILTER_START */
body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
  display:grid!important;
  grid-template-columns:auto minmax(260px,1fr) auto 170px 124px!important;
  grid-template-rows:42px!important;
  gap:8px!important;
  align-items:center!important;
  padding:12px 18px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-tabs{
  grid-column:1!important;grid-row:1!important;
  height:42px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-search{
  grid-column:2!important;grid-row:1!important;min-width:0!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment{
  grid-column:3!important;grid-row:1!important;
  height:38px!important;
  display:inline-flex!important;
  align-items:center!important;
  gap:2px!important;
  padding:3px!important;
  border:1px solid #cbd5e1!important;
  border-radius:8px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment button{
  width:31px!important;height:30px!important;min-width:31px!important;
  display:grid!important;place-items:center!important;
  padding:0!important;border:0!important;border-radius:6px!important;
  background:transparent!important;color:#64748b!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment button:hover{
  background:#f1f5f9!important;color:#0f172a!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment button.active{
  background:#eff6ff!important;color:#2563eb!important;
  box-shadow:inset 0 0 0 1px #bfdbfe!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment svg{
  width:15px!important;height:15px!important;stroke-width:2!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryOrientationFilter{
  position:absolute!important;
  width:1px!important;height:1px!important;
  overflow:hidden!important;
  clip:rect(0 0 0 0)!important;
  white-space:nowrap!important;
  opacity:0!important;
  pointer-events:none!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters{
  display:contents!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter{
  grid-column:4!important;grid-row:1!important;
  width:100%!important;min-width:0!important;height:42px!important;
}
body.alt-editor-layout #imageLibraryPopup #v34Sort{
  grid-column:5!important;grid-row:1!important;
  width:100%!important;min-width:0!important;height:42px!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter,
body.alt-editor-layout #imageLibraryPopup #v34Sort{
  appearance:none!important;
  -webkit-appearance:none!important;
  padding-right:34px!important;
  background-color:#fff!important;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")!important;
  background-repeat:no-repeat!important;
  background-position:right 10px center!important;
  background-size:16px 16px!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter:focus,
body.alt-editor-layout #imageLibraryPopup #v34Sort:focus{
  border-color:#3b82f6!important;
  box-shadow:0 0 0 3px rgba(59,130,246,.10)!important;
  outline:0!important;
}

/* Tablet: keep search prominent, filters move to a controlled second row. */
@media(max-width:1050px){
  body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
    grid-template-columns:auto minmax(240px,1fr) 124px!important;
    grid-template-rows:42px 38px!important;
  }
  body.alt-editor-layout #imageLibraryPopup .v34-tabs{grid-column:1!important;grid-row:1!important}
  body.alt-editor-layout #imageLibraryPopup .v34-search{grid-column:2!important;grid-row:1!important}
  body.alt-editor-layout #imageLibraryPopup #v34Sort{grid-column:3!important;grid-row:1!important}
  body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment{grid-column:1!important;grid-row:2!important}
  body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter{grid-column:2!important;grid-row:2!important;width:190px!important}
}

/* Mobile: no cramped one-line controls; preserve clear scan order. */
@media(max-width:720px){
  body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
    display:grid!important;
    grid-template-columns:1fr auto!important;
    grid-template-rows:auto auto auto!important;
    gap:8px!important;
  }
  body.alt-editor-layout #imageLibraryPopup .v34-tabs{
    grid-column:1/-1!important;grid-row:1!important;width:100%!important;
  }
  body.alt-editor-layout #imageLibraryPopup .v34-tabs button{flex:1!important}
  body.alt-editor-layout #imageLibraryPopup .v34-search{
    grid-column:1/-1!important;grid-row:2!important;width:100%!important;
  }
  body.alt-editor-layout #imageLibraryPopup .newsroom-orientation-segment{
    grid-column:1!important;grid-row:3!important;
  }
  body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter{
    grid-column:2!important;grid-row:3!important;
    width:min(180px,42vw)!important;
  }
  body.alt-editor-layout #imageLibraryPopup #v34Sort{
    position:absolute!important;
    top:76px!important;right:18px!important;
    width:116px!important;
  }
}
/* NEWSROOM_GALLERY_COMPACT_FILTER_END */'''

js=r'''<script>
// NEWSROOM_GALLERY_COMPACT_FILTER_JS_START
(function(){
  function enhance(){
    const popup=document.getElementById('imageLibraryPopup');
    const select=popup?.querySelector('#newsroomGalleryOrientationFilter');
    if(!popup||!select||popup.querySelector('.newsroom-orientation-segment'))return;
    const wrap=document.createElement('div');
    wrap.className='newsroom-orientation-segment';
    wrap.setAttribute('role','group');
    wrap.setAttribute('aria-label','Filter orientasi image');
    const options=[
      ['', 'layout-grid', 'Semua orientasi'],
      ['Landscape','rectangle-horizontal','Landscape'],
      ['Vertical','rectangle-vertical','Vertical'],
      ['Square','square','Square']
    ];
    options.forEach(([value,icon,label])=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.dataset.value=value;
      btn.title=label;
      btn.setAttribute('aria-label',label);
      btn.innerHTML='<i data-lucide="'+icon+'"></i>';
      btn.classList.toggle('active',select.value===value);
      btn.addEventListener('click',()=>{
        select.value=value;
        select.dispatchEvent(new Event('change',{bubbles:true}));
        wrap.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
      });
      wrap.appendChild(btn);
    });
    const parent=select.parentElement;
    if(parent) parent.insertBefore(wrap,select);
    if(window.lucide)window.lucide.createIcons();
  }
  document.addEventListener('click',()=>setTimeout(enhance,0),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
})();
// NEWSROOM_GALLERY_COMPACT_FILTER_JS_END
</script>'''

idx=text.rfind('</style>')
if idx<0: raise SystemExit('Closing style not found')
text=text[:idx]+css+'\n'+text[idx:]
body=text.rfind('</body>')
if body<0: raise SystemExit('Closing body not found')
text=text[:body]+js+'\n'+text[body:]
path.write_text(text,encoding='utf-8')
print('Applied compact one-line gallery filters with icon orientation control.')
