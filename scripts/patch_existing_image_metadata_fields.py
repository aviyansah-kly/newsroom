from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

MARKER = '// NEWSROOM_EXISTING_IMAGE_METADATA_FIELDS_START'
if MARKER in text:
    print('Existing image metadata fields already applied.')
    raise SystemExit(0)

old_markup = '''<div class="newsroom-photo-details-head"><strong>Photo Details</strong><span>Metadata yang sama digunakan untuk Headline maupun image di artikel.</span></div>
            <label class="newsroom-photo-field"><span>Title</span><input id="newsroomUnifiedTitle" type="text" placeholder="Tulis judul foto…"></label>
            <label class="newsroom-photo-field"><span>Description</span><textarea id="newsroomUnifiedDescription" rows="4" placeholder="Jelaskan konteks foto secara singkat…"></textarea></label>
            <label class="newsroom-photo-field"><span>Copyright</span><input id="newsroomUnifiedCopyright" type="text" placeholder="Fotografer / sumber / pemegang hak cipta…"></label>
            <button class="btn sm" id="newsroomUnifiedReplace" type="button"><i data-lucide="upload"></i><span>Pilih file lain</span></button>'''

new_markup = '''<div class="newsroom-photo-details-head"><strong>Image Details</strong><span>Field mengikuti metadata image pada CMS existing.</span></div>
            <div class="newsroom-existing-file-row"><div><span>File</span><strong id="newsroomUnifiedFileName">Image terpilih</strong></div><button class="btn sm" id="newsroomUnifiedReplace" type="button"><i data-lucide="upload"></i><span>Ganti File</span></button></div>
            <label class="newsroom-photo-field"><span>Title</span><input id="newsroomUnifiedTitle" type="text" placeholder="Tulis title image…"></label>
            <label class="newsroom-photo-field"><span>Photographer</span><select id="newsroomUnifiedPhotographer"><option value="">Pilih photographer</option><option value="Liputan6.com">Liputan6.com</option><option value="Reporter / Internal">Reporter / Internal</option><option value="External / Contributor">External / Contributor</option></select></label>
            <div class="newsroom-existing-flags">
              <label><input id="newsroomUnifiedSiteOnly" type="checkbox"><span>This Site Only</span></label>
              <label><input id="newsroomUnifiedSpecialInstructions" type="checkbox"><span>Special Instructions</span></label>
            </div>
            <fieldset class="newsroom-watermark-field"><legend>Watermark</legend><div><label><input type="radio" name="newsroomUnifiedWatermark" value="none" checked><span>No watermark</span></label><label><input type="radio" name="newsroomUnifiedWatermark" value="with"><span>With watermark</span></label></div></fieldset>
            <label class="newsroom-photo-field newsroom-short-desc"><span>Short Desc</span><textarea id="newsroomUnifiedShortDesc" rows="3" placeholder="Tulis deskripsi singkat image…"></textarea></label>'''

if old_markup not in text:
    raise SystemExit('Unified image detail markup anchor not found; aborting.')
text = text.replace(old_markup, new_markup, 1)

old_open = '''modal.querySelector('#newsroomUnifiedTitle').value=item.title||'';
    modal.querySelector('#newsroomUnifiedDescription').value=item.description||item.meta||'';
    modal.querySelector('#newsroomUnifiedCopyright').value=item.copyright||'';'''
new_open = '''modal.querySelector('#newsroomUnifiedFileName').textContent=item.fileName||item.title||'Image terpilih';
    modal.querySelector('#newsroomUnifiedTitle').value=item.title||'';
    modal.querySelector('#newsroomUnifiedPhotographer').value=item.photographer||item.copyright||'';
    modal.querySelector('#newsroomUnifiedSiteOnly').checked=!!item.thisSiteOnly;
    modal.querySelector('#newsroomUnifiedSpecialInstructions').checked=!!item.specialInstructions;
    const watermark=item.watermark||'none';
    const watermarkInput=modal.querySelector('input[name="newsroomUnifiedWatermark"][value="'+watermark+'"]')||modal.querySelector('input[name="newsroomUnifiedWatermark"][value="none"]');
    if(watermarkInput)watermarkInput.checked=true;
    modal.querySelector('#newsroomUnifiedShortDesc').value=item.shortDesc||item.description||item.meta||'';'''
if old_open not in text:
    raise SystemExit('Unified image openEditor metadata anchor not found; aborting.')
text = text.replace(old_open, new_open, 1)

old_apply = '''currentItem.title=modal.querySelector('#newsroomUnifiedTitle').value.trim()||currentItem.title||'Image';
    currentItem.description=modal.querySelector('#newsroomUnifiedDescription').value.trim();
    currentItem.copyright=modal.querySelector('#newsroomUnifiedCopyright').value.trim();
    currentItem.meta=[currentItem.description,currentItem.copyright?('© '+currentItem.copyright):''].filter(Boolean).join(' · ');'''
new_apply = '''currentItem.title=modal.querySelector('#newsroomUnifiedTitle').value.trim()||currentItem.title||'Image';
    currentItem.photographer=modal.querySelector('#newsroomUnifiedPhotographer').value;
    currentItem.thisSiteOnly=modal.querySelector('#newsroomUnifiedSiteOnly').checked;
    currentItem.specialInstructions=modal.querySelector('#newsroomUnifiedSpecialInstructions').checked;
    currentItem.watermark=modal.querySelector('input[name="newsroomUnifiedWatermark"]:checked')?.value||'none';
    currentItem.shortDesc=modal.querySelector('#newsroomUnifiedShortDesc').value.trim();
    /* Backward-compatible aliases used elsewhere in the prototype. */
    currentItem.description=currentItem.shortDesc;
    currentItem.copyright=currentItem.photographer;
    currentItem.meta=[currentItem.shortDesc,currentItem.photographer].filter(Boolean).join(' · ');'''
