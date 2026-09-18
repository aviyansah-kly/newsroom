from pathlib import Path
import re

path=Path('index.html')
text=path.read_text(encoding='utf-8')

MARK='// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_START'
if MARK in text:
    print('Orientation/channel patch already applied.')
    raise SystemExit(0)

# 1. Add fields to the unified image editor after Photographer.
old='''<label class="newsroom-photo-field"><span>Photographer</span><select id="newsroomUnifiedPhotographer"><option value="">Pilih photographer</option><option value="Liputan6.com">Liputan6.com</option><option value="Reporter / Internal">Reporter / Internal</option><option value="External / Contributor">External / Contributor</option></select></label>'''
new='''<label class="newsroom-photo-field"><span>Photographer</span><select id="newsroomUnifiedPhotographer"><option value="">Pilih photographer</option><option value="Liputan6.com">Liputan6.com</option><option value="Reporter / Internal">Reporter / Internal</option><option value="External / Contributor">External / Contributor</option></select></label>
            <div class="newsroom-image-meta-pair">
              <label class="newsroom-photo-field"><span>Orientasi</span><select id="newsroomUnifiedOrientation"><option value="Landscape">Landscape</option><option value="Vertical">Vertical</option><option value="Square">Square</option></select></label>
              <label class="newsroom-photo-field"><span>Kategori / Kanal</span><select id="newsroomUnifiedChannel"><option value="">Pilih kategori / kanal</option><option value="News">News</option><option value="Bisnis">Bisnis</option><option value="Bola">Bola</option><option value="Showbiz">Showbiz</option><option value="Tekno">Tekno</option><option value="Lifestyle">Lifestyle</option><option value="Health">Health</option><option value="Regional">Regional</option></select></label>
            </div>'''
if old not in text:
    raise SystemExit('Photographer field anchor not found.')
text=text.replace(old,new,1)

# 2. Populate values when the unified editor opens.
old_open="modal.querySelector('#newsroomUnifiedPhotographer').value=item.photographer||item.copyright||'';"
new_open="""modal.querySelector('#newsroomUnifiedPhotographer').value=item.photographer||item.copyright||'';
    modal.querySelector('#newsroomUnifiedOrientation').value=item.orientation||'Landscape';
    modal.querySelector('#newsroomUnifiedChannel').value=item.channel||item.category||'';"""
if old_open not in text:
    raise SystemExit('Open metadata anchor not found.')
text=text.replace(old_open,new_open,1)

# 3. Save the two new metadata fields.
old_apply="currentItem.photographer=modal.querySelector('#newsroomUnifiedPhotographer').value;"
new_apply="""currentItem.photographer=modal.querySelector('#newsroomUnifiedPhotographer').value;
    currentItem.orientation=modal.querySelector('#newsroomUnifiedOrientation').value||'Landscape';
    currentItem.channel=modal.querySelector('#newsroomUnifiedChannel').value;
    currentItem.category=currentItem.channel;"""
if old_apply not in text:
    raise SystemExit('Apply metadata anchor not found.')
text=text.replace(old_apply,new_apply,1)

# 4. Add auto-orientation metadata defaults for direct uploads.
text=text.replace("fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',thisSiteOnly:false",
                  "fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',orientation:'Landscape',channel:'',thisSiteOnly:false")
text=text.replace("fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',thisSiteOnly:false",
                  "fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',orientation:'Landscape',channel:'',thisSiteOnly:false")

css=r'''<style>
/* NEWSROOM_IMAGE_ORIENTATION_CHANNEL_STYLE_START */
#newsroomUnifiedImageModal .newsroom-image-meta-pair{display:grid;grid-template-columns:.78fr 1.22fr;gap:8px}
#newsroomUnifiedImageModal .newsroom-image-meta-pair .newsroom-photo-field{min-width:0}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-filter{height:34px;min-width:138px;padding:0 30px 0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;color:var(--text2);font-size:12px;outline:0}
body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-filter:focus{border-color:#60a5fa;box-shadow:var(--focus)}
body.alt-editor-layout #imageLibraryPopup .newsroom-preview-meta-extra{margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
body.alt-editor-layout #imageLibraryPopup .newsroom-preview-meta-extra .v34-detail-grid{margin:0}
@media(max-width:860px){#newsroomUnifiedImageModal .newsroom-image-meta-pair{grid-template-columns:1fr}body.alt-editor-layout #imageLibraryPopup .newsroom-gallery-meta-filters{width:100%;margin-left:0}.newsroom-gallery-filter{flex:1 1 140px}}
/* NEWSROOM_IMAGE_ORIENTATION_CHANNEL_STYLE_END */
</style>
'''

