from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

CSS_MARKER = '/* NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_START */'
JS_MARKER = '// NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_JS_START'

if CSS_MARKER in text or JS_MARKER in text:
    print('Article image upload flow already applied.')
    raise SystemExit(0)

css = r'''/* NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_START */
body.alt-editor-layout #imageLibraryPopup.v62-upload-editing .v34-main{grid-template-columns:1fr!important}
body.alt-editor-layout #imageLibraryPopup.v62-upload-editing .v34-preview{display:none!important}
body.alt-editor-layout #imageLibraryPopup.v62-upload-editing #v61UploadPanel{display:block!important;min-height:0!important;padding:16px 18px!important;overflow:auto!important}
body.alt-editor-layout #imageLibraryPopup .v62-upload-editor[hidden]{display:none!important}
body.alt-editor-layout #imageLibraryPopup .v62-upload-editor{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,.8fr);gap:18px;align-items:start}
body.alt-editor-layout #imageLibraryPopup .v62-upload-preview{min-width:0}
body.alt-editor-layout #imageLibraryPopup .v62-upload-canvas{aspect-ratio:16/9;display:grid;place-items:center;overflow:hidden;border:1px solid var(--border);border-radius:10px;background:#0f172a}
body.alt-editor-layout #imageLibraryPopup .v62-upload-canvas canvas{display:block;width:100%!important;height:100%!important;object-fit:contain}
body.alt-editor-layout #imageLibraryPopup .v62-crop-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}
body.alt-editor-layout #imageLibraryPopup .v62-range{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--border);border-radius:9px;background:var(--soft)}
body.alt-editor-layout #imageLibraryPopup .v62-range label{margin:0;white-space:nowrap;font-size:12px;font-weight:600;color:var(--text2)}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]{width:100%;min-width:0;height:18px;margin:0;padding:0;border:0;background:transparent;box-shadow:none;appearance:none;-webkit-appearance:none;cursor:pointer;outline:none}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:var(--border)}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-6px;border:2px solid #fff;border-radius:50%;background:var(--orange);box-shadow:0 0 0 1px rgba(244,81,30,.22),0 2px 5px rgba(15,23,42,.16)}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]::-moz-range-track{height:4px;border:0;border-radius:999px;background:var(--border)}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]::-moz-range-progress{height:4px;border-radius:999px;background:var(--orange)}
body.alt-editor-layout #imageLibraryPopup .v62-range input[type="range"]::-moz-range-thumb{width:14px;height:14px;border:2px solid #fff;border-radius:50%;background:var(--orange)}
body.alt-editor-layout #imageLibraryPopup .v62-upload-details{min-width:0;border-left:1px solid var(--border);padding-left:18px}
body.alt-editor-layout #imageLibraryPopup .v62-upload-details-head{margin-bottom:14px}
body.alt-editor-layout #imageLibraryPopup .v62-upload-details-head strong{display:block;font-size:14px;color:var(--text)}
body.alt-editor-layout #imageLibraryPopup .v62-upload-details-head span{display:block;margin-top:3px;font-size:12px;line-height:17px;color:var(--muted)}
body.alt-editor-layout #imageLibraryPopup .v62-field{display:flex;flex-direction:column;gap:6px;margin-bottom:13px}
body.alt-editor-layout #imageLibraryPopup .v62-field>span{font-size:12px;font-weight:600;color:var(--text2)}
body.alt-editor-layout #imageLibraryPopup .v62-field input,
body.alt-editor-layout #imageLibraryPopup .v62-field textarea{width:100%;border:1px solid var(--input);border-radius:8px;background:#fff;color:var(--text);outline:0;font:inherit}
body.alt-editor-layout #imageLibraryPopup .v62-field input{height:40px;padding:0 12px}
body.alt-editor-layout #imageLibraryPopup .v62-field textarea{min-height:92px;padding:10px 12px;resize:vertical}
body.alt-editor-layout #imageLibraryPopup .v62-field input:focus,
body.alt-editor-layout #imageLibraryPopup .v62-field textarea:focus{border-color:#60a5fa;box-shadow:var(--focus)}
body.alt-editor-layout #imageLibraryPopup .v62-upload-back{height:34px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;color:var(--text2);font-size:12px;font-weight:600}
@media(max-width:860px){body.alt-editor-layout #imageLibraryPopup .v62-upload-editor{grid-template-columns:1fr}.v62-upload-details{border-left:0!important;padding-left:0!important;border-top:1px solid var(--border);padding-top:16px}.v62-crop-controls{grid-template-columns:1fr!important}.v62-range{grid-template-columns:88px minmax(0,1fr)!important}}
/* NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_END */
'''

style_end = text.rfind('</style>')
if style_end == -1:
    raise SystemExit('Closing </style> not found.')
text = text[:style_end] + css + '\n' + text[style_end:]