if old_apply not in text:
    raise SystemExit('Unified image apply metadata anchor not found; aborting.')
text = text.replace(old_apply, new_apply, 1)

old_upload = "reader.onload=()=>openEditor({id:'upload-'+Date.now(),source:'upload',title:file.name.replace(/\\.[^.]+$/,''),description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);"
new_upload = "reader.onload=()=>openEditor({id:'upload-'+Date.now(),source:'upload',fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',thisSiteOnly:false,specialInstructions:false,watermark:'none',shortDesc:'',description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);"
if old_upload not in text:
    raise SystemExit('Unified upload item anchor not found; aborting.')
text = text.replace(old_upload, new_upload, 1)

old_headline_upload = "reader.onload=()=>openEditor({id:'headline-upload-'+Date.now(),source:'upload',title:file.name.replace(/\\.[^.]+$/,''),description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);"
new_headline_upload = "reader.onload=()=>openEditor({id:'headline-upload-'+Date.now(),source:'upload',fileName:file.name,title:file.name.replace(/\\.[^.]+$/,''),photographer:'',thisSiteOnly:false,specialInstructions:false,watermark:'none',shortDesc:'',description:'',copyright:'',meta:'',url:String(reader.result||'')},pendingTarget);"
if old_headline_upload not in text:
    raise SystemExit('Headline upload item anchor not found; aborting.')
text = text.replace(old_headline_upload, new_headline_upload, 1)

# Headline compatibility: Short Desc becomes caption, Photographer becomes credit.
old_caption = '''if(caption)caption.value=currentItem.description||currentItem.title||'';
      if(copyright)copyright.value=currentItem.copyright||'';'''
new_caption = '''if(caption)caption.value=currentItem.shortDesc||currentItem.title||'';
      if(copyright)copyright.value=currentItem.photographer||'';'''
if old_caption not in text:
    raise SystemExit('Headline caption compatibility anchor not found; aborting.')
text = text.replace(old_caption, new_caption, 1)

css = r'''<style>
/* NEWSROOM_EXISTING_IMAGE_METADATA_FIELDS_STYLE_START */
#newsroomUnifiedImageModal .newsroom-existing-file-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px;padding:7px 8px;border:1px solid var(--border);border-radius:8px;background:var(--soft)}
#newsroomUnifiedImageModal .newsroom-existing-file-row>div{min-width:0;display:flex;flex-direction:column;gap:1px}
#newsroomUnifiedImageModal .newsroom-existing-file-row span{font-size:10px;font-weight:600;color:var(--muted)}
#newsroomUnifiedImageModal .newsroom-existing-file-row strong{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;color:var(--text2)}
#newsroomUnifiedImageModal .newsroom-photo-field select{width:100%;height:34px;padding:0 30px 0 9px;border:1px solid var(--input);border-radius:8px;background:#fff;color:var(--text);font-size:11px;outline:0}
#newsroomUnifiedImageModal .newsroom-photo-field select:focus{border-color:#60a5fa;box-shadow:var(--focus)}
#newsroomUnifiedImageModal .newsroom-existing-flags{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:2px 0 9px}
#newsroomUnifiedImageModal .newsroom-existing-flags label{min-height:34px;display:flex;align-items:center;gap:7px;padding:7px 8px;border:1px solid var(--border);border-radius:8px;background:#fff;font-size:10.5px;font-weight:500;color:var(--text2);cursor:pointer}
#newsroomUnifiedImageModal .newsroom-existing-flags input{width:14px;height:14px;margin:0;accent-color:var(--orange);flex:none}
#newsroomUnifiedImageModal .newsroom-watermark-field{margin:0 0 9px;padding:6px 8px 8px;border:1px solid var(--border);border-radius:8px;background:var(--soft)}
#newsroomUnifiedImageModal .newsroom-watermark-field legend{padding:0 4px;font-size:10.5px;font-weight:600;color:var(--text2)}
#newsroomUnifiedImageModal .newsroom-watermark-field>div{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#newsroomUnifiedImageModal .newsroom-watermark-field label{display:flex;align-items:center;gap:6px;min-height:26px;font-size:10.5px;color:var(--text2);cursor:pointer}
#newsroomUnifiedImageModal .newsroom-watermark-field input{width:14px;height:14px;margin:0;accent-color:var(--orange)}
#newsroomUnifiedImageModal .newsroom-short-desc textarea{min-height:58px!important;max-height:68px!important}
#newsroomUnifiedImageModal #newsroomUnifiedReplace{height:30px!important;min-height:30px!important;padding:0 8px!important;font-size:10.5px!important}
@media(max-width:860px){#newsroomUnifiedImageModal .newsroom-existing-flags{grid-template-columns:1fr}}
/* NEWSROOM_EXISTING_IMAGE_METADATA_FIELDS_STYLE_END */
</style>
'''

body_end = text.rfind('</body>')
if body_end == -1:
    raise SystemExit('Closing </body> not found; aborting.')

marker = '''<script>
// NEWSROOM_EXISTING_IMAGE_METADATA_FIELDS_START
// Unified metadata contract mirrors the existing CMS image fields for all insert-image targets.
// NEWSROOM_EXISTING_IMAGE_METADATA_FIELDS_END
</script>
'''
text = text[:body_end] + css + '\n' + marker + text[body_end:]

path.write_text(text, encoding='utf-8')
print('Applied existing CMS metadata fields to unified image editor.')