js=r'''<script>
// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_START
(function(){
  const orientationFor=(item,img)=>{
    if(item?.orientation)return item.orientation;
    const w=img?.naturalWidth||0,h=img?.naturalHeight||0;
    if(w&&h){if(Math.abs(w-h)/Math.max(w,h)<.08)return 'Square';return w>h?'Landscape':'Vertical'}
    return 'Landscape';
  };
  const channelFor=item=>item?.channel||item?.category||((item?.meta||'').split('·')[1]||'').trim()||'News';

  function data(){return Array.isArray(window.MEDIA_LIBRARY)?window.MEDIA_LIBRARY:[]}
  function matchItem(card){
    const img=card.querySelector('img');
    const title=(img?.alt||card.getAttribute('aria-label')||card.textContent||'').trim();
    const src=img?.src||'';
    return data().find(x=>x&&(x.id===card.dataset.id||x.title===title||x.url===src||x.src===src))||null;
  }
  function decorateCards(){
    document.querySelectorAll('#imageLibraryPopup .v34-card').forEach(card=>{
      const item=matchItem(card),img=card.querySelector('img');
      card.dataset.newsroomOrientation=orientationFor(item,img);
      card.dataset.newsroomChannel=channelFor(item);
    });
  }
  function applyFilters(){
    decorateCards();
    const o=document.getElementById('newsroomGalleryOrientationFilter')?.value||'';
    const c=document.getElementById('newsroomGalleryChannelFilter')?.value||'';
    document.querySelectorAll('#imageLibraryPopup .v34-card').forEach(card=>{
      const visible=(!o||card.dataset.newsroomOrientation===o)&&(!c||card.dataset.newsroomChannel===c);
      card.style.display=visible?'':'none';
    });
  }
  function installFilters(){
    const tools=document.getElementById('v61GalleryTools');
    if(!tools||tools.querySelector('.newsroom-gallery-meta-filters'))return;
    const wrap=document.createElement('div');
    wrap.className='newsroom-gallery-meta-filters';
    wrap.innerHTML='<select class="newsroom-gallery-filter" id="newsroomGalleryOrientationFilter"><option value="">Semua Orientasi</option><option>Landscape</option><option>Vertical</option><option>Square</option></select><select class="newsroom-gallery-filter" id="newsroomGalleryChannelFilter"><option value="">Semua Kategori / Kanal</option><option>News</option><option>Bisnis</option><option>Bola</option><option>Showbiz</option><option>Tekno</option><option>Lifestyle</option><option>Health</option><option>Regional</option></select>';
    tools.appendChild(wrap);
    wrap.querySelectorAll('select').forEach(el=>el.addEventListener('change',applyFilters));
  }
  function updatePreview(){
    const popup=document.getElementById('imageLibraryPopup');
    const preview=popup?.querySelector('#v34Preview');
    if(!preview?.classList.contains('has-selection'))return;
    const title=popup.querySelector('#v34PreviewTitle')?.textContent?.trim()||'';
    const img=popup.querySelector('#v34PreviewImg');
    const item=data().find(x=>x&&x.title===title)||null;
    const detail=preview.querySelector('.v34-detail-summary');
    if(!detail)return;
    let extra=detail.querySelector('.newsroom-preview-meta-extra');
    if(!extra){extra=document.createElement('div');extra.className='newsroom-preview-meta-extra';detail.appendChild(extra)}
    extra.innerHTML='<div class="v34-detail-grid"><div class="v34-detail-item"><small>Orientasi</small><span>'+orientationFor(item,img)+'</span></div><div class="v34-detail-item"><small>Kategori / Kanal</small><span>'+channelFor(item)+'</span></div></div>';
  }
  function syncEditorOrientation(){
    const modal=document.getElementById('newsroomUnifiedImageModal');
    if(!modal?.classList.contains('open'))return;
    const canvas=modal.querySelector('#newsroomUnifiedCanvas');
    const select=modal.querySelector('#newsroomUnifiedOrientation');
    if(!select||select.dataset.userChanged==='1'||!canvas)return;
    const w=canvas.width,h=canvas.height;
    if(w&&h)select.value=Math.abs(w-h)/Math.max(w,h)<.08?'Square':w>h?'Landscape':'Vertical';
  }
  document.addEventListener('change',e=>{if(e.target?.id==='newsroomUnifiedOrientation')e.target.dataset.userChanged='1'},true);
  document.addEventListener('click',()=>setTimeout(()=>{installFilters();decorateCards();updatePreview();syncEditorOrientation()},0),true);
  const observer=new MutationObserver(()=>{installFilters();decorateCards();updatePreview();syncEditorOrientation()});
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installFilters();decorateCards();updatePreview()},{once:true});
  else{installFilters();decorateCards();updatePreview()}
})();
// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_END
</script>
'''

idx=text.rfind('</body>')
if idx<0: raise SystemExit('Closing body not found')
text=text[:idx]+css+'\n'+js+'\n'+text[idx:]
path.write_text(text,encoding='utf-8')
print('Applied orientation and channel metadata/search/preview.')
