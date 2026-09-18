from pathlib import Path
import re

path=Path('index.html')
text=path.read_text(encoding='utf-8')

start='// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_START'
end='// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_END'
pattern=re.compile(r'<script>\s*'+re.escape(start)+r'.*?'+re.escape(end)+r'\s*</script>', re.S)

replacement=r'''<script>
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
    const id=card?.dataset?.v34Id||'';
    if(id){const byId=data().find(x=>x&&String(x.id)===String(id));if(byId)return byId}
    const img=card?.querySelector('img');
    const src=img?.src||'';
    return data().find(x=>x&&(x.url===src||x.src===src))||null;
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
    decorateCards();
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

  document.addEventListener('change',e=>{
    if(e.target?.id==='newsroomUnifiedOrientation')e.target.dataset.userChanged='1';
  },true);

  document.addEventListener('click',e=>{
    if(!e.target.closest('#imageLibraryPopup,[data-v34-image-select],#chooseHeadline'))return;
    setTimeout(()=>{installFilters();decorateCards();syncEditorOrientation()},0);
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFilters,{once:true});
  else installFilters();

  window.newsroomApplyGalleryMetaFilters=applyFilters;
  window.newsroomRefreshGalleryMeta=()=>{installFilters();decorateCards();applyFilters()};
})();
// NEWSROOM_IMAGE_ORIENTATION_CHANNEL_END
</script>'''

text,count=pattern.subn(replacement,text,count=1)
if count!=1:
    raise SystemExit('Orientation/channel runtime block not found')

path.write_text(text,encoding='utf-8')
print('Removed global gallery observer and stabilized metadata filters.')