js = r'''<script>
// NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_JS_START
(function(){
  function init(){
    const popup=document.getElementById('imageLibraryPopup');
    const panel=document.getElementById('v61UploadPanel');
    const input=document.getElementById('v61UploadInput');
    const use=document.getElementById('v34Use');
    const targetText=document.getElementById('v34TargetText');
    if(!popup||!panel||!input||!use||panel.querySelector('.v62-upload-editor')) return;

    const drop=panel.querySelector('.v61-upload-drop');
    const editor=document.createElement('div');
    editor.className='v62-upload-editor';
    editor.hidden=true;
    editor.innerHTML=`
      <section class="v62-upload-preview">
        <div class="v62-upload-canvas"><canvas id="v62CropCanvas" width="1280" height="720"></canvas></div>
        <div class="v62-crop-controls">
          <div class="v62-range"><label for="v62CropZoom">Zoom</label><input id="v62CropZoom" type="range" min="1" max="3" step=".01" value="1"></div>
          <div class="v62-range"><label for="v62CropX">Horizontal</label><input id="v62CropX" type="range" min="0" max="100" value="50"></div>
          <div class="v62-range"><label for="v62CropY">Vertical</label><input id="v62CropY" type="range" min="0" max="100" value="50"></div>
        </div>
      </section>
      <aside class="v62-upload-details">
        <div class="v62-upload-details-head"><strong>Photo Details</strong><span>Atur crop dan lengkapi metadata sebelum image dimasukkan ke artikel.</span></div>
        <label class="v62-field"><span>Title</span><input id="v62PhotoTitle" type="text" placeholder="Tulis judul foto…"></label>
        <label class="v62-field"><span>Description</span><textarea id="v62PhotoDescription" rows="4" placeholder="Jelaskan konteks foto secara singkat…"></textarea></label>
        <label class="v62-field"><span>Copyright</span><input id="v62PhotoCopyright" type="text" placeholder="Fotografer / sumber / pemegang hak cipta…"></label>
        <button class="v62-upload-back" type="button" id="v62UploadBack">Pilih file lain</button>
      </aside>`;
    panel.appendChild(editor);

    const canvas=editor.querySelector('#v62CropCanvas');
    const ctx=canvas.getContext('2d');
    const zoom=editor.querySelector('#v62CropZoom');
    const posX=editor.querySelector('#v62CropX');
    const posY=editor.querySelector('#v62CropY');
    const title=editor.querySelector('#v62PhotoTitle');
    const desc=editor.querySelector('#v62PhotoDescription');
    const copyright=editor.querySelector('#v62PhotoCopyright');
    const back=editor.querySelector('#v62UploadBack');
    let image=null;
    let item=null;
    let originalMeta='';

    function currentUploadItem(file){
      const list=Array.isArray(window.MEDIA_LIBRARY)?window.MEDIA_LIBRARY:[];
      const base=file.name.replace(/\.[^.]+$/,'');
      return [...list].reverse().find(x=>x&&x.source==='upload'&&x.title===base) || [...list].reverse().find(x=>x&&x.source==='upload');
    }

    function syncItem(){
      if(!item) return;
      item.title=title.value.trim()||item.title||'Uploaded image';
      item.description=desc.value.trim();
      item.copyright=copyright.value.trim();
      const meta=[item.description,item.copyright?('© '+item.copyright):''].filter(Boolean).join(' · ');
      item.meta=meta||originalMeta||item.meta||'';
    }

    function draw(){
      if(!image||!item) return;
      const z=Number(zoom.value)||1;
      const x=(Number(posX.value)||50)/100;
      const y=(Number(posY.value)||50)/100;
      const base=Math.max(canvas.width/image.width,canvas.height/image.height);
      const scale=base*z;
      const w=image.width*scale;
      const h=image.height*scale;
      const dx=-Math.max(0,w-canvas.width)*x;
      const dy=-Math.max(0,h-canvas.height)*y;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(image,dx,dy,w,h);
      item.url=canvas.toDataURL('image/jpeg',.9);
      syncItem();
    }

    [zoom,posX,posY].forEach(el=>el.addEventListener('input',draw));
    [title,desc,copyright].forEach(el=>el.addEventListener('input',syncItem));

    function showEditor(file,dataUrl){
      let attempts=0;
      const wait=()=>{
        item=currentUploadItem(file);
        if(!item&&attempts++<40){setTimeout(wait,50);return}
        if(!item)return;
        originalMeta=item.meta||'';
        title.value=item.title||file.name.replace(/\.[^.]+$/,'');
        desc.value=item.description||'';
        copyright.value=item.copyright||'';
        zoom.value='1';posX.value='50';posY.value='50';
        image=new Image();
        image.onload=()=>{draw();drop.hidden=true;editor.hidden=false;popup.classList.add('v62-upload-editing');use.disabled=false;use.textContent='Simpan & Sisipkan ke Artikel';if(targetText)targetText.textContent='Atur crop dan lengkapi metadata sebelum image dimasukkan.'};
        image.src=dataUrl;
      };
      wait();
    }

    input.addEventListener('change',()=>{
      const file=input.files&&input.files[0];
      if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type)||file.size>10*1024*1024) return;
      const reader=new FileReader();
      reader.onload=()=>showEditor(file,String(reader.result||''));
      reader.readAsDataURL(file);
    });

    back.addEventListener('click',()=>{
      editor.hidden=true;drop.hidden=false;popup.classList.remove('v62-upload-editing');input.value='';use.disabled=true;use.textContent='Gunakan Image';if(targetText)targetText.textContent='Pilih file image terlebih dahulu.';
    });

    use.addEventListener('click',()=>{if(!editor.hidden){draw();syncItem()}},true);

    popup.querySelectorAll('[data-v61-mode]').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.dataset.v61Mode==='gallery'){
        popup.classList.remove('v62-upload-editing');editor.hidden=true;if(drop)drop.hidden=false;use.textContent='Gunakan Image';
      }else if(!editor.hidden){popup.classList.add('v62-upload-editing');use.textContent='Simpan & Sisipkan ke Artikel'}
    }));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});
  else setTimeout(init,0);
})();
// NEWSROOM_ARTICLE_IMAGE_UPLOAD_FLOW_JS_END
</script>
'''

body_end = text.rfind('</body>')
if body_end == -1:
    raise SystemExit('Closing </body> not found.')
text = text[:body_end] + js + '\n' + text[body_end:]

path.write_text(text, encoding='utf-8')
print('Applied article image upload crop and metadata flow.')
