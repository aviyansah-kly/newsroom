from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

START='/* NEWSROOM_COMPACT_UNIFIED_IMAGE_MODAL_START */'
END='/* NEWSROOM_COMPACT_UNIFIED_IMAGE_MODAL_END */'

css=r'''/* NEWSROOM_COMPACT_UNIFIED_IMAGE_MODAL_START */
#newsroomUnifiedImageModal .newsroom-image-editor{
  width:min(1040px,calc(100vw - 32px))!important;
  max-height:calc(100vh - 32px)!important;
  display:flex!important;
  flex-direction:column!important;
  overflow:hidden!important;
}
#newsroomUnifiedImageModal .modal-head{
  min-height:54px!important;
  padding:12px 16px!important;
  flex:0 0 auto!important;
}
#newsroomUnifiedImageModal .newsroom-image-editor-body{
  display:grid!important;
  grid-template-columns:minmax(0,1.55fr) minmax(300px,.8fr)!important;
  gap:16px!important;
  min-height:0!important;
  overflow:hidden!important;
  padding:14px 16px!important;
}
#newsroomUnifiedImageModal .newsroom-image-preview{
  min-width:0!important;
  display:flex!important;
  flex-direction:column!important;
}
#newsroomUnifiedImageModal .newsroom-image-canvas{
  width:100%!important;
  max-height:46vh!important;
  aspect-ratio:16/9!important;
  border-radius:9px!important;
}
#newsroomUnifiedImageModal .newsroom-unified-canvas canvas{
  width:100%!important;
  height:100%!important;
  max-height:46vh!important;
}
#newsroomUnifiedImageModal .newsroom-crop-controls{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:8px!important;
  margin-top:8px!important;
}
#newsroomUnifiedImageModal .newsroom-crop-controls .range-field{
  min-height:36px!important;
  padding:6px 8px!important;
  column-gap:8px!important;
  border-radius:8px!important;
}
#newsroomUnifiedImageModal .newsroom-crop-controls .range-field label{
  font-size:11px!important;
  line-height:14px!important;
}
#newsroomUnifiedImageModal .newsroom-unified-context{
  margin-top:7px!important;
  font-size:11px!important;
  line-height:15px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-details{
  min-width:0!important;
  padding-left:16px!important;
  overflow:visible!important;
}
#newsroomUnifiedImageModal .newsroom-photo-details-head{
  margin-bottom:10px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-details-head strong{
  font-size:13px!important;
  line-height:18px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-details-head span{
  margin-top:2px!important;
  font-size:11px!important;
  line-height:15px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-field{
  gap:4px!important;
  margin-bottom:9px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-field>span{
  font-size:11px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-field input{
  height:36px!important;
  padding:0 10px!important;
  font-size:12px!important;
}
#newsroomUnifiedImageModal .newsroom-photo-field textarea{
  min-height:72px!important;
  max-height:92px!important;
  padding:8px 10px!important;
  font-size:12px!important;
  resize:vertical!important;
}
#newsroomUnifiedImageModal #newsroomUnifiedReplace{
  min-height:34px!important;
  height:34px!important;
  padding:0 10px!important;
  font-size:12px!important;
}
#newsroomUnifiedImageModal .newsroom-image-editor-foot{
  min-height:56px!important;
  padding:10px 16px!important;
  position:sticky!important;
  bottom:0!important;
  flex:0 0 auto!important;
  background:#fff!important;
  z-index:3!important;
}
#newsroomUnifiedImageModal .newsroom-image-editor-foot .btn{
  min-height:36px!important;
  height:36px!important;
  padding:0 12px!important;
  font-size:12px!important;
}
@media(max-width:860px){
  #newsroomUnifiedImageModal .newsroom-image-editor{max-height:calc(100vh - 20px)!important}
  #newsroomUnifiedImageModal .newsroom-image-editor-body{grid-template-columns:1fr!important;overflow:auto!important}
  #newsroomUnifiedImageModal .newsroom-image-canvas{max-height:none!important}
  #newsroomUnifiedImageModal .newsroom-photo-details{border-left:0!important;padding-left:0!important;border-top:1px solid var(--border)!important;padding-top:12px!important}
}
/* NEWSROOM_COMPACT_UNIFIED_IMAGE_MODAL_END */'''

if START in text and END in text:
    before=text.split(START,1)[0]
    after=text.split(END,1)[1]
    text=before+css+after
else:
    idx=text.rfind('</style>')
    if idx==-1:
        raise SystemExit('Closing </style> not found')
    text=text[:idx]+css+'\n'+text[idx:]

path.write_text(text,encoding='utf-8')
print('Applied compact unified image modal layout.')
