from pathlib import Path
import re

path=Path('index.html')
text=path.read_text(encoding='utf-8')

START='/* NEWSROOM_GALLERY_UI_REFINEMENT_START */'
END='/* NEWSROOM_GALLERY_UI_REFINEMENT_END */'
if START in text and END in text:
    text=re.sub(re.escape(START)+r'.*?'+re.escape(END), '', text, flags=re.S)

css=r'''/* NEWSROOM_GALLERY_UI_REFINEMENT_START */
/* Image Gallery: one clear control bar on desktop. */
body.alt-editor-layout #imageLibraryPopup.v34-picker{
  width:min(1180px,calc(100vw - 32px))!important;
  height:min(760px,calc(100vh - 32px))!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-head{
  min-height:62px!important;
  padding:12px 18px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-title strong{
  font-size:15px!important;
  line-height:21px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-title span{
  margin-top:1px!important;
  font-size:12px!important;
  line-height:17px!important;
}
body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
  display:grid!important;
  grid-template-columns:auto minmax(320px,1fr) 132px!important;
  grid-template-rows:42px 38px!important;
  gap:8px 10px!important;
  align-items:center!important;
  padding:12px 18px!important;
  border-bottom:1px solid #e2e8f0!important;
  background:#f8fafc!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-tabs{
  height:42px!important;
  align-items:center!important;
  padding:4px!important;
  background:#eef2f7!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-tabs button{
  height:32px!important;
  padding:0 11px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-search{
  min-width:0!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-search input,
body.alt-editor-layout #imageLibraryPopup .v34-sort,
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-filter{
  height:42px!important;
  border-radius:8px!important;
  border-color:#cbd5e1!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-tabs{
  grid-column:1!important;
  grid-row:1!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-search{
  grid-column:2!important;
  grid-row:1!important;
}
body.alt-editor-layout #imageLibraryPopup #v34Sort{
  grid-column:3!important;
  grid-row:1!important;
  min-width:0!important;
  width:100%!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters{
  grid-column:1 / -1!important;
  grid-row:2!important;
  display:flex!important;
  align-items:center!important;
  gap:8px!important;
  min-width:0!important;
  margin:0!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters:before{
  content:'Filter'!important;
  flex:0 0 auto!important;
  margin-right:2px!important;
  font-size:11px!important;
  line-height:16px!important;
  font-weight:700!important;
  color:#64748b!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryOrientationFilter{
  width:150px!important;
  min-width:150px!important;
}
body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter{
  width:190px!important;
  min-width:190px!important;
}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-filter{
  height:38px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-main{
  grid-template-columns:minmax(0,1fr) 320px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-results{
  padding:15px 14px 14px 18px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-results-head{
  min-height:28px!important;
  margin-bottom:10px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-results-head strong{
  font-size:13px!important;
  font-weight:700!important;
  color:#0f172a!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-results-head span{
  display:inline-flex!important;
  align-items:center!important;
  min-height:24px!important;
  padding:0 8px!important;
  border-radius:999px!important;
  background:#f1f5f9!important;
  color:#64748b!important;
  font-size:11px!important;
  font-weight:600!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-grid{
  gap:12px!important;
  padding:1px 4px 18px 1px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card{
  border-radius:10px!important;
  transition:border-color .15s,box-shadow .15s,transform .15s!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card:hover{
  transform:translateY(-1px)!important;
  border-color:#94a3b8!important;
  box-shadow:0 7px 18px rgba(15,23,42,.08)!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-card.selected{
  border:1px solid #2563eb!important;
  outline:2px solid #2563eb!important;
  outline-offset:-2px!important;
  box-shadow:0 0 0 3px rgba(37,99,235,.12)!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview{
  position:relative!important;
  padding:48px 16px 16px!important;
  border-left:1px solid #eef2f7!important;
  background:#fbfcfe!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview:before{
  content:'Preview & Detail'!important;
  position:absolute!important;
  top:16px!important;
  left:16px!important;
  right:16px!important;
  font-size:12px!important;
  line-height:18px!important;
  font-weight:700!important;
  color:#334155!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-empty{
  min-height:300px!important;
  height:100%!important;
  border:1px dashed #dbe4ee!important;
  border-radius:10px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-preview-image{
  border-radius:10px!important;
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-detail-summary{
  background:#fff!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-foot{
  min-height:58px!important;
  padding:9px 18px!important;
}
body.alt-editor-layout #imageLibraryPopup .v34-foot>span{
  max-width:62%!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}

/* Global popup/modal close-button contract: icon-only in the top-right. */
body.alt-editor-layout .v34-close,
body.alt-editor-layout .modal-head>button:has([data-lucide="x"]),
body.alt-editor-layout .popup-head>button:has([data-lucide="x"]),
body.alt-editor-layout .alt-editorial-popover-head>button:has([data-lucide="x"]){
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  flex:0 0 34px!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  gap:0!important;
  border:1px solid #e2e8f0!important;
  border-radius:8px!important;
  background:#fff!important;
  color:#64748b!important;
  box-shadow:none!important;
}
body.alt-editor-layout .modal-head>button:has([data-lucide="x"]) span,
body.alt-editor-layout .popup-head>button:has([data-lucide="x"]) span,
body.alt-editor-layout .alt-editorial-popover-head>button:has([data-lucide="x"]) span{
  display:none!important;
}
body.alt-editor-layout .v34-close:hover,
body.alt-editor-layout .modal-head>button:has([data-lucide="x"]):hover,
body.alt-editor-layout .popup-head>button:has([data-lucide="x"]):hover,
body.alt-editor-layout .alt-editorial-popover-head>button:has([data-lucide="x"]):hover{
  border-color:#cbd5e1!important;
  background:#f1f5f9!important;
  color:#0f172a!important;
}
body.alt-editor-layout .v34-close svg,
body.alt-editor-layout .modal-head>button:has([data-lucide="x"]) svg,
body.alt-editor-layout .popup-head>button:has([data-lucide="x"]) svg,
body.alt-editor-layout .alt-editorial-popover-head>button:has([data-lucide="x"]) svg{
  width:16px!important;
  height:16px!important;
  margin:0!important;
}

/* Compact screens keep the same hierarchy: source/search/sort first, filters below. */
@media(max-width:1120px){
  body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
    grid-template-columns:auto minmax(220px,1fr) 124px!important;
  }
  body.alt-editor-layout #imageLibraryPopup #newsroomGalleryOrientationFilter{width:145px!important;min-width:145px!important}
  body.alt-editor-layout #imageLibraryPopup #newsroomGalleryChannelFilter{width:180px!important;min-width:180px!important}
}
@media(max-width:760px){
  body.alt-editor-layout #imageLibraryPopup.v34-picker{
    width:calc(100vw - 16px)!important;
    height:calc(100vh - 16px)!important;
  }
  body.alt-editor-layout #imageLibraryPopup #v61GalleryTools.v34-tools{
    display:flex!important;
    flex-wrap:wrap!important;
    height:auto!important;
  }
  body.alt-editor-layout #imageLibraryPopup .v34-tabs{width:100%!important}
  body.alt-editor-layout #imageLibraryPopup .v34-search{width:calc(100% - 132px)!important;flex:1 1 220px!important}
  body.alt-editor-layout #imageLibraryPopup .v34-sort{width:124px!important;flex:0 0 124px!important}
  body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters{
    width:100%!important;
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    gap:8px!important;
  }
  body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters:before{
    grid-column:1/-1!important;
    margin:0!important;
  }
  body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-filter{
    width:100%!important;
    min-width:0!important;
  }
}
/* NEWSROOM_GALLERY_UI_REFINEMENT_END */'''

idx=text.rfind('</style>')
if idx<0: raise SystemExit('Closing style not found')
text=text[:idx]+css+'\n'+text[idx:]
path.write_text(text,encoding='utf-8')
print('Applied gallery UI refinement and global icon-only close buttons.')
