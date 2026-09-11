from pathlib import Path

p=Path('index.html')
s=p.read_text()
marker='NEWSROOM_EDITOR_CONSISTENCY_V67_START'
if marker not in s:
    css=r'''
/* NEWSROOM_EDITOR_CONSISTENCY_V67_START */
/* Balance the editor canvas and Article Settings spacing. */
body.alt-editor-layout .workspace{column-gap:18px!important}
body.alt-editor-layout .paper{font-size:13px!important}
body.alt-editor-layout .context,
body.alt-editor-layout .context .panel,
body.alt-editor-layout .context .field,
body.alt-editor-layout .context .field label,
body.alt-editor-layout .context .setting-help,
body.alt-editor-layout .context .alt-inline-help,
body.alt-editor-layout .context input,
body.alt-editor-layout .context select,
body.alt-editor-layout .context textarea,
body.alt-editor-layout .context button{font-size:13px!important}
body.alt-editor-layout .alt-content-card-body,
body.alt-editor-layout .alt-content-card-foot,
body.alt-editor-layout .alt-card-field label,
body.alt-editor-layout .alt-card-field input,
body.alt-editor-layout .alt-card-field textarea,
body.alt-editor-layout .alt-card-field select{font-size:13px!important}

/* Validation cards need the same rhythm as the rest of the settings panel. */
body.alt-editor-layout #validationPane,
body.alt-editor-layout #paneValidation,
body.alt-editor-layout .validation-pane,
body.alt-editor-layout [data-pane="validation"],
body.alt-editor-layout [data-pane="validasi"]{display:flex;flex-direction:column;gap:10px}
body.alt-editor-layout #validationPane>*,
body.alt-editor-layout #paneValidation>*,
body.alt-editor-layout .validation-pane>*,
body.alt-editor-layout [data-pane="validation"]>*,
body.alt-editor-layout [data-pane="validasi"]>*{margin-top:0!important;margin-bottom:0!important}
body.alt-editor-layout .validation-card,
body.alt-editor-layout .guardian-card,
body.alt-editor-layout .validation-item,
body.alt-editor-layout .guardian-item{margin:0 0 10px!important}
body.alt-editor-layout .validation-card:last-child,
body.alt-editor-layout .guardian-card:last-child,
body.alt-editor-layout .validation-item:last-child,
body.alt-editor-layout .guardian-item:last-child{margin-bottom:0!important}

/* Image content empty state: one clear hierarchy and centered actions. */
body.alt-editor-layout .alt-content-card[data-type="image"] .alt-content-card-body{padding:16px!important}
body.alt-editor-layout .newsroom-image-empty{min-height:190px!important;padding:24px 28px!important;display:grid!important;grid-template-columns:48px minmax(0,1fr)!important;grid-template-areas:'icon copy' 'actions actions'!important;align-items:center!important;justify-items:start!important;column-gap:14px!important;row-gap:16px!important;text-align:left!important;background:#f8fafc!important;border:1px dashed #cbd5e1!important;border-radius:10px!important}
body.alt-editor-layout .newsroom-image-empty-icon{grid-area:icon!important;width:42px!important;height:42px!important}
body.alt-editor-layout .newsroom-image-empty-copy{grid-area:copy!important;max-width:none!important;align-items:flex-start!important;text-align:left!important;gap:4px!important}
body.alt-editor-layout .newsroom-image-empty-copy strong{font-size:14px!important}
body.alt-editor-layout .newsroom-image-empty-copy span{font-size:13px!important}
body.alt-editor-layout .newsroom-image-empty-copy small{font-size:12px!important;max-width:520px!important}
body.alt-editor-layout .newsroom-image-empty-actions{grid-area:actions!important;width:100%!important;justify-content:flex-start!important;margin:0!important;padding-left:56px!important}
body.alt-editor-layout .newsroom-image-empty-actions button{font-size:13px!important}
@media(max-width:720px){body.alt-editor-layout .newsroom-image-empty{grid-template-columns:1fr!important;grid-template-areas:'icon' 'copy' 'actions'!important;justify-items:center!important;text-align:center!important}body.alt-editor-layout .newsroom-image-empty-copy{align-items:center!important;text-align:center!important}body.alt-editor-layout .newsroom-image-empty-actions{padding-left:0!important;justify-content:center!important}}

/* Media gallery: larger 3:2 thumbnails and a true upload-only state. */
body.alt-editor-layout #imageLibraryPopup .v34-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
body.alt-editor-layout #imageLibraryPopup .v34-card img,
body.alt-editor-layout #imageLibraryPopup .v34-thumb img,
body.alt-editor-layout #imageLibraryPopup .v34-media-thumb img,
body.alt-editor-layout #imageLibraryPopup .v59-media-thumb img{width:100%!important;height:100%!important;object-fit:cover!important}
body.alt-editor-layout #imageLibraryPopup .v34-card .v34-thumb,
body.alt-editor-layout #imageLibraryPopup .v34-thumb,
body.alt-editor-layout #imageLibraryPopup .v34-media-thumb,
body.alt-editor-layout #imageLibraryPopup .v59-media-thumb{aspect-ratio:3/2!important;height:auto!important;min-height:0!important;overflow:hidden!important}
body.alt-editor-layout #imageLibraryPopup #v34Grid[hidden],
body.alt-editor-layout #imageLibraryPopup #v61GalleryTools[hidden],
body.alt-editor-layout #imageLibraryPopup #v61ResultsHead[hidden]{display:none!important}
body.alt-editor-layout #imageLibraryPopup #v61UploadPanel[hidden]{display:none!important}
body.alt-editor-layout #imageLibraryPopup #v61UploadPanel:not([hidden]){display:flex!important;flex:1!important;align-items:center!important;justify-content:center!important;min-height:360px!important;padding:28px!important}
body.alt-editor-layout #imageLibraryPopup .v61-upload-drop{width:min(560px,100%)!important;min-height:240px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:9px!important;border:1px dashed #94a3b8!important;border-radius:12px!important;background:#f8fafc!important;text-align:center!important}
body.alt-editor-layout #imageLibraryPopup .v61-upload-drop strong{font-size:14px!important}
body.alt-editor-layout #imageLibraryPopup .v61-upload-drop span,
body.alt-editor-layout #imageLibraryPopup .v61-upload-drop em{font-size:13px!important}
@media(max-width:1100px){body.alt-editor-layout #imageLibraryPopup .v34-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
/* NEWSROOM_EDITOR_CONSISTENCY_V67_END */
'''
    if '</style></head>' not in s:
        raise SystemExit('style closing marker not found')
    s=s.replace('</style></head>',css+'</style></head>',1)
p.write_text(s)
