from pathlib import Path
import re

p = Path('index.html')
s = p.read_text()

pattern = re.compile(
    r"  function emptyCard\(c\)\{const body=c\.querySelector\('\.alt-content-card-body'\);if\(!body\)return;body\.innerHTML='<div class=\\\"v34-image-empty v56-image-empty\\\">.*?if\(window\.lucide\)window\.lucide\.createIcons\(\)\}",
    re.S,
)

replacement = """  function emptyCard(c){
    const body=c.querySelector('.alt-content-card-body');if(!body)return;
    body.innerHTML='<div class=\"v34-image-empty v56-image-empty newsroom-image-empty\">'+
      '<div class=\"newsroom-image-empty-icon\"><i data-lucide=\"image-plus\"></i></div>'+
      '<div class=\"newsroom-image-empty-copy\"><strong>Tambahkan Image</strong><span>Pilih image dari gallery atau upload file dari perangkat.</span><small>Setelah image dipilih, Anda dapat melengkapi title, photographer, source, dan deskripsi image.</small></div>'+
      '<div class=\"newsroom-image-empty-actions\"><button type=\"button\" class=\"newsroom-image-gallery-btn\" data-v34-image-select><i data-lucide=\"images\"></i><span>Pilih dari Gallery</span></button><button type=\"button\" class=\"newsroom-image-upload-btn\" data-v34-image-upload><i data-lucide=\"upload\"></i><span>Upload Image</span></button></div>'+
    '</div>';
    body.querySelector('[data-v34-image-select]').onclick=e=>{e.preventDefault();open({type:'card',card:c})};
    body.querySelector('[data-v34-image-upload]').onclick=e=>{e.preventDefault();open({type:'card',card:c});setTimeout(()=>document.querySelector('#imageLibraryPopup [data-v61-mode=\"upload\"]')?.click(),0)};
    const foot=c.querySelector('.alt-content-card-foot');if(foot)foot.style.display='none';
    if(window.lucide)window.lucide.createIcons()
  }"""

s2, n = pattern.subn(replacement, s, count=1)
if n != 1:
    raise SystemExit(f'emptyCard replacement count={n}')
s = s2

needle = "function imageCard(c,i){const body=c.querySelector('.alt-content-card-body');if(!body)return;"
if needle not in s:
    raise SystemExit('imageCard insertion point not found')
s = s.replace(
    needle,
    needle + "const foot=c.querySelector('.alt-content-card-foot');if(foot)foot.style.display='';",
    1,
)

if 'NEWSROOM_IMAGE_BLOCK_REDESIGN_START' not in s:
    css = r'''
/* NEWSROOM_IMAGE_BLOCK_REDESIGN_START */
body.alt-editor-layout .alt-content-card[data-type="image"] .alt-content-card-body{padding:16px!important}
body.alt-editor-layout .newsroom-image-empty{min-height:184px!important;border:1px dashed #cbd5e1!important;border-radius:10px!important;background:#f8fafc!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;gap:12px!important;padding:24px!important}
body.alt-editor-layout .newsroom-image-empty-icon{width:40px!important;height:40px!important;border-radius:10px!important;display:grid!important;place-items:center!important;background:#fff!important;border:1px solid #e2e8f0!important;color:#475569!important}
body.alt-editor-layout .newsroom-image-empty-icon svg{width:20px!important;height:20px!important}
body.alt-editor-layout .newsroom-image-empty-copy{max-width:520px!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:4px!important}
body.alt-editor-layout .newsroom-image-empty-copy strong{font-size:14px!important;line-height:20px!important;color:#0f172a!important}
body.alt-editor-layout .newsroom-image-empty-copy span{font-size:13px!important;line-height:19px!important;color:#475569!important}
body.alt-editor-layout .newsroom-image-empty-copy small{font-size:12px!important;line-height:18px!important;color:#64748b!important}
body.alt-editor-layout .newsroom-image-empty-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;margin-top:2px!important}
body.alt-editor-layout .newsroom-image-empty-actions button{height:36px!important;border-radius:8px!important;padding:0 12px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;font-size:13px!important;font-weight:600!important}
body.alt-editor-layout .newsroom-image-empty-actions button svg{width:15px!important;height:15px!important}
body.alt-editor-layout .newsroom-image-gallery-btn{background:#2563eb!important;border:1px solid #2563eb!important;color:#fff!important}
body.alt-editor-layout .newsroom-image-gallery-btn:hover{background:#1d4ed8!important}
body.alt-editor-layout .newsroom-image-upload-btn{background:#fff!important;border:1px solid #cbd5e1!important;color:#334155!important}
body.alt-editor-layout .newsroom-image-upload-btn:hover{background:#f1f5f9!important}
@media(max-width:720px){body.alt-editor-layout .newsroom-image-empty{padding:20px 16px!important}body.alt-editor-layout .newsroom-image-empty-actions{width:100%!important}body.alt-editor-layout .newsroom-image-empty-actions button{flex:1 1 150px!important}}
/* NEWSROOM_IMAGE_BLOCK_REDESIGN_END */
'''
    if '</style></head>' not in s:
        raise SystemExit('style closing marker not found')
    s = s.replace('</style></head>', css + '</style></head>', 1)

p.write_text(s)
