from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Replace the existing V49 moveTagsToEditorial implementation so Tags lives
# directly after Category inside the same Editorial Classification cluster.
pattern = re.compile(r"""  function moveTagsToEditorial\(\)\{.*?\n  \}\n\n  function renameMainTab\(\)\{""", re.S)
replacement = r'''  function moveTagsToEditorial(){
    const seoPane=$('#seoPane');
    const infoPane=$('#infoPane');
    const tagInput=$('#tagInput');
    if(!seoPane||!infoPane||!tagInput)return;

    const field=tagInput.closest('.field');
    const category=$('#category');
    const categoryField=category?.closest('.field');
    const classification=categoryField?.closest('.settings-section');
    if(!field||!categoryField||!classification)return;

    let section=$('#altEditorialTagsSection');
    if(!section){
      section=document.createElement('div');
      section.className='alt-editorial-tags-section';
      section.id='altEditorialTagsSection';
      section.innerHTML='<div class="settings-section-head"><div><strong>Tags</strong><span>Tambahkan topik editorial yang relevan untuk artikel.</span></div></div>';
    }

    section.appendChild(field);
    categoryField.insertAdjacentElement('afterend',section);

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
/* Category + Tags are one classification decision group. */
body.alt-editor-layout #infoPane .alt-editorial-tags-section{
  margin:10px 0 0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
body.alt-editor-layout #infoPane .alt-editorial-tags-section .field{
  margin:0!important;
}
body.alt-editor-layout #infoPane .v58-category-editorial + .alt-editorial-tags-section,
body.alt-editor-layout #infoPane .field:has(#category) + .alt-editorial-tags-section{
  margin-top:10px!important;
}
/* NEWSROOM_TAGS_CLASSIFICATION_POSITION_END */
'''
idx = text.rfind('</style>')
if idx == -1:
    raise SystemExit('Could not find closing </style> tag')
text = text[:idx] + css + '\n' + text[idx:]

path.write_text(text, encoding='utf-8')
print('Tags moved directly after Category in Editorial Classification.')
