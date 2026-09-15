from pathlib import Path
import re

path = Path('index.html')
text = path.read_text()
original = text

# Copy and CTA: keep the existing component/layout, only update the wording.
copy_old = 'Analyze Article membantu mengisi metadata editorial dan SEO dari tulisan saat ini.'
copy_new = 'Klik tombol Generate Attributes di samping untuk mempercepat pengisian atribut artikel.'
if copy_old not in text:
    raise SystemExit('Analyze Article helper copy not found')
text = text.replace(copy_old, copy_new, 1)

button_old = '<span>Analyze Article</span>'
button_new = '<span>Generate Attributes</span>'
if button_old not in text:
    raise SystemExit('Analyze Article button label not found')
text = text.replace(button_old, button_new, 1)

# Persist the AI marker until a real user edits/clicks the generated field.
mark_pattern = re.compile(
    r"  function markField\(el\)\{.*?\n  \}\n\n  function applyField\(key,value\)\{",
    re.S,
)
mark_replacement = """  function markField(el){
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
  }

  function applyField(key,value){"""
text, count = mark_pattern.subn(mark_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'markField replacement count={count}')

# Replace the two-step review panel behavior with direct fill into the intended fields only.
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

# Explicit but subtle source marker, based on the current design-system blue semantic state.
marker_old = "content:'AI suggestion'!important;"
marker_new = "content:'AI Generated'!important;"
if marker_old not in text:
    raise SystemExit('AI suggestion label not found')
text = text.replace(marker_old, marker_new, 1)

if text == original:
    raise SystemExit('No changes applied')

path.write_text(text)
print('Generate Attributes flow patched successfully')
