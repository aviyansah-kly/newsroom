(()=>{'use strict';
/* Prototype-only User Management. No persisted data, credential handling or network writes. */
const roles=['Writer','Editor','Redpel','SEO','Admin'];
const channels=['100 Hari Jokowi-JK','Apec','Apps','Artis','Asian Games','Bisnis','Bola','Buser','Citizen6','Crypto','Energi dan Mineral','Fashion & Beauty','Health','Jatim','Jateng','Jakarta','Liputan Khusus','News','Otomotif','Olahraga','Regional','Showbiz','Tekno','TV'];
const rights=[
 ['Buat Artikel',['Writer','Editor','Redpel']],
 ['Edit Artikel Sendiri',['Writer','Editor','Redpel']],
 ['Review Artikel',['Editor','Redpel']],
 ['Publish Artikel',['Redpel']],
 ['Edit SEO Attributes',['Editor','Redpel','SEO']],
 ['Kelola User',['Admin']]
];
const seed=[
 {id:1,username:'andi.pratama',name:'Andi Pratama',displayName:'Andi Pratama',email:'andi@example.com',klyId:'KLY-101',title:'Reporter',partner:'Liputan6',role:'Writer',grants:[{role:'Writer',channel:'News'}],active:true,verified:true,twoFactor:true,contributor:true,productManager:false,aiEditor:false,autopilot:false,expirationDate:'',updated:'28 Okt 2026'},
 {id:2,username:'siti.rahma',name:'Siti Rahma',displayName:'Siti Rahma',email:'siti@example.com',klyId:'KLY-102',title:'Editor',partner:'Liputan6',role:'Editor',grants:[{role:'Editor',channel:'News'},{role:'Editor',channel:'Bisnis'}],active:true,verified:true,twoFactor:true,contributor:false,productManager:false,aiEditor:true,autopilot:false,expirationDate:'',updated:'27 Okt 2026'},
 {id:3,username:'budi.santoso',name:'Budi Santoso',displayName:'Budi Santoso',email:'budi@example.com',klyId:'KLY-103',title:'Redaktur Pelaksana',partner:'Liputan6',role:'Redpel',grants:[{role:'Redpel',channel:'Bola'}],active:true,verified:true,twoFactor:false,contributor:false,productManager:true,aiEditor:false,autopilot:false,expirationDate:'',updated:'27 Okt 2026'},
 {id:4,username:'rina.putri',name:'Rina Putri',displayName:'Rina Putri',email:'rina@example.com',klyId:'',title:'SEO Specialist',partner:'KLY',role:'SEO',grants:[{role:'SEO',channel:'Bisnis'}],active:false,verified:true,twoFactor:false,contributor:false,productManager:false,aiEditor:true,autopilot:false,expirationDate:'',updated:'25 Okt 2026'},
 {id:5,username:'dina.lestari',name:'Dina Lestari',displayName:'Dina Lestari',email:'dina@example.com',klyId:'KLY-105',title:'Writer',partner:'Liputan6',role:'Writer',grants:[{role:'Writer',channel:'Showbiz'}],active:true,verified:true,twoFactor:false,contributor:true,productManager:false,aiEditor:false,autopilot:false,expirationDate:'',updated:'26 Okt 2026'},
 {id:6,username:'rafi.hidayat',name:'Rafi Hidayat',displayName:'Rafi Hidayat',email:'rafi@example.com',klyId:'KLY-106',title:'Administrator',partner:'KLY',role:'Admin',grants:[{role:'Admin',channel:'News'}],active:true,verified:true,twoFactor:true,contributor:false,productManager:true,aiEditor:false,autopilot:false,expirationDate:'',updated:'29 Okt 2026'}
];
let users=seed.map(x=>({...x,grants:x.grants.map(y=>({...y}))}));
let logs=[],page=0,editing=null,pending=null,lastFocus=null,workingGrants=[],pendingChannelSelection=new Set();
const $=id=>document.getElementById(id),all=selector=>[...document.querySelectorAll(selector)];
const el=(tag,cls='',value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!=null)node.textContent=value;return node};
const icon=()=>window.lucide?.createIcons();
const uniqueChannels=u=>[...new Set(u.grants.map(g=>g.channel))];
const formatNow=()=>new Date().toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'});
function log(message){logs.unshift({when:formatNow(),message});drawLog()}
function drawLog(){const list=$('activityItems');list.replaceChildren();if(!logs.length)list.append(el('li','nr-activity-empty','Belum ada aktivitas tercatat.'));logs.forEach(item=>{const li=el('li'),time=el('strong','',item.when),message=el('p','',item.message);li.append(time,message);list.append(li)})}
function filtered(){const query=$('userSearch').value.trim().toLowerCase(),role=$('roleFilter').value,status=$('statusFilter').value,channel=$('channelFilter').value;
 return users.filter(u=>(!query||[u.username,u.name,u.displayName,u.email,u.klyId].join(' ').toLowerCase().includes(query))&&(!role||(u.role===role||u.grants.some(g=>g.role===role)))&&(!status||(status==='active')===u.active)&&(!channel||u.grants.some(g=>g.channel===channel)))}
function cell(text,label){const td=el('td','',text);if(label)td.dataset.label=label;return td}
function drawPagination(total,max){
 const nav=$('pageNumbers');nav.replaceChildren();
 if(!total){const empty=el('span','nr-current-page','—');nav.append(empty);return}
 const maxVisible=5,start=Math.max(0,Math.min(page-2,max-maxVisible+1)),end=Math.min(max,start+maxVisible-1);
 const addNumber=n=>{
  const button=el('button','nr-btn nr-page-number'+(n===page?' active':''),String(n+1));
  button.type='button';button.setAttribute('aria-label','Go to page '+(n+1));
  if(n===page)button.setAttribute('aria-current','page');
  button.addEventListener('click',()=>{page=n;draw()});
  nav.append(button);
 };
 if(start>0){addNumber(0);if(start>1)nav.append(el('span','nr-page-ellipsis','…'))}
 for(let i=start;i<=end;i++)addNumber(i);
 if(end<max){if(end<max-1)nav.append(el('span','nr-page-ellipsis','…'));addNumber(max)}
}
function draw(){
 const list=$('userRows'),items=filtered(),limit=5,max=Math.max(0,Math.ceil(items.length/limit)-1);
 page=Math.max(0,Math.min(page,max));list.replaceChildren();
 for(const user of items.slice(page*limit,page*limit+limit)){
  const tr=el('tr');
  const identity=el('div','nr-user-identity'),avatar=el('span','nr-user-avatar',user.name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase());
  avatar.setAttribute('aria-hidden','true');const info=el('span','nr-identity-copy');info.append(el('strong','',user.name),el('small','', '@'+user.username),el('small','',user.email));identity.append(avatar,info);
  const userCell=cell();userCell.append(identity);
  const display=cell(user.displayName,'Display Name');
  const access=cell(undefined,'Role & Channel');
  const role=el('span','nr-role-chip',user.role),channel=el('small','nr-channel-summary',uniqueChannels(user).slice(0,2).join(', '));
  const extra=uniqueChannels(user).length-2;if(extra>0)channel.textContent+=' +'+extra+' lainnya';
  access.append(role,channel);
  const status=cell(undefined,'Status');status.append(el('span','nr-user-status '+(user.active?'active':'inactive'),user.active?'Aktif':'Nonaktif'));
  const updated=cell(user.updated,'Updated At');
  const action=cell(undefined,'Manage'),buttons=el('div','nr-row-actions'),edit=el('button','nr-btn nr-row-edit'),more=el('button','nr-btn nr-row-more'),menu=el('div','nr-row-menu');
  edit.type=more.type='button';edit.append(el('span','', 'Edit'));edit.setAttribute('aria-label','Edit '+user.name);edit.addEventListener('click',()=>openEditor(user));
  more.setAttribute('aria-label','More options for '+user.name);more.setAttribute('aria-haspopup','true');more.setAttribute('aria-expanded','false');
  const dots=el('span','nr-row-ellipsis','···');dots.setAttribute('aria-hidden','true');more.append(dots);
  const toggle=el('button','nr-row-menu-item',(user.active?'Nonaktifkan User':'Aktifkan User')),remove=el('button','nr-row-menu-item is-danger','Hapus User');
  toggle.type=remove.type='button';toggle.addEventListener('click',()=>{hideMenus();confirmAction(user,'toggle')});remove.addEventListener('click',()=>{hideMenus();confirmAction(user,'delete')});menu.append(toggle,remove);menu.hidden=true;
  more.addEventListener('click',event=>{
    event.stopPropagation();const next=menu.hidden;hideMenus();
    if(next){
      const rect=more.getBoundingClientRect();
      menu.style.left=Math.max(10,Math.min(window.innerWidth-204,rect.right-192))+'px';
      menu.style.top=(rect.bottom+110>window.innerHeight?Math.max(10,rect.top-100):rect.bottom+6)+'px';
    }
    menu.hidden=!next;more.setAttribute('aria-expanded',String(next))
  });
  buttons.append(edit,more,menu);action.append(buttons);tr.append(userCell,display,access,status,updated,action);list.append(tr);
 }
 $('totalCount').textContent=users.length;$('activeCount').textContent=users.filter(u=>u.active).length;$('inactiveCount').textContent=users.filter(u=>!u.active).length;
 $('resultCount').textContent=items.length+' user';$('usersEmpty').hidden=items.length>0;
 $('paginationText').textContent=items.length?'Menampilkan '+(page*limit+1)+'–'+Math.min(items.length,(page+1)*limit)+' dari '+items.length+' user':'0 user';
 $('prevPage').disabled=page===0;$('nextPage').disabled=page>=max;
 drawPagination(items.length,max);icon();
}
function hideMenus(){all('.nr-row-menu').forEach(node=>node.hidden=true);all('.nr-row-more').forEach(node=>node.setAttribute('aria-expanded','false'))}
function renderGrants(){
 const list=$('grantsList');list.replaceChildren();$('grantsCount').textContent=workingGrants.length+' assignment';
 if(!workingGrants.length)list.append(el('p','nr-grants-empty','No access assigned yet. Choose a role and channels to get started.'));
 $('grantsCount').textContent=workingGrants.length+' assigned';
 workingGrants.forEach((grant,index)=>{
  const row=el('div','nr-grant-item'),details=el('span','nr-grant-details');
  details.append(el('strong','nr-grant-role',grant.role),el('small','',grant.channel));
  const remove=el('button','nr-icon-button'),x=el('span','nr-remove-grant-icon','×');x.setAttribute('aria-hidden','true');remove.append(x);remove.type='button';
  remove.setAttribute('aria-label','Hapus '+grant.role+' dari '+grant.channel);
  remove.addEventListener('click',()=>{workingGrants.splice(index,1);renderGrants()});
  row.append(details,remove);list.append(row)
 });icon()
}
function renderChannels(){
 const list=$('deskOptions'),term=$('channelSearch').value.trim().toLowerCase();list.replaceChildren();
 const visible=channels.filter(c=>c.toLowerCase().includes(term));
 if(!visible.length)list.append(el('p','nr-grants-empty','Channel tidak ditemukan.'));
 for(const channel of visible){const label=el('label','nr-channel-item'),input=el('input'),span=el('span','',channel);input.type='checkbox';input.value=channel;input.checked=pendingChannelSelection.has(channel);input.addEventListener('change',()=>{if(input.checked)pendingChannelSelection.add(channel);else pendingChannelSelection.delete(channel);updateChannelSelection()});label.append(input,span);list.append(label)}
 updateChannelSelection();
}
function updateChannelSelection(){
 const count=pendingChannelSelection.size,visible=all('#deskOptions input'),allChecked=visible.length>0&&visible.every(c=>c.checked);
 $('selectedChannelsCount').textContent=count+' channel'+(count===1?'':'s')+' selected';
 $('addGrant').disabled=count===0;
 $('toggleAllChannels').textContent=allChecked?'Clear Visible':'Select All';
}
function selectedChannels(){return [...pendingChannelSelection]}
function addGrantFromSelection(){
 const role=$('grantRole').value,chosen=selectedChannels();
 if(!chosen.length){$('formError').textContent='Pilih minimal satu channel untuk assignment.';$('formError').hidden=false;return false}
 for(const channel of chosen)if(!workingGrants.some(item=>item.role===role&&item.channel===channel))workingGrants.push({role,channel});
 $('formError').hidden=true;pendingChannelSelection.clear();renderChannels();renderGrants();return true
}
function syncExpiration(){const on=$('fieldExpirationEnabled').checked;$('expirationField').hidden=!on;$('fieldExpirationDate').required=on;if(!on)$('fieldExpirationDate').value=''}
function openEditor(user,navigate=true){
 lastFocus=document.activeElement;editing=user?.id??null;
 $('drawerTitle').textContent=user?'Edit User':'Tambah User';
 const form=$('userForm');form.reset();$('fieldUsername').value=user?.username||'';$('fieldName').value=user?.name||'';$('fieldEmail').value=user?.email||'';
 $('fieldDisplayName').value=user?.displayName||'';$('fieldKlyId').value=user?.klyId||'';$('fieldTitle').value=user?.title||'';$('fieldPartner').value=user?.partner||'';
 $('fieldRole').value=user?.role||'Writer';$('grantRole').value=user?.role||'Writer';
 $('fieldActive').checked=user?.active??true;
 for(const [id,key] of [['fieldVerified','verified'],['fieldTwoFactor','twoFactor'],['fieldContributor','contributor'],['fieldProductManager','productManager'],['fieldAiEditor','aiEditor'],['fieldAutopilot','autopilot']])$(id).checked=!!user?.[key];
 $('fieldExpirationEnabled').checked=!!user?.expirationDate;$('fieldExpirationDate').value=user?.expirationDate||'';syncExpiration();
 $('fieldPassword').value='';$('channelSearch').value='';pendingChannelSelection.clear();workingGrants=(user?.grants||[]).map(g=>({...g}));
 renderChannels();renderGrants();$('formError').hidden=true;
 $('userListPage').hidden=true;$('userEditorPage').hidden=false;
 if(navigate)history.pushState({userView:true},'',user?'users.html?view=edit&id='+encodeURIComponent(user.id):'users.html?view=add');
 window.scrollTo(0,0);$('fieldUsername').focus()
}
function closeEditor(navigate=true){$('userEditorPage').hidden=true;$('userListPage').hidden=false;
 if(navigate&&new URLSearchParams(location.search).has('view'))history.pushState({userView:false},'','users.html');
 window.scrollTo(0,0);lastFocus?.focus()}
function confirmAction(user,type){pending={id:user.id,type};$('confirmTitle').textContent=type==='delete'?'Hapus User?':user.active?'Nonaktifkan User?':'Aktifkan User?';
 $('confirmDescription').textContent=(type==='delete'?'User '+user.name+' akan dihapus.':user.active?'Akun '+user.name+' akan dinonaktifkan.':'Akun '+user.name+' akan diaktifkan.');$('confirmBackdrop').hidden=false;$('acceptConfirm').textContent=type==='delete'?'Hapus User':'Konfirmasi';$('cancelConfirm').focus()
}
function closeConfirm(){$('confirmBackdrop').hidden=true;pending=null}
function save(event){
 event.preventDefault();const username=$('fieldUsername').value.trim(),email=$('fieldEmail').value.trim().toLowerCase(),name=$('fieldName').value.trim(),displayName=$('fieldDisplayName').value.trim(),role=$('fieldRole').value,expirationDate=$('fieldExpirationEnabled').checked?$('fieldExpirationDate').value:'';
 const error=$('formError');error.hidden=true;
 if(!username||!email||!name||!displayName||!$('fieldEmail').checkValidity()||!$('fieldUsername').checkValidity()){error.textContent='Lengkapi Username, Full Name, Display Name dan Email yang valid.';error.hidden=false;return}
 if(users.some(u=>u.id!==editing&&(u.username.toLowerCase()===username.toLowerCase()||u.email.toLowerCase()===email))){error.textContent='Username atau Email sudah digunakan.';error.hidden=false;return}
 if(selectedChannels().length){error.textContent='Click Add Access to apply your selected channels before saving.';error.hidden=false;return}
 if(!workingGrants.length){error.textContent='Tambahkan minimal satu Role & Channel Assignment.';error.hidden=false;return}
 if($('fieldExpirationEnabled').checked&&!expirationDate){error.textContent='Isi Expiration Date terlebih dahulu.';error.hidden=false;return}
 const data={username,email,name,displayName,role,klyId:$('fieldKlyId').value.trim(),title:$('fieldTitle').value.trim(),partner:$('fieldPartner').value,grants:workingGrants.map(g=>({...g})),active:$('fieldActive').checked,expirationDate,
 verified:$('fieldVerified').checked,twoFactor:$('fieldTwoFactor').checked,contributor:$('fieldContributor').checked,productManager:$('fieldProductManager').checked,aiEditor:$('fieldAiEditor').checked,autopilot:$('fieldAutopilot').checked,updated:formatNow()};
 if(editing!=null){Object.assign(users.find(u=>u.id===editing),data);log('User '+name+' diperbarui.')}else{users.unshift({...data,id:Math.max(0,...users.map(u=>u.id))+1});log('User '+name+' ditambahkan.')}
 /* Never save, log, or send password: credentials belong to the backend. */
 $('fieldPassword').value='';page=0;draw();closeEditor()
}
roles.forEach(role=>{for(const id of ['roleFilter','fieldRole','grantRole'])$(id).add(new Option(role,role))});
channels.forEach(channel=>$('channelFilter').add(new Option(channel,channel)));
const permissions=$('permissionRows');rights.forEach(([name,allowed])=>{const row=el('tr');row.append(cell(name));for(const role of roles){const td=cell(allowed.includes(role)?'✓':'—');td.className='nr-permission-cell'+(allowed.includes(role)?' is-allowed':'');row.append(td)}permissions.append(row)});
all('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{all('[data-tab]').forEach(button=>{button.classList.toggle('active',button===tab);button.setAttribute('aria-selected',String(button===tab))});['users','roles','activity'].forEach(key=>{$('panel-'+key).hidden=key!==tab.dataset.tab})}));
['userSearch','roleFilter','statusFilter','channelFilter'].forEach(id=>$(id).addEventListener(id==='userSearch'?'input':'change',()=>{page=0;draw()}));
$('prevPage').addEventListener('click',()=>{page--;draw()});$('nextPage').addEventListener('click',()=>{page++;draw()});
$('addUser').addEventListener('click',()=>openEditor());$('userForm').addEventListener('submit',save);
$('cancelDrawer').addEventListener('click',()=>closeEditor());
$('backToUsers').addEventListener('click',event=>{event.preventDefault();closeEditor()});
$('fieldExpirationEnabled').addEventListener('change',syncExpiration);
$('channelSearch').addEventListener('input',renderChannels);
$('addGrant').addEventListener('click',addGrantFromSelection);
$('toggleAllChannels').addEventListener('click',()=>{const checkboxes=all('#deskOptions input');const next=!checkboxes.every(node=>node.checked);checkboxes.forEach(node=>{node.checked=next;if(next)pendingChannelSelection.add(node.value);else pendingChannelSelection.delete(node.value)});updateChannelSelection()});
$('cancelConfirm').addEventListener('click',closeConfirm);
$('confirmBackdrop').addEventListener('click',event=>{if(event.target===$('confirmBackdrop'))closeConfirm()});
$('acceptConfirm').addEventListener('click',()=>{if(!pending)return;const user=users.find(u=>u.id===pending.id);if(user){if(pending.type==='delete'){users=users.filter(u=>u.id!==user.id);log('User '+user.name+' dihapus.')}else{user.active=!user.active;user.updated=formatNow();log('User '+user.name+' '+(user.active?'diaktifkan.':'dinonaktifkan.'))}page=0;draw()}closeConfirm()});
document.addEventListener('click',event=>{if(!event.target.closest('.nr-row-actions'))hideMenus()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){hideMenus();if(!$('confirmBackdrop').hidden)closeConfirm();else if(!$('userEditorPage').hidden)closeEditor()}});
function showViewFromUrl(){const query=new URLSearchParams(location.search),mode=query.get('view');
 if(mode==='add'){openEditor(null,false)}else if(mode==='edit'){const user=users.find(u=>String(u.id)===query.get('id'));if(user)openEditor(user,false);else closeEditor(false)}else closeEditor(false)
}
window.addEventListener('popstate',showViewFromUrl);
drawLog();draw();showViewFromUrl();icon();
})();