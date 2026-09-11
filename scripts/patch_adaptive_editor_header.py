from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_ADAPTIVE_EDITOR_HEADER_START */'
end = '/* NEWSROOM_ADAPTIVE_EDITOR_HEADER_END */'

if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_ADAPTIVE_EDITOR_HEADER_START */
/* Priority-based adaptive header for real editor workspaces, browser zoom, and narrower laptop screens. */
body.alt-editor-layout .topbar{
  min-width:0!important;
}
body.alt-editor-layout .topbar>*{
  min-width:0;
}
body.alt-editor-layout .topbar .spacer{
  min-width:8px;
  flex:1 1 auto;
}
body.alt-editor-layout .header-article-context{
  flex:0 1 360px!important;
  min-width:120px!important;
}
body.alt-editor-layout #saveStatus,
body.alt-editor-layout #readyBtn,
body.alt-editor-layout .writing-view-wrap,
body.alt-editor-layout #settingsDrawerBtn,
body.alt-editor-layout #focusBtn,
body.alt-editor-layout #previewBtn,
body.alt-editor-layout #publishBtn{
  flex:none!important;
}

/* Autosave is critical information: never truncate it into meaningless text. */
body.alt-editor-layout #saveStatus{
  max-width:220px!important;
}
body.alt-editor-layout #saveStatus .save-copy strong{
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}

@media(max-width:1320px){
  body.alt-editor-layout .topbar{
    gap:10px!important;
    padding-left:14px!important;
    padding-right:14px!important;
  }
  body.alt-editor-layout .header-article-context{
    flex-basis:250px!important;
    max-width:280px!important;
  }
  body.alt-editor-layout .header-article-meta{
    display:none!important;
  }
  body.alt-editor-layout #readyBtn .status-copy small{
    display:none!important;
  }
  body.alt-editor-layout #focusBtn span{
    display:none!important;
  }
  body.alt-editor-layout #focusBtn{
    width:40px!important;
    padding:0!important;
  }
}

@media(max-width:1160px){
  body.alt-editor-layout .header-article-context{
    flex-basis:175px!important;
    max-width:210px!important;
  }
  body.alt-editor-layout #saveStatus{
    min-width:0!important;
    width:auto!important;
    padding-left:9px!important;
    padding-right:9px!important;
  }
  body.alt-editor-layout #saveStatus .save-copy{
    display:block!important;
  }
  body.alt-editor-layout .writing-view-btn span,
  body.alt-editor-layout #settingsDrawerBtn span,
  body.alt-editor-layout #previewBtn span{
    display:none!important;
  }
  body.alt-editor-layout .writing-view-btn,
  body.alt-editor-layout #settingsDrawerBtn,
  body.alt-editor-layout #previewBtn{
    width:40px!important;
    padding:0!important;
  }
  body.alt-editor-layout .writing-view-btn svg:last-child{
    display:none!important;
  }
}

@media(max-width:1000px){
  body.alt-editor-layout .header-article-context{
    display:none!important;
  }
  body.alt-editor-layout .topbar .spacer{
    min-width:4px!important;
  }
}

/* At narrow editor widths keep a short semantic autosave label. */
@media(max-width:900px){
  body.alt-editor-layout #saveStatus{
    width:auto!important;
    min-width:0!important;
    padding:0 9px!important;
  }
  body.alt-editor-layout #saveStatus .save-copy{
    display:block!important;
  }
  body.alt-editor-layout #saveStatus.saved .save-copy strong{
    font-size:0!important;
  }
  body.alt-editor-layout #saveStatus.saved .save-copy strong:after{
    content:'Tersimpan';
    font-size:12px;
  }
  body.alt-editor-layout #saveStatus.saving .save-copy strong{
    font-size:0!important;
  }
  body.alt-editor-layout #saveStatus.saving .save-copy strong:after{
    content:'Menyimpan…';
    font-size:12px;
  }
  body.alt-editor-layout #saveStatus.error .save-copy strong{
    font-size:0!important;
  }
  body.alt-editor-layout #saveStatus.error .save-copy strong:after{
    content:'Gagal simpan';
    font-size:12px;
  }
  body.alt-editor-layout #readyBtn .status-copy{
    display:none!important;
  }
  body.alt-editor-layout #readyBtn{
    width:40px!important;
    padding:0!important;
    justify-content:center!important;
  }
  body.alt-editor-layout .story-row{
    flex-wrap:wrap!important;
  }
  body.alt-editor-layout .story-meta-right{
    justify-content:flex-start!important;
  }
  body.alt-editor-layout .headline-fields{
    grid-template-columns:1fr!important;
  }
  body.alt-editor-layout .image-actions{
    max-width:calc(100% - 20px)!important;
    flex-wrap:wrap!important;
    justify-content:flex-end!important;
  }
}

/* Secondary controls yield before critical save/publish actions. */
@media(max-width:780px){
  body.alt-editor-layout .writing-view-wrap,
  body.alt-editor-layout #focusBtn{
    display:none!important;
  }
  body.alt-editor-layout .brand img{
    width:94px!important;
  }
  body.alt-editor-layout .topbar{
    gap:7px!important;
    padding-left:10px!important;
    padding-right:10px!important;
  }
  body.alt-editor-layout #publishBtn{
    padding-left:11px!important;
    padding-right:11px!important;
  }
}

@media(max-width:680px){
  body.alt-editor-layout #settingsDrawerBtn{
    display:inline-flex!important;
  }
  body.alt-editor-layout #publishBtn span{
    font-size:0!important;
  }
  body.alt-editor-layout #publishBtn span:after{
    content:'Publish';
    font-size:13px;
  }
}

/* Last-resort compact mode: preserve live status semantically while reducing visual width. */
@media(max-width:560px){
  body.alt-editor-layout .brand img{
    width:82px!important;
  }
  body.alt-editor-layout #saveStatus{
    position:relative!important;
    width:38px!important;
    min-width:38px!important;
    padding:0!important;
    justify-content:center!important;
  }
  body.alt-editor-layout #saveStatus .save-copy{
    position:absolute!important;
    width:1px!important;
    height:1px!important;
    padding:0!important;
    margin:-1px!important;
    overflow:hidden!important;
    clip:rect(0,0,0,0)!important;
    white-space:nowrap!important;
    border:0!important;
  }
  body.alt-editor-layout #previewBtn{
    display:none!important;
  }
}

/* Local horizontal containment for dense editor controls. */
body.alt-editor-layout .classic-toolbar,
body.alt-editor-layout .tabs{
  max-width:100%!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  overscroll-behavior-inline:contain;
}
/* NEWSROOM_ADAPTIVE_EDITOR_HEADER_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')

text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Newsroom adaptive editor header applied.')
