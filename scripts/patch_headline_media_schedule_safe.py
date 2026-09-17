from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

CSS_START = '/* NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_START */'
CSS_END = '/* NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_END */'
JS_MARKER = '// NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_JS_START'

css = r'''/* NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_START */
#cropModal .newsroom-image-editor{width:min(1120px,calc(100vw - 40px))!important;max-height:calc(100vh - 40px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
#cropModal .newsroom-image-editor .modal-head{flex:0 0 auto!important}
#cropModal .newsroom-image-editor-body{display:grid!important;grid-template-columns:minmax(0,1.65fr) minmax(280px,.75fr)!important;gap:20px!important;min-height:0!important;overflow:auto!important;padding:18px!important}
.newsroom-image-preview{min-width:0!important}
.newsroom-image-canvas{background:#0f172a;border:1px solid var(--border);border-radius:10px;overflow:hidden;aspect-ratio:16/9;display:grid;place-items:center}
.newsroom-image-canvas #cropCanvas{display:block;width:100%!important;height:100%!important;object-fit:contain}

/* Crop controls follow the same settings-card language as the rest of Newsroom. */
.newsroom-crop-controls{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;margin-top:12px!important}
.newsroom-crop-controls .range-field{display:flex!important;flex-direction:column!important;gap:9px!important;min-width:0!important;padding:11px 12px!important;border:1px solid var(--border)!important;border-radius:9px!important;background:var(--soft)!important}
.newsroom-crop-controls .range-field label{font-size:12px!important;line-height:16px!important;font-weight:600!important;color:var(--text2)!important}
.newsroom-crop-controls .range-field input[type="range"]{width:100%!important;height:18px!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;appearance:none!important;-webkit-appearance:none!important;cursor:pointer!important;outline:none!important}
.newsroom-crop-controls .range-field input[type="range"]::-webkit-slider-runnable-track{height:4px!important;border-radius:999px!important;background:var(--border)!important}
.newsroom-crop-controls .range-field input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none!important;width:16px!important;height:16px!important;margin-top:-6px!important;border:2px solid #fff!important;border-radius:50%!important;background:var(--orange)!important;box-shadow:0 0 0 1px rgba(244,81,30,.22),0 2px 5px rgba(15,23,42,.16)!important}
.newsroom-crop-controls .range-field input[type="range"]::-moz-range-track{height:4px!important;border:0!important;border-radius:999px!important;background:var(--border)!important}
.newsroom-crop-controls .range-field input[type="range"]::-moz-range-progress{height:4px!important;border-radius:999px!important;background:var(--orange)!important}
.newsroom-crop-controls .range-field input[type="range"]::-moz-range-thumb{width:14px!important;height:14px!important;border:2px solid #fff!important;border-radius:50%!important;background:var(--orange)!important;box-shadow:0 0 0 1px rgba(244,81,30,.22),0 2px 5px rgba(15,23,42,.16)!important}
.newsroom-crop-controls .range-field input[type="range"]:focus-visible{box-shadow:var(--focus)!important;border-radius:999px!important}
.newsroom-crop-controls .range-field:hover{border-color:var(--input)!important;background:#fff!important}

.newsroom-photo-details{min-width:0;border-left:1px solid var(--border);padding-left:20px}
.newsroom-photo-details-head{margin-bottom:16px}
.newsroom-photo-details-head strong{display:block;font-size:14px;line-height:20px;color:var(--text)}
.newsroom-photo-details-head span{display:block;margin-top:3px;font-size:12px;line-height:17px;color:var(--muted)}
.newsroom-photo-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.newsroom-photo-field>span{font-size:12px;font-weight:600;color:var(--text2)}
.newsroom-photo-field input,.newsroom-photo-field textarea{width:100%;border:1px solid var(--input);border-radius:8px;background:#fff;color:var(--text);outline:0;font:inherit}
.newsroom-photo-field input{height:40px;padding:0 12px}
.newsroom-photo-field textarea{min-height:96px;padding:10px 12px;resize:vertical}
.newsroom-photo-field input:focus,.newsroom-photo-field textarea:focus{border-color:#60a5fa;box-shadow:var(--focus)}
#cropModal .newsroom-image-editor-foot{position:sticky!important;bottom:0!important;flex:0 0 auto!important;background:#fff!important;z-index:2!important}
body.alt-editor-layout .newsroom-schedule-inline{margin:0 0 18px!important;padding:14px 0!important;border-top:1px solid var(--border)!important;border-bottom:1px solid var(--border)!important}
body.alt-editor-layout .newsroom-schedule-inline .settings-section-head{margin-bottom:10px!important}
@media(max-width:820px){#cropModal .newsroom-image-editor-body{grid-template-columns:1fr!important}.newsroom-photo-details{border-left:0;padding-left:0;border-top:1px solid var(--border);padding-top:16px}.newsroom-crop-controls{grid-template-columns:1fr!important}}
/* NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_END */'''

