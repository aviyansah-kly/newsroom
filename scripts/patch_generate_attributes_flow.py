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

# Upgrade the generated-state behaviour: visible badge + field treatment, cleared on a real user edit.
mark_pattern = re.compile(
    r"  function markField\(el\)\{.*?\n  \}\n\n  function applyField\(key,value\)\{",
    re.S,
)
mark_replacement = """  function markField(el){
    const host=el?.closest('.field,.seo-field,.alt-entity-picker,.v58-category-editorial,.alt-editorial-tags-section');
    if(!host)return;

    const clearAiState=()=>{
      host.classList.remove('ai-suggested-field');
      host.querySelector('.ai-origin-badge')?.remove();
    };

    host.classList.add('ai-suggested-field');
    let badge=host.querySelector('.ai-origin-badge');
    if(!badge){
      badge=document.createElement('span');
      badge.className='ai-origin-badge';
      badge.innerHTML='<i data-lucide=\"sparkles\"></i><span>AI Generated</span>';
      const label=host.querySelector('label,.field-label,.alt-entity-picker-label,.v58-category-label');
      if(label)label.appendChild(badge);
      else host.prepend(badge);
    }

    if(host.dataset.aiMarkerBound!=='1'){
      const clear=e=>{if(e.isTrusted)clearAiState()};
      host.addEventListener('input',clear,true);
      host.addEventListener('change',clear,true);
      host.addEventListener('click',e=>{if(e.isTrusted&&e.target.closest('button'))clearAiState()},true);
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
/* AI provenance should be obvious at a glance without looking like an error state. */
body.alt-editor-layout .ai-suggested-field{
  outline:none!important;
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
  border:1px solid #bfdbfe!important;
  border-radius:999px!important;
  background:#eff6ff!important;
  color:#1d4ed8!important;
  font-size:11px!important;
  line-height:16px!important;
  font-weight:650!important;
  white-space:nowrap!important;
  flex:none!important;
}
body.alt-editor-layout .ai-origin-badge svg{
  width:12px!important;
  height:12px!important;
}
body.alt-editor-layout .ai-suggested-field>input,
body.alt-editor-layout .ai-suggested-field>select,
body.alt-editor-layout .ai-suggested-field>textarea,
body.alt-editor-layout .ai-suggested-field .tag-wrap,
body.alt-editor-layout .ai-suggested-field .alt-chip-input,
body.alt-editor-layout .ai-suggested-field .alt-entity-picker-control{
  border-color:#60a5fa!important;
  background:#f8fbff!important;
  box-shadow:0 0 0 2px rgba(37,99,235,.10)!important;
}
/* Disable the older low-visibility trailing caption when the new badge is present. */
body.alt-editor-layout .ai-suggested-field:after{
  content:none!important;
  display:none!important;
}
/* NEWSROOM_AI_GENERATED_VISIBILITY_END */
'''
idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

path.write_text(text, encoding='utf-8')
print('Generate Attributes AI provenance visibility upgraded.')
