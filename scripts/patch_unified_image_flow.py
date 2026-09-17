from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

MARKER = '// NEWSROOM_UNIFIED_IMAGE_FLOW_START'
if MARKER in text:
    print('Unified image flow already applied.')
    raise SystemExit(0)

# Route Gallery selections through one shared image editor instead of applying
# directly to headline/card/editor targets.
old_apply = "function apply(){const i=data().find(x=>x.id===selected);if(!i||!target)return;if(target.type==='headline')headline(i);else if(target.type==='card'&&target.card)imageCard(target.card,i);else if(target.type==='editor'){try{window.sixdeskTiptap?.chain().focus().setImage({src:src(i),alt:i.title,title:i.meta}).run()}catch(e){}}close()}"
new_apply = "function applyTarget(i,t){if(!i||!t)return;if(t.type==='headline')headline(i);else if(t.type==='card'&&t.card)imageCard(t.card,i);else if(t.type==='editor'){try{window.sixdeskTiptap?.chain().focus().setImage({src:src(i),alt:i.title,title:i.meta}).run()}catch(e){}}}window.newsroomMediaApplyTarget=applyTarget;function apply(){const i=data().find(x=>x.id===selected);if(!i||!target)return;const nextTarget=target;close();if(window.newsroomOpenUnifiedImageEditor){window.newsroomOpenUnifiedImageEditor(i,nextTarget);return}applyTarget(i,nextTarget)}"
if old_apply not in text:
    raise SystemExit('Gallery apply anchor not found; aborting.')
text = text.replace(old_apply, new_apply, 1)

# Keep the Gallery popup gallery-only. Upload is now always a direct device picker.
css = r'''<style>
/* NEWSROOM_UNIFIED_IMAGE_FLOW_STYLE_START */
body.alt-editor-layout #imageLibraryPopup .v61-primary-tabs,
body.alt-editor-layout #imageLibraryPopup #v61UploadPanel{display:none!important}
body.alt-editor-layout #imageLibraryPopup .v34-main{min-height:0!important}
#newsroomUnifiedImageModal{z-index:2200!important}
#newsroomUnifiedImageModal .newsroom-unified-canvas canvas{display:block;width:100%!important;height:100%!important;object-fit:contain}
#newsroomUnifiedImageModal .newsroom-unified-context{margin-top:10px;font-size:12px;color:var(--muted)}
/* NEWSROOM_UNIFIED_IMAGE_FLOW_STYLE_END */
</style>
'''
body_end = text.rfind('</body>')
if body_end == -1:
    raise SystemExit('Closing </body> not found.')
text = text[:body_end] + css + '\n' + text[body_end:]

