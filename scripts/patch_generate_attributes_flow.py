from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Keep the current Generate Attributes wording, but remain safe to run on older markup.
text = text.replace(
    'Analyze Article membantu mengisi metadata editorial dan SEO dari tulisan saat ini.',
    'Klik tombol Generate Attributes di samping untuk mempercepat pengisian atribut artikel.',
    1,
)
text = text.replace('<span>Analyze Article</span>', '<span>Generate Attributes</span>', 1)

# Upgrade generated-state behaviour. Tags use the existing custom header so there is
# only one visible title row; other fields keep the provenance badge beside their label.
mark_pattern = re.compile(
    r"  function markField\(el\)\{.*?\n  \}\n\n  function applyField\(key,value\)\{",
    re.S,
)
mark_replacement = """  function markField(el){
    const isTags=el?.id==='tagInput';
    const host=isTags
      ? (document.querySelector('#altEditorialTagsSection') || el?.closest('.field'))
      : el?.closest('.field,.seo-field,.alt-entity-picker,.v58-category-editorial');
    if(!host)return;

    const visualTarget=isTags
      ? (host.querySelector('.tag-wrap') || el?.closest('.tag-wrap') || host)
      : host;

    const clearAiState=()=>{
      host.classList.remove('ai-suggested-field','ai-just-generated');
      visualTarget?.classList.remove('ai-generated-surface');
      host.querySelector('.ai-origin-badge')?.remove();
    };

    host.classList.add('ai-suggested-field','ai-just-generated');
    visualTarget?.classList.add('ai-generated-surface');

    let badge=host.querySelector('.ai-origin-badge');
    if(!badge){
      badge=document.createElement('span');
      badge.className='ai-origin-badge';
      badge.innerHTML='<i data-lucide=\"sparkles\"></i><span>AI Generated</span>';

      if(isTags){
        const tagHead=host.querySelector('.alt-tag-head');
        const aiAction=tagHead?.querySelector('.alt-tag-ai');
        if(tagHead){
          if(aiAction)tagHead.insertBefore(badge,aiAction);
          else tagHead.appendChild(badge);
        }else host.prepend(badge);
      }else{
        const label=host.querySelector('label,.field-label,.alt-entity-picker-label,.v58-category-label');
        if(label)label.appendChild(badge);
        else host.prepend(badge);
      }
    }

    // Intro animation only. The purple provenance treatment remains until manual edit.
    window.setTimeout(()=>host.classList.remove('ai-just-generated'),1500);

    if(host.dataset.aiMarkerBound!=='1'){
      const clear=e=>{if(e.isTrusted)clearAiState()};
      host.addEventListener('input',clear,true);
      host.addEventListener('change',clear,true);
      host.addEventListener('click',e=>{
        if(!e.isTrusted)return;
        // Clicking the AI action itself is not a manual edit.
        if(e.target.closest('.alt-tag-ai'))return;
        if(e.target.closest('button'))clearAiState();
      },true);
      host.dataset.aiMarkerBound='1';
    }
    if(window.lucide)window.lucide.createIcons();
  }

  function applyField(key,value){"""
text, count = mark_pattern.subn(mark_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'markField replacement count={count}')

# If this file predates the direct-fill flow, upgrade it; otherwise preserve the current implementation.
if "['category','tags','seoKeyword'].forEach(key=>applyField(key,current[key]));" not in text:
    render_pattern = re.compile(
        r"    function render\(\)\{\n      current=deriveSuggestions\(\);.*?\n      review\.classList\.add\('open'\);\n    \}\n\n    wrap\.querySelector\('\.alt-ai-analyze-btn'\)\.onclick=render;",
        re.S,
    )
    render_replacement = """    function render(){
      current=deriveSuggestions();
      const button=wrap.querySelector('.alt-ai-analyze-btn');
      const label=button?.querySelector('span');
      if(button)button.disabled=true;
      if(label)label.textContent='Generating…';

      ['category','tags','seoKeyword'].forEach(key=>applyField(key,current[key]));
      review.classList.remove('open');
      if(typeof scheduleSave==='function')scheduleSave();
      if(typeof renderFast==='function')renderFast();
      if(typeof scheduleHeavyRender==='function')scheduleHeavyRender(80);

      if(label)label.textContent='Generated';
      window.setTimeout(()=>{
        if(label)label.textContent='Generate Attributes';
        if(button)button.disabled=false;
      },900);
    }

    wrap.querySelector('.alt-ai-analyze-btn').onclick=render;"""
    text, count = render_pattern.subn(render_replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'render replacement count={count}')

start = '/* NEWSROOM_AI_GENERATED_VISIBILITY_START */'
end = '/* NEWSROOM_AI_GENERATED_VISIBILITY_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_AI_GENERATED_VISIBILITY_START */
/* AI provenance uses purple so it cannot be confused with the normal blue focus state. */
body.alt-editor-layout .ai-suggested-field{outline:none!important}

