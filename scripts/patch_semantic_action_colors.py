from pathlib import Path
import re

# Semantic action hierarchy: orange=commit, blue=work, neutral=utility.
path = Path('index.html')
text = path.read_text(encoding='utf-8')

start = '/* NEWSROOM_SEMANTIC_ACTION_COLORS_START */'
end = '/* NEWSROOM_SEMANTIC_ACTION_COLORS_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_SEMANTIC_ACTION_COLORS_START */
:root{
  --action-commit:#f4511e;
  --action-commit-hover:#df4315;
  --action-work:#2563eb;
  --action-work-hover:#1d4ed8;
  --action-work-soft:#eff6ff;
  --action-neutral-bg:#fff;
  --action-neutral-text:#334155;
  --action-neutral-border:#cbd5e1;
}

/* Commit: final/confirm/publish action only. */
body.alt-editor-layout #publishBtn,
body.alt-editor-layout #v34Use,
body.alt-editor-layout .action-commit{
  background:var(--action-commit)!important;
  border-color:var(--action-commit)!important;
  color:#fff!important;
}
body.alt-editor-layout #publishBtn:hover,
body.alt-editor-layout #v34Use:hover,
body.alt-editor-layout .action-commit:hover{
  background:var(--action-commit-hover)!important;
  border-color:var(--action-commit-hover)!important;
}

/* Work: editorial actions and in-flow generation/selection. */
body.alt-editor-layout #chooseHeadline,
body.alt-editor-layout .newsroom-image-gallery-btn,
body.alt-editor-layout #seoGenerateAll,
body.alt-editor-layout #seoApplyAll,
body.alt-editor-layout .ai-btn,
body.alt-editor-layout .action-work{
  background:var(--action-work)!important;
  border-color:var(--action-work)!important;
  color:#fff!important;
}
body.alt-editor-layout #chooseHeadline:hover,
body.alt-editor-layout .newsroom-image-gallery-btn:hover,
body.alt-editor-layout #seoGenerateAll:hover,
body.alt-editor-layout #seoApplyAll:hover,
body.alt-editor-layout .ai-btn:hover,
body.alt-editor-layout .action-work:hover{
  background:var(--action-work-hover)!important;
  border-color:var(--action-work-hover)!important;
  color:#fff!important;
}

/* Neutral: utility actions stay visually quiet. */
body.alt-editor-layout #previewBtn,
body.alt-editor-layout #focusBtn,
body.alt-editor-layout #uploadHeadline,
body.alt-editor-layout .newsroom-image-upload-btn,
body.alt-editor-layout .action-neutral{
  background:var(--action-neutral-bg)!important;
  border-color:var(--action-neutral-border)!important;
  color:var(--action-neutral-text)!important;
}

/* Product interaction state is always blue, never orange. */
body.alt-editor-layout button:focus-visible,
body.alt-editor-layout input:focus-visible,
body.alt-editor-layout textarea:focus-visible,
body.alt-editor-layout select:focus-visible{
  outline:2px solid var(--action-work)!important;
  outline-offset:2px!important;
}
body.alt-editor-layout .v34-card.selected,
body.alt-editor-layout .tab.active,
body.alt-editor-layout [aria-selected="true"]{
  --selection-color:var(--action-work);
}
/* NEWSROOM_SEMANTIC_ACTION_COLORS_END */
'''

idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]
path.write_text(text, encoding='utf-8')
print('Semantic action colors applied: orange commit, blue work, neutral utility.')