js = r'''<script>
// NEWSROOM_UNIFIED_IMAGE_FLOW_START
(function(){
  let pendingTarget=null;
  let currentItem=null;
  let sourceImage=null;
  let originalUrl='';

  function esc(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}

  function ensureModal(){
    let modal=document.getElementById('newsroomUnifiedImageModal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.className='modal';
    modal.id='newsroomUnifiedImageModal';
    modal.innerHTML=`
      <div class="modal-card newsroom-image-editor">
        <div class="modal-head">
          <div><strong>Edit Image</strong><div class="brand-sub">Atur crop dan lengkapi informasi foto sebelum digunakan.</div></div>
          <button class="btn ghost" id="newsroomUnifiedClose" type="button"><i data-lucide="x"></i><span>Tutup</span></button>
        </div>
        <div class="modal-body newsroom-image-editor-body">
          <section class="newsroom-image-preview">
            <div class="newsroom-image-canvas newsroom-unified-canvas"><canvas id="newsroomUnifiedCanvas" width="1280" height="720"></canvas></div>
            <div class="crop-grid newsroom-crop-controls">
              <div class="range-field"><label>Zoom</label><input id="newsroomUnifiedZoom" type="range" min="1" max="3" step=".01" value="1"></div>
              <div class="range-field"><label>Horizontal</label><input id="newsroomUnifiedX" type="range" min="0" max="100" value="50"></div>
              <div class="range-field"><label>Vertical</label><input id="newsroomUnifiedY" type="range" min="0" max="100" value="50"></div>
            </div>
            <div class="newsroom-unified-context" id="newsroomUnifiedContext"></div>
          </section>
          <aside class="newsroom-photo-details">
            <div class="newsroom-photo-details-head"><strong>Photo Details</strong><span>Metadata yang sama digunakan untuk Headline maupun image di artikel.</span></div>
            <label class="newsroom-photo-field"><span>Title</span><input id="newsroomUnifiedTitle" type="text" placeholder="Tulis judul foto…"></label>
            <label class="newsroom-photo-field"><span>Description</span><textarea id="newsroomUnifiedDescription" rows="4" placeholder="Jelaskan konteks foto secara singkat…"></textarea></label>
            <label class="newsroom-photo-field"><span>Copyright</span><input id="newsroomUnifiedCopyright" type="text" placeholder="Fotografer / sumber / pemegang hak cipta…"></label>
            <button class="btn sm" id="newsroomUnifiedReplace" type="button"><i data-lucide="upload"></i><span>Pilih file lain</span></button>
          </aside>
        </div>
        <div class="modal-foot newsroom-image-editor-foot">
          <button class="btn" id="newsroomUnifiedReset" type="button"><i data-lucide="rotate-ccw"></i><span>Reset</span></button>
          <button class="btn primary" id="newsroomUnifiedApply" type="button"><i data-lucide="check"></i><span>Simpan &amp; Gunakan Image</span></button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector('#newsroomUnifiedClose').onclick=close;
    modal.querySelector('#newsroomUnifiedReset').onclick=()=>{if(originalUrl)loadImage(originalUrl,true)};
    modal.querySelector('#newsroomUnifiedReplace').onclick=()=>openFilePicker(pendingTarget);
    ['newsroomUnifiedZoom','newsroomUnifiedX','newsroomUnifiedY'].forEach(id=>modal.querySelector('#'+id).addEventListener('input',draw));
    modal.querySelector('#newsroomUnifiedApply').onclick=apply;
    if(window.lucide)window.lucide.createIcons();
    return modal;
  }

  function close(){document.getElementById('newsroomUnifiedImageModal')?.classList.remove('open')}

  function loadImage(url,reset=false){
    const modal=ensureModal();
    const img=new Image();
    img.onload=()=>{
      sourceImage=img;
      if(reset){modal.querySelector('#newsroomUnifiedZoom').value='1';modal.querySelector('#newsroomUnifiedX').value='50';modal.querySelector('#newsroomUnifiedY').value='50'}
      draw();
    };
    img.src=url;
  }

  function draw(){
    const modal=ensureModal();
    if(!sourceImage)return;
    const canvas=modal.querySelector('#newsroomUnifiedCanvas');
    const ctx=canvas.getContext('2d');
    const z=Number(modal.querySelector('#newsroomUnifiedZoom').value)||1;
    const x=(Number(modal.querySelector('#newsroomUnifiedX').value)||50)/100;
    const y=(Number(modal.querySelector('#newsroomUnifiedY').value)||50)/100;
    const base=Math.max(canvas.width/sourceImage.width,canvas.height/sourceImage.height);
    const scale=base*z,w=sourceImage.width*scale,h=sourceImage.height*scale;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(sourceImage,-Math.max(0,w-canvas.width)*x,-Math.max(0,h-canvas.height)*y,w,h);
  }

  function openEditor(item,target){
    if(!item||!target)return;
    pendingTarget=target;
    currentItem={...item};
    originalUrl=item.url||item.src||'';
    const modal=ensureModal();
    modal.querySelector('#newsroomUnifiedTitle').value=item.title||'';
    modal.querySelector('#newsroomUnifiedDescription').value=item.description||item.meta||'';
    modal.querySelector('#newsroomUnifiedCopyright').value=item.copyright||'';
    modal.querySelector('#newsroomUnifiedZoom').value='1';
    modal.querySelector('#newsroomUnifiedX').value='50';
    modal.querySelector('#newsroomUnifiedY').value='50';
    const label=target.type==='headline'?'Headline Image':target.type==='card'?'Content Image':'Image di artikel';
    modal.querySelector('#newsroomUnifiedContext').textContent='Digunakan untuk: '+label;
    modal.classList.add('open');
    loadImage(originalUrl,true);
    if(window.lucide)window.lucide.createIcons();
  }

  function apply(){
    if(!currentItem||!pendingTarget)return;
    const modal=ensureModal();
    draw();
    const canvas=modal.querySelector('#newsroomUnifiedCanvas');
    currentItem.url=canvas.toDataURL('image/jpeg',.9);
    currentItem.title=modal.querySelector('#newsroomUnifiedTitle').value.trim()||currentItem.title||'Image';
    currentItem.description=modal.querySelector('#newsroomUnifiedDescription').value.trim();
    currentItem.copyright=modal.querySelector('#newsroomUnifiedCopyright').value.trim();
    currentItem.meta=[currentItem.description,currentItem.copyright?('© '+currentItem.copyright):''].filter(Boolean).join(' · ');
    if(!Array.isArray(window.MEDIA_LIBRARY))window.MEDIA_LIBRARY=[];
    const idx=window.MEDIA_LIBRARY.findIndex(x=>x&&x.id===currentItem.id);
    if(idx>=0)window.MEDIA_LIBRARY[idx]={...window.MEDIA_LIBRARY[idx],...currentItem};
    else window.MEDIA_LIBRARY.push(currentItem);
    if(pendingTarget.type==='headline'){
      const caption=document.getElementById('featuredCaption');
      const copyright=document.getElementById('featuredCopyright');
      if(caption)caption.value=currentItem.description||currentItem.title||'';
      if(copyright)copyright.value=currentItem.copyright||'';
    }
    if(typeof window.newsroomMediaApplyTarget==='function')window.newsroomMediaApplyTarget(currentItem,pendingTarget);
    close();
    try{if(typeof scheduleSave==='function')scheduleSave()}catch(e){}
  }

  function ensureFileInput(){
    let input=document.getElementById('newsroomUnifiedFileInput');
    if(input)return input;
    input=document.createElement('input');
    input.type='file';input.accept='image/jpeg,image/png,image/webp';input.hidden=true;input.id='newsroomUnifiedFileInput';
    input.addEventListener('change',()=>{
      const file=input.files?.[0];
      if(!file)return;
      if(!/^image\/(jpeg|png|webp)$/i.test(file.type)){alert('Format image harus JPG, PNG, atau WEBP.');return}
      if(file.size>10*1024*1024){alert('Ukuran file maksimal 10 MB.');return}
      const reader=new FileReader();
      reader.onload=()=>openEditor({id:'upload-'+Date.now(),source:'upload',title:file.name.replace(/\.[^.]+$/,''),description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);
      reader.readAsDataURL(file);
    });
    document.body.appendChild(input);
    return input;
  }

  function openFilePicker(target){
    pendingTarget=target;
    const input=ensureFileInput();
    input.value='';
    input.click();
  }

  window.newsroomOpenUnifiedImageEditor=openEditor;
  window.newsroomOpenUnifiedImageUpload=openFilePicker;

  // Direct upload entry points: Headline and Content Image cards use the same picker.
  document.addEventListener('click',e=>{
    const headlineUpload=e.target.closest('#uploadHeadline');
    if(headlineUpload){e.preventDefault();e.stopImmediatePropagation();openFilePicker({type:'headline'});return}
    const cardUpload=e.target.closest('[data-v34-image-upload]');
    if(cardUpload){
      const card=cardUpload.closest('.alt-content-card[data-type="image"]');
      if(card){e.preventDefault();e.stopImmediatePropagation();openFilePicker({type:'card',card});return}
    }
  },true);

  // Also intercept the legacy hidden headline input if another control triggers it.
  const headlineFile=document.getElementById('headlineFile');
  if(headlineFile)headlineFile.addEventListener('change',e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    e.stopImmediatePropagation();
    pendingTarget={type:'headline'};
    const reader=new FileReader();
    reader.onload=()=>openEditor({id:'headline-upload-'+Date.now(),source:'upload',title:file.name.replace(/\.[^.]+$/,''),description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);
    reader.readAsDataURL(file);
  },true);
})();
// NEWSROOM_UNIFIED_IMAGE_FLOW_END
</script>
'''

body_end = text.rfind('</body>')
text = text[:body_end] + js + '\n' + text[body_end:]

path.write_text(text, encoding='utf-8')
print('Applied unified image flow for headline and article images.')
