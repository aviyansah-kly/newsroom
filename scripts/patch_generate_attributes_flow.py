from pathlib import Path
import re

path = Path('index.html')
text = path.read_text()
original = text

old_copy = """      '<div class=\"alt-ai-analyze-copy\"><strong>Selesai menulis?</strong><span>Analyze Article membantu mengisi metadata editorial dan SEO dari tulisan saat ini.</span></div>'+\
      '<button type=\"button\" class=\"alt-ai-analyze-btn\"><i data-lucide=\"sparkles\"></i><span>Analyze Article</span></button>';"""
new_copy = """      '<div class=\"alt-ai-analyze-copy\"><strong>Selesai menulis?</strong><span>Klik tombol Generate Attributes di samping untuk mempercepat pengisian atribut artikel.</span></div>'+\
      '<button type=\"button\" class=\"alt-ai-analyze-btn\"><i data-lucide=\"sparkles\"></i><span>Generate Attributes</span></button>';"""
if old_copy not in text:
    raise SystemExit('Analyze Article copy marker not found')
text = text.replace(old_copy, new_copy, 1)

old_mark = re.compile(r"""  function markField\(el\)\{\n    const host=el\?\.closest\('\.field,\.seo-field,\.alt-entity-picker,\.v58-category-editorial'\);\n    if\(!host\)return;\n    host\.classList\.add\('ai-suggested-field'\);\n    setTimeout\(\(\)=>host\.classList\.remove\('ai-suggested-field'\),2200\);\n  \}""")
new_mark = """  function markField(el){
    const host=el?.closest('.field,.seo-field,.alt-entity-picker,.v58-category-editorial');
    if(!host)return;
    host.classList.add('ai-suggested-field');
    if(host.dataset.aiMarkerBound!=='1'){
      const clear=e=>{if(e.isTrusted)host.classList.remove('ai-suggested-field')};
      host.addEventListener('input',clear,true);
      host.addEventListener('change',clear,true);
      host.addEventListener('click',e=>{if(e.isTrusted&&e.target.closest('button'))host.classList.remove('ai-suggested-field')},true);
      host.dataset.aiMarkerBound='1';
    }
  }"""
text, count = old_mark.subn(new_mark, text, count=1)
if count != 1:
    raise SystemExit(f'markField replacement count={count}')

render_pattern = re.compile(r"""    function render\(\)\{\n      current=deriveSuggestions\(\);.*?\n      review\.classList\.add\('open'\);\n    \}\n\n    wrap\.querySelector\('\.alt-ai-analyze-btn'\)\.onclick=render;""", re.S)
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

text = text.replace("content:'AI suggestion'!important;", "content:'AI Generated'!important;", 1)

# Keep the old review panel in DOM for backwards compatibility, but it should never appear in the new direct-fill flow.
css_marker = ".alt-ai-review-panel{\n  display:none;"
if css_marker not in text:
    raise SystemExit('AI review CSS marker not found')

if text == original:
    raise SystemExit('No changes applied')

path.write_text(text)
print('Generate Attributes flow patched successfully')
