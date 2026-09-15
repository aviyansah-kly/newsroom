from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_TOP_HEADER_REFINEMENT_START */'
end = '/* NEWSROOM_TOP_HEADER_REFINEMENT_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_TOP_HEADER_REFINEMENT_START */
/* Clear hierarchy: context | passive status | work tools | commit action. */
body.alt-editor-layout .topbar{
  height:64px!important;
  gap:8px!important;
  padding:0 16px!important;
  background:rgba(255,255,255,.98)!important;
}
body.alt-editor-layout .topbar .brand{
  min-width:auto!important;
  flex:none!important;
}
body.alt-editor-layout .topbar .brand img{
  width:102px!important;
  height:auto!important;
  border-radius:0!important;
  display:block!important;
}
body.alt-editor-layout .header-article-context{
  flex:0 1 330px!important;
  min-width:130px!important;
  padding-left:10px!important;
  border-left:1px solid #e2e8f0!important;
}
body.alt-editor-layout .header-article-title{
  display:block!important;
  font-size:13px!important;
  line-height:18px!important;
  font-weight:650!important;
  color:#0f172a!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
body.alt-editor-layout .header-article-meta{
  display:block!important;
  margin-top:1px!important;
  font-size:12px!important;
  line-height:16px!important;
  color:#64748b!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}

/* Autosave is passive feedback, so keep it light and compact. */
body.alt-editor-layout #saveStatus.save-indicator{
  height:34px!important;
  min-width:0!important;
  width:auto!important;
  padding:0 8px!important;
  gap:6px!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
body.alt-editor-layout #saveStatus .save-icon{
  width:18px!important;
  height:18px!important;
}
body.alt-editor-layout #saveStatus .save-icon svg{
  width:15px!important;
  height:15px!important;
}
body.alt-editor-layout #saveStatus .save-copy strong{
  font-size:12px!important;
  line-height:16px!important;
  font-weight:600!important;
}
body.alt-editor-layout #saveStatus .save-copy small{display:none!important}

/* Readiness remains the stronger status because it tells editors what still blocks publishing. */
body.alt-editor-layout #readyBtn.header-status-pill{
  height:34px!important;
  min-width:0!important;
  padding:0 10px!important;
  gap:6px!important;
  border-radius:999px!important;
}
body.alt-editor-layout #readyBtn .status-icon svg{
  width:15px!important;
  height:15px!important;
}
body.alt-editor-layout #readyBtn .status-copy strong{
  font-size:12px!important;
  line-height:16px!important;
  font-weight:650!important;
}
body.alt-editor-layout #readyBtn .status-copy small{display:none!important}

/* Writing View becomes an icon-sized preference control instead of a full text CTA. */
body.alt-editor-layout .writing-view-wrap{
  position:relative!important;
  flex:none!important;
}
body.alt-editor-layout .writing-view-btn{
  position:relative!important;
  width:38px!important;
  min-width:38px!important;
  height:36px!important;
  padding:0!important;
  gap:0!important;
  border:1px solid transparent!important;
  border-radius:8px!important;
  background:transparent!important;
  color:#475569!important;
}
body.alt-editor-layout .writing-view-btn:hover,
body.alt-editor-layout .writing-view-btn[aria-expanded="true"]{
  border-color:#e2e8f0!important;
  background:#f8fafc!important;
  color:#0f172a!important;
}
body.alt-editor-layout .writing-view-btn>span{display:none!important}
body.alt-editor-layout .writing-view-btn svg:first-child{
  width:17px!important;
  height:17px!important;
}
body.alt-editor-layout .writing-view-btn svg:last-child{
  position:absolute!important;
  right:3px!important;
  bottom:3px!important;
  display:block!important;
  width:9px!important;
  height:9px!important;
  padding:0!important;
  border-radius:999px!important;
  background:#fff!important;
  color:#64748b!important;
}
body.alt-editor-layout .writing-view-menu{
  top:42px!important;
  width:224px!important;
  padding:7px!important;
  border-radius:9px!important;
}
body.alt-editor-layout .writing-view-menu-head{
  padding:5px 6px 8px!important;
  margin-bottom:5px!important;
}
body.alt-editor-layout .writing-view-menu-head strong{
  font-size:12px!important;
  line-height:17px!important;
}
body.alt-editor-layout .writing-view-menu-head span{
  font-size:11px!important;
  line-height:16px!important;
}
body.alt-editor-layout .writing-pref-control-menu button{
  height:34px!important;
  grid-template-columns:24px 1fr!important;
  gap:7px!important;
  padding:0 7px!important;
  font-size:12px!important;
}
body.alt-editor-layout .font-sample{
  width:23px!important;
  height:23px!important;
  border-radius:5px!important;
}

/* Secondary work controls should not visually compete with Review & Publish. */
body.alt-editor-layout #focusBtn,
body.alt-editor-layout #previewBtn{
  height:36px!important;
  padding:0 10px!important;
  border-radius:8px!important;
  font-size:12px!important;
}
body.alt-editor-layout #focusBtn{
  border-color:transparent!important;
  color:#475569!important;
}
body.alt-editor-layout #previewBtn{
  border-color:#e2e8f0!important;
  color:#334155!important;
}
body.alt-editor-layout #focusBtn svg,
body.alt-editor-layout #previewBtn svg{
  width:15px!important;
  height:15px!important;
}
body.alt-editor-layout #publishBtn{
  height:38px!important;
  padding:0 13px!important;
  border-radius:8px!important;
  font-size:12px!important;
  font-weight:650!important;
}
body.alt-editor-layout #publishBtn svg{
  width:15px!important;
  height:15px!important;
}

/* Article Settings only appears when the adaptive layout needs it. */
body.alt-editor-layout #settingsDrawerBtn{
  height:36px!important;
  border-radius:8px!important;
}

@media(max-width:1320px){
  body.alt-editor-layout .topbar{gap:7px!important;padding:0 12px!important}
  body.alt-editor-layout .header-article-context{flex-basis:230px!important;max-width:250px!important}
  body.alt-editor-layout #focusBtn span{display:none!important}
  body.alt-editor-layout #focusBtn{width:36px!important;padding:0!important}
}
@media(max-width:1160px){
  body.alt-editor-layout .header-article-context{flex-basis:170px!important;max-width:190px!important}
  body.alt-editor-layout #previewBtn span{display:none!important}
  body.alt-editor-layout #previewBtn{width:36px!important;padding:0!important}
  body.alt-editor-layout .writing-view-btn{width:36px!important;min-width:36px!important}
}
@media(max-width:1000px){
  body.alt-editor-layout .header-article-context{display:none!important}
}
@media(max-width:900px){
  body.alt-editor-layout #saveStatus .save-copy{display:none!important}
  body.alt-editor-layout #saveStatus{width:32px!important;padding:0!important;justify-content:center!important}
}
/* NEWSROOM_TOP_HEADER_REFINEMENT_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

# Tooltip/accessible label for the compact icon control.
old = 'id="writingViewBtn" type="button" aria-expanded="false" aria-haspopup="true"'
new = 'id="writingViewBtn" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Writing View" title="Writing View"'
if old in text:
    text = text.replace(old, new, 1)
elif 'id="writingViewBtn"' not in text:
    raise SystemExit('Writing View button not found')

path.write_text(text, encoding='utf-8')
print('Top header refinement applied.')
