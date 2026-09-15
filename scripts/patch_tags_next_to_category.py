from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Keep Tags in the Editorial tab and place it in the first metadata cluster,
# directly below Location. The original field is reused so all existing tag
# behavior, AI markers, suggestions, and save logic remain intact.
pattern = re.compile(r"""  function moveTagsToEditorial\(\)\{.*?\n  \}\n\n  function renameMainTab\(\)\{""", re.S)
replacement = r'''  function moveTagsToEditorial(){
    const infoPane=$('#infoPane');
    const tagInput=$('#tagInput');
    if(!infoPane||!tagInput)return;

    const field=tagInput.closest('.field');
    if(!field)return;

    let section=$('#altEditorialTagsSection');
    if(!section){
      section=document.createElement('div');
      section.className='alt-editorial-tags-section';
      section.id='altEditorialTagsSection';
      section.innerHTML='<div class="settings-section-head"><div><strong>Tags</strong><span>Tambahkan topik editorial yang relevan untuk artikel.</span></div></div>';
    }
    section.appendChild(field);

    const location=$('#altLocation');
    const locationField=location?.closest('.field');
    if(locationField && infoPane.contains(locationField)){
      locationField.insertAdjacentElement('afterend',section);
    }else{
      // Location is created by the Editorial metadata enhancer. Retry briefly
      // instead of falling back to SEO or another cluster.
      window.setTimeout(moveTagsToEditorial,120);
      return;
    }

    const label=field.querySelector('label');
    if(label)label.textContent='Tags';
  }

  function renameMainTab(){'''
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'moveTagsToEditorial replacement count={count}')

start = '/* NEWSROOM_TAGS_CLASSIFICATION_POSITION_START */'
end = '/* NEWSROOM_TAGS_CLASSIFICATION_POSITION_END */'
if start in text and end in text:
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', text, flags=re.S)

css = r'''/* NEWSROOM_TAGS_CLASSIFICATION_POSITION_START */
/* Tags remain in Editorial and visually follow Location in the first metadata cluster. */
body.alt-editor-layout #infoPane .alt-editorial-tags-section{
  margin:10px 0 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
body.alt-editor-layout #infoPane .alt-editorial-tags-section .field{
  margin:0!important;
}
body.alt-editor-layout #infoPane .alt-meta-extra>.alt-editorial-tags-section{
  width:100%!important;
}
/* NEWSROOM_TAGS_CLASSIFICATION_POSITION_END */
'''
idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

path.write_text(text, encoding='utf-8')
print('Tags kept in Editorial directly below Location.')
