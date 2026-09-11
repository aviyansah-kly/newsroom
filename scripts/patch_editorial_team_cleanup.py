from pathlib import Path

path=Path('index.html')
text=path.read_text(encoding='utf-8')

# Remove duplicated legacy Reporter/Editorial fields that may still be present in Info pane.
cleanup_js='''<script>
(function(){
  const info=document.getElementById('infoPane');
  if(!info)return;
  info.querySelectorAll('.field').forEach(field=>{
    const label=field.querySelector(':scope > label');
    const t=(label?.textContent||'').trim();
    if((t==='Reporter'||t==='Editorial'||t==='Editor')&&!field.closest('.newsroom-team-section')) field.remove();
  });
})();
</script>'''

# Reduce non-essential copy and source badges.
text=text.replace('<div class="settings-section-head"><div><strong>Tim Editorial</strong><span>Penugasan utama terisi otomatis dari artikel dan pengguna yang sedang login.</span></div></div>','<div class="settings-section-head"><div><strong>Tim Editorial</strong></div></div>')
text=text.replace('<div class="team-role-head"><div><strong>Reporter</strong><span>Reporter utama mengikuti artikel yang dipilih.</span></div><span class="team-source-badge"><i data-lucide="file-check-2"></i>Dari artikel</span></div>','<div class="team-role-head"><div><strong>Reporter</strong></div></div>')
text=text.replace('<div class="team-role-head"><div><strong>Editor</strong><span>Editor utama mengikuti akun yang sedang login.</span></div><span class="team-source-badge login"><i data-lucide="circle-user-round"></i>Anda</span></div>','<div class="team-role-head"><div><strong>Editor</strong></div></div>')
text=text.replace('<div class="team-assignment-note"><i data-lucide="info"></i><span>Orang pertama adalah penugasan utama. Tambahkan kolaborator hanya jika artikel dikerjakan bersama.</span></div>','')

# Primary people should be replaceable. Convert the primary badge into a lightweight change action.
old="+(i===0?'<span class=\"team-primary-badge\">Utama</span>':'<button class=\"team-remove\" type=\"button\" data-remove-team=\"'+i+'\" aria-label=\"Hapus '+escHtml(name)+'\"><i data-lucide=\"x\"></i></button>')+"
new="+(i===0?'<button class=\"team-change-primary\" type=\"button\" data-change-primary aria-label=\"Ganti '+escHtml(name)+'\">Ganti</button>':'<button class=\"team-remove\" type=\"button\" data-remove-team=\"'+i+'\" aria-label=\"Hapus '+escHtml(name)+'\"><i data-lucide=\"x\"></i></button>')+"
text=text.replace(old,new)

# Wire primary replacement through the existing picker panel.
needle="list.querySelectorAll('[data-remove-team]').forEach(btn=>btn.onclick=()=>{selected.splice(+btn.dataset.removeTeam,1);sync();render()});"
replace=needle+"\n      list.querySelectorAll('[data-change-primary]').forEach(btn=>btn.onclick=()=>{group.dataset.replacePrimary='1';panel.hidden=false;input.value='';showSuggestions();setTimeout(()=>input.focus(),0)});"
text=text.replace(needle,replace)

needle2="suggestions.querySelectorAll('[data-team-person]').forEach(btn=>btn.onclick=()=>{selected.push(btn.dataset.teamPerson);sync();render();panel.hidden=true;input.value=''});"
replace2="suggestions.querySelectorAll('[data-team-person]').forEach(btn=>btn.onclick=()=>{const name=btn.dataset.teamPerson;if(group.dataset.replacePrimary==='1'){selected[0]=name;delete group.dataset.replacePrimary}else selected.push(name);sync();render();panel.hidden=true;input.value=''});"
text=text.replace(needle2,replace2)

# Add compact styling for change action and tighten section rhythm.
css='''<style>
body.alt-editor-layout .newsroom-team-section>.settings-section-head{margin-bottom:12px!important}
body.alt-editor-layout .team-role-head{margin-bottom:7px!important}
body.alt-editor-layout .team-role-head>div{display:block!important}
body.alt-editor-layout .team-role-head span,.team-source-badge,.team-assignment-note{display:none!important}
body.alt-editor-layout .team-change-primary{height:22px;border:0;border-radius:6px;background:transparent;color:#64748b;padding:0 5px;font-size:10px;font-weight:600}
body.alt-editor-layout .team-change-primary:hover{background:#f1f5f9;color:#2563eb}
body.alt-editor-layout .team-role-divider{margin:12px 0!important}
</style>'''

text=text.replace('</head>',css+'</head>',1)
text=text.replace('</body>',cleanup_js+'</body>',1)
path.write_text(text,encoding='utf-8')
print('Editorial team cleanup applied')