# If the safe patch is already live, update CSS only and leave all markup/logic untouched.
if CSS_START in text and CSS_END in text:
    text = re.sub(re.escape(CSS_START) + r'.*?' + re.escape(CSS_END), css, text, flags=re.S)
    path.write_text(text, encoding='utf-8')
    print('Refined crop controls with Newsroom design-system styling only.')
    raise SystemExit(0)

old_modal = '''<div class="modal" id="cropModal"><div class="modal-card"><div class="modal-head"><strong>Crop Headline 16:9</strong><button class="btn ghost" id="cropClose"><i data-lucide="x"></i><span>Tutup</span></button></div><div class="modal-body"><div style="background:#0f172a;border-radius:10px;overflow:hidden"><canvas id="cropCanvas" width="1280" height="720" style="width:100%;display:block"></canvas></div><div class="crop-grid"><div class="range-field"><label>Zoom</label><input id="cropZoom" type="range" min="1" max="3" step=".01" value="1"></div><div class="range-field"><label>Posisi Horizontal</label><input id="cropX" type="range" min="0" max="100" value="50"></div><div class="range-field"><label>Posisi Vertikal</label><input id="cropY" type="range" min="0" max="100" value="50"></div></div></div><div class="modal-foot"><button class="btn" id="cropReset"><i data-lucide="rotate-ccw"></i><span>Reset</span></button><button class="btn primary" id="cropApply"><i data-lucide="check"></i><span>Terapkan Crop</span></button></div></div></div>'''

new_modal = '''<div class="modal" id="cropModal"><div class="modal-card newsroom-image-editor"><div class="modal-head"><div><strong>Edit Headline Image</strong><div class="brand-sub">Atur crop dan lengkapi informasi foto.</div></div><button class="btn ghost" id="cropClose"><i data-lucide="x"></i><span>Tutup</span></button></div><div class="modal-body newsroom-image-editor-body"><section class="newsroom-image-preview"><div class="newsroom-image-canvas"><canvas id="cropCanvas" width="1280" height="720"></canvas></div><div class="crop-grid newsroom-crop-controls"><div class="range-field"><label>Zoom</label><input id="cropZoom" type="range" min="1" max="3" step=".01" value="1"></div><div class="range-field"><label>Horizontal</label><input id="cropX" type="range" min="0" max="100" value="50"></div><div class="range-field"><label>Vertical</label><input id="cropY" type="range" min="0" max="100" value="50"></div></div></section><aside class="newsroom-photo-details"><div class="newsroom-photo-details-head"><strong>Photo Details</strong><span>Lengkapi atribut foto sebelum digunakan di artikel.</span></div><label class="newsroom-photo-field"><span>Title</span><input id="uploadPhotoTitle" type="text" placeholder="Tulis judul foto…"></label><label class="newsroom-photo-field"><span>Description</span><textarea id="uploadPhotoDescription" rows="4" placeholder="Jelaskan konteks foto secara singkat…"></textarea></label><label class="newsroom-photo-field"><span>Copyright</span><input id="uploadPhotoCopyright" type="text" placeholder="Fotografer / sumber / pemegang hak cipta…"></label></aside></div><div class="modal-foot newsroom-image-editor-foot"><button class="btn" id="cropReset"><i data-lucide="rotate-ccw"></i><span>Reset</span></button><button class="btn primary" id="cropApply"><i data-lucide="check"></i><span>Simpan &amp; Gunakan Foto</span></button></div></div></div>'''

if old_modal not in text:
    raise SystemExit('Crop modal anchor not found; aborting without changing index.html.')
text = text.replace(old_modal, new_modal, 1)

style_end = text.rfind('</style>')
if style_end == -1:
    raise SystemExit('Closing </style> not found; aborting.')
text = text[:style_end] + css + '\n' + text[style_end:]

js = r'''<script>
// NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_JS_START
(function(){
  function placeSchedule(){
    const info=document.getElementById('infoPane');
    const headline=info?.querySelector('.headline') || document.querySelector('aside.context .headline');
    const timing=document.querySelector('#publishPane .publish-timing');
    if(!info || !headline || !timing) return;
    timing.classList.add('newsroom-schedule-inline');
    if(timing.previousElementSibling!==headline) headline.insertAdjacentElement('afterend',timing);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',placeSchedule,{once:true});
  else placeSchedule();
})();
// NEWSROOM_HEADLINE_MEDIA_SCHEDULE_SAFE_JS_END
</script>
'''
body_end = text.rfind('</body>')
if body_end == -1:
    raise SystemExit('Closing </body> not found; aborting.')
text = text[:body_end] + js + '\n' + text[body_end:]

path.write_text(text, encoding='utf-8')
print('Applied isolated headline image editor and Schedule Publication placement.')