/* Tags has one canonical title row: .alt-tag-head. Hide any legacy duplicated title. */
body.alt-editor-layout #altEditorialTagsSection>.settings-section-head,
body.alt-editor-layout #altEditorialTagsSection .field>label{
  display:none!important;
}
body.alt-editor-layout #altEditorialTagsSection .alt-tag-head{
  display:flex!important;
  align-items:center!important;
  gap:7px!important;
}
body.alt-editor-layout #altEditorialTagsSection .alt-tag-head>strong{
  margin-right:auto!important;
}

body.alt-editor-layout .ai-suggested-field>label,
body.alt-editor-layout .ai-suggested-field .field-label,
body.alt-editor-layout .ai-suggested-field .alt-entity-picker-label,
body.alt-editor-layout .ai-suggested-field .v58-category-label{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:8px!important;
}
body.alt-editor-layout .ai-origin-badge{
  min-height:22px!important;
  display:inline-flex!important;
  align-items:center!important;
  gap:4px!important;
  padding:2px 7px!important;
  border:1px solid #ddd6fe!important;
  border-radius:999px!important;
  background:linear-gradient(135deg,#faf5ff 0%,#f5f3ff 55%,#eef2ff 100%)!important;
  color:#6d28d9!important;
  font-size:11px!important;
  line-height:16px!important;
  font-weight:650!important;
  white-space:nowrap!important;
  flex:none!important;
}
body.alt-editor-layout .ai-origin-badge svg{width:12px!important;height:12px!important}

/* Persistent AI-generated surface. Purple is provenance; blue remains interaction/focus. */
body.alt-editor-layout .ai-suggested-field>input,
body.alt-editor-layout .ai-suggested-field>select,
body.alt-editor-layout .ai-suggested-field>textarea,
body.alt-editor-layout .ai-generated-surface,
body.alt-editor-layout .ai-suggested-field .alt-chip-input,
body.alt-editor-layout .ai-suggested-field .alt-entity-picker-control{
  border-color:#c4b5fd!important;
  background:linear-gradient(135deg,rgba(250,245,255,.92),rgba(245,243,255,.72),rgba(238,242,255,.82))!important;
  box-shadow:0 0 0 1px rgba(139,92,246,.10)!important;
}
body.alt-editor-layout .ai-suggested-field:focus-within>input,
body.alt-editor-layout .ai-suggested-field:focus-within>select,
body.alt-editor-layout .ai-suggested-field:focus-within>textarea,
body.alt-editor-layout .ai-suggested-field:focus-within .ai-generated-surface{
  border-color:#a78bfa!important;
  box-shadow:0 0 0 2px rgba(139,92,246,.13)!important;
}

/* One-time Gemini/AI-mode style arrival animation; provenance itself stays static. */
@keyframes newsroomAiArrival{
  0%{box-shadow:0 0 0 0 rgba(139,92,246,0);filter:saturate(.96)}
  28%{box-shadow:0 0 0 4px rgba(139,92,246,.11),0 0 22px rgba(99,102,241,.10);filter:saturate(1.08)}
  68%{box-shadow:0 0 0 2px rgba(167,139,250,.13),0 0 14px rgba(139,92,246,.07)}
  100%{box-shadow:0 0 0 1px rgba(139,92,246,.10);filter:none}
}
body.alt-editor-layout .ai-just-generated>input,
body.alt-editor-layout .ai-just-generated>select,
body.alt-editor-layout .ai-just-generated>textarea,
body.alt-editor-layout .ai-just-generated .ai-generated-surface,
body.alt-editor-layout .ai-just-generated .alt-chip-input,
body.alt-editor-layout .ai-just-generated .alt-entity-picker-control{
  animation:newsroomAiArrival 1.35s ease-out 1!important;
}
@media(prefers-reduced-motion:reduce){
  body.alt-editor-layout .ai-just-generated>input,
  body.alt-editor-layout .ai-just-generated>select,
  body.alt-editor-layout .ai-just-generated>textarea,
  body.alt-editor-layout .ai-just-generated .ai-generated-surface,
  body.alt-editor-layout .ai-just-generated .alt-chip-input,
  body.alt-editor-layout .ai-just-generated .alt-entity-picker-control{animation:none!important}
}

/* Disable older trailing captions so provenance is represented only once. */
body.alt-editor-layout .ai-suggested-field:after{content:none!important;display:none!important}
/* NEWSROOM_AI_GENERATED_VISIBILITY_END */
'''
idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

path.write_text(text, encoding='utf-8')
print('Generate Attributes AI provenance refined with single Tags title and purple arrival state.')
