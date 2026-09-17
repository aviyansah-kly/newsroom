from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

MARKER = '// NEWSROOM_DIRECT_ARTICLE_IMAGE_UPLOAD_START'
if MARKER in text:
    print('Direct article image upload flow already applied.')
    raise SystemExit(0)

# 1) Content Image card: clicking Upload Image should open the native file picker
# immediately, without showing the intermediate Image Picker upload screen.
old = "body.querySelector('[data-v34-image-upload]').onclick=e=>{e.preventDefault();open({type:'card',card:c});setTimeout(()=>document.querySelector('#imageLibraryPopup [data-v61-mode=\"upload\"]')?.click(),0)};"
new = "body.querySelector('[data-v34-image-upload]').onclick=e=>{e.preventDefault();open({type:'card',card:c});const popup=document.getElementById('imageLibraryPopup');const uploadTab=popup?.querySelector('[data-v61-mode=\"upload\"]');if(uploadTab)uploadTab.click();popup?.classList.remove('open');const input=document.getElementById('v61UploadInput');if(input){input.value='';input.click()}};"
if old not in text:
    raise SystemExit('Content Image upload handler anchor not found; aborting.')
text = text.replace(old, new, 1)

# 2) After file selection, the edit/crop popup must open directly.
old_show = "image.onload=()=>{draw();drop.hidden=true;editor.hidden=false;popup.classList.add('v62-upload-editing');use.disabled=false;use.textContent='Simpan & Sisipkan ke Artikel';if(targetText)targetText.textContent='Atur crop dan lengkapi metadata sebelum image dimasukkan.'};"
new_show = "image.onload=()=>{draw();drop.hidden=true;editor.hidden=false;popup.classList.add('open','v62-upload-editing');use.disabled=false;use.textContent='Simpan & Sisipkan ke Artikel';if(targetText)targetText.textContent='Atur crop dan lengkapi metadata sebelum image dimasukkan.'};"
if old_show not in text:
    raise SystemExit('Article image editor open-state anchor not found; aborting.')
text = text.replace(old_show, new_show, 1)

# 3) "Pilih file lain" should reopen the device picker directly, not return to the
# large upload-drop screen.
old_back = "back.addEventListener('click',()=>{\n      editor.hidden=true;drop.hidden=false;popup.classList.remove('v62-upload-editing');input.value='';use.disabled=true;use.textContent='Gunakan Image';if(targetText)targetText.textContent='Pilih file image terlebih dahulu.';\n    });"
new_back = "back.addEventListener('click',()=>{\n      input.value='';\n      input.click();\n    });"
if old_back not in text:
    raise SystemExit('Choose-another-file anchor not found; aborting.')
text = text.replace(old_back, new_back, 1)

# 4) If the user reaches the Image Gallery popup and chooses Upload Image there,
# still skip the intermediate upload screen and open the native picker directly.
old_mode = "const upload=mode==='upload';\n      $('#v61GalleryTools').hidden=upload;\n      $('#v61ResultsHead').hidden=upload;\n      $('#v34Grid').hidden=upload;\n      $('#v61UploadPanel').hidden=!upload;"
new_mode = "const upload=mode==='upload';\n      $('#v61GalleryTools').hidden=upload;\n      $('#v61ResultsHead').hidden=upload;\n      $('#v34Grid').hidden=upload;\n      $('#v61UploadPanel').hidden=!upload;\n      if(upload){const directInput=$('#v61UploadInput');p.classList.remove('open');if(directInput){directInput.value='';directInput.click()}return;}"
if old_mode not in text:
    raise SystemExit('Image picker upload-tab anchor not found; aborting.')
text = text.replace(old_mode, new_mode, 1)

script = '''<script>\n// NEWSROOM_DIRECT_ARTICLE_IMAGE_UPLOAD_START\n// UX contract: direct device picker -> crop/metadata editor -> insert into article.\n// The Image Gallery modal is no longer used as an intermediate upload step.\n// NEWSROOM_DIRECT_ARTICLE_IMAGE_UPLOAD_END\n</script>\n'''
body_end = text.rfind('</body>')
if body_end == -1:
    raise SystemExit('Closing </body> not found; aborting.')
text = text[:body_end] + script + text[body_end:]

path.write_text(text, encoding='utf-8')
print('Applied direct article image upload flow.')
