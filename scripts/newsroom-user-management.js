(()=>{'use strict';
const roles=['Writer','Editor','Redpel','SEO','Admin'],desks=['News','Bisnis','Bola','Showbiz','Tekno'];
const rights=[['Buat Artikel',['Writer','Editor','Redpel']],['Edit Artikel Sendiri',['Writer','Editor','Redpel']],['Review Artikel',['Editor','Redpel']],['Publish Artikel',['Redpel']],['Edit SEO Attributes',['Editor','Redpel','SEO']],['Kelola User',['Admin']]];
const seed=[{id:1,name:'Andi Pratama',email:'andi@example.com',role:'Writer',desks:['News'],active:true,last:'21 Okt 2026'},{id:2,name:'Siti Rahma',email:'siti@example.com',role:'Editor',desks:['News','Bisnis'],active:true,last:'22 Okt 2026'},{id:3,name:'Budi Santoso',email:'budi@example.com',role:'Redpel',desks:['Bola'],active:true,last:'20 Okt 2026'},{id:4,name:'Rina Putri',email:'rina@example.com',role:'SEO',desks:['Bisnis'],active:false,last:'14 Okt 2026'},{id:5,name:'Dina Lestari',email:'dina@example.com',role:'Writer',desks:['Showbiz'],active:true,last:'22 Okt 2026'},{id:6,name:'Rafi Hidayat',email:'rafi@example.com',role:'Admin',desks:['News'],active:true,last:'21 Okt 2026'}];
let users=seed.map(x=>({...x,desks:[...x.desks]})),logs=[{when:'Demo',message:'Activity Log siap digunakan untuk simulasi perubahan akun.'}],page=0,editing=null,pending=null,lastFocus=null;
const $=id=>document.getElementById(id),all=selector=>[...document.querySelectorAll(selector)];
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function icon(){window.lucide?.createIcons()}
function log(message){logs.unshift({when:new Date().toLocaleString('id-ID'),message});drawLog()}
function drawLog(){const target=$('activityItems');target.replaceChildren();logs.forEach(item=>{const li=el('li'),strong=el('strong','',item.when),p=el('p','',item.message);li.append(strong,p);target.append(li)})}
function filtered(){const q=$('userSearch').value.trim().toLocaleLowerCase(),r=$('roleFilter').value,s=$('statusFilter').value;return users.filter(u=>(!q||(u.name+' '+u.email).toLocaleLowerCase().includes(q))&&(!r||u.role===r)&&(!s||(s==='active')===u.active))}
function draw(){
 const target=$('userRows'),rows=filtered(),limit=5,max=Math.max(0,Math.ceil(rows.length/limit)-1);
 page=Math.min(page,max);target.replaceChildren();
 for(const u of rows.slice(page*limit,page*limit+limit)){
  const tr=el('tr');
  const first=el('td'),identity=el('div','nr-user-identity');
  const avatar=el('span','nr-user-avatar',u.name.split(' ').map(t=>t[0]).slice(0,2).join(''));
  avatar.setAttribute('aria-hidden','true');
  const person=el('span'),name=el('strong','',u.name),email=el('small','',u.email);
  person.append(name,email);identity.append(avatar,person);first.append(identity);
  const role=el('td');role.dataset.label='Primary Role';role.append(el('span','nr-role-chip',u.role));
  const desk=el('td','',u.desks.join(', ')||'—');desk.dataset.label='Desk / Vertical';
  const status=el('td');status.dataset.label='Status';
  status.append(el('span','nr-user-status '+(u.active?'active':'inactive'),u.active?'Aktif':'Nonaktif'));
  const last=el('td','',u.last);last.dataset.label='Last Login';
  const action=el('td');action.dataset.label='Aksi';
  const wrap=el('div','nr-row-actions');
  const edit=el('button','nr-icon-button'),toggle=el('button','nr-icon-button'+(u.active?' is-destructive':''));
  edit.type=toggle.type='button';
  const editIcon=el('i');editIcon.setAttribute('data-lucide','pencil');
  edit.append(editIcon,document.createTextNode('Edit'));
  edit.setAttribute('aria-label','Edit '+u.name);
  edit.addEventListener('click',()=>openDrawer(u));
  const toggleIcon=el('i');toggleIcon.setAttribute('data-lucide',u.active?'user-round-x':'user-round-check');
  toggle.append(toggleIcon,document.createTextNode(u.active?'Nonaktifkan':'Aktifkan'));
  toggle.setAttribute('aria-label',(u.active?'Nonaktifkan ':'Aktifkan ')+u.name);
  toggle.addEventListener('click',()=>confirmToggle(u));
  wrap.append(edit,toggle);action.append(wrap);tr.append(first,role,desk,status,last,action);target.append(tr);
 }
 $('totalCount').textContent=users.length;
 $('activeCount').textContent=users.filter(u=>u.active).length;
 $('inactiveCount').textContent=users.filter(u=>!u.active).length;
 $('resultCount').textContent=rows.length+' user';
 $('usersEmpty').hidden=rows.length>0;
 $('paginationText').textContent=rows.length?'Menampilkan '+(page*limit+1)+'–'+Math.min(rows.length,(page+1)*limit)+' dari '+rows.length+' user':'0 user';
 $('prevPage').disabled=page===0;$('nextPage').disabled=page>=max;
 icon();
}
function openDrawer(user){lastFocus=document.activeElement;editing=user?.id??null;$('drawerTitle').textContent=user?'Edit User':'Tambah User';$('fieldName').value=user?.name||'';$('fieldEmail').value=user?.email||'';$('fieldRole').value=user?.role||'Writer';$('fieldActive').checked=user?.active??true;all('#deskOptions input').forEach(c=>c.checked=!!user?.desks.includes(c.value));$('formError').hidden=true;$('drawerBackdrop').hidden=$('userDrawer').hidden=false;document.body.classList.add('nr-modal-open');$('fieldName').focus()}
function closeDrawer(){$('drawerBackdrop').hidden=$('userDrawer').hidden=true;document.body.classList.remove('nr-modal-open');lastFocus?.focus()}
function confirmToggle(user){pending=user.id;$('confirmTitle').textContent=user.active?'Nonaktifkan User?':'Aktifkan User?';$('confirmDescription').textContent=(user.active?'Akses akun '+user.name+' akan dinonaktifkan.':'Akses akun '+user.name+' akan diaktifkan.')+' Tindakan ini hanya simulasi.';$('confirmBackdrop').hidden=false;$('cancelConfirm').focus()}
function closeConfirm(){$('confirmBackdrop').hidden=true;pending=null}
function save(event){event.preventDefault();const name=$('fieldName').value.trim(),email=$('fieldEmail').value.trim().toLowerCase(),role=$('fieldRole').value,selected=all('#deskOptions input:checked').map(e=>e.value);const err=$('formError');if(!name||!email||!$('fieldEmail').checkValidity()||!selected.length){err.textContent='Isi nama, email valid, dan minimal satu desk.';err.hidden=false;return}if(users.some(x=>x.email.toLowerCase()===email&&x.id!==editing)){err.textContent='Email sudah terdaftar.';err.hidden=false;return}const data={name,email,role,desks:selected,active:$('fieldActive').checked};if(editing!=null){const user=users.find(x=>x.id===editing);Object.assign(user,data);log('User '+name+' diperbarui.')}else{users.unshift({...data,id:Math.max(0,...users.map(u=>u.id))+1,last:'Belum Login'});log('User '+name+' ditambahkan.')}page=0;draw();closeDrawer()}
roles.forEach(role=>{$('roleFilter').add(new Option(role,role));$('fieldRole').add(new Option(role,role))});desks.forEach(d=>{const label=el('label'),c=document.createElement('input');c.type='checkbox';c.value=d;label.append(c,document.createTextNode(d));$('deskOptions').append(label)});
const body=$('permissionRows');rights.forEach(([name,allowed])=>{const row=el('tr');row.append(el('td','',name));roles.forEach(r=>row.append(el('td','nr-permission-cell'+(allowed.includes(r)?' is-allowed':''),allowed.includes(r)?'✓':'—')));body.append(row)});
all('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{all('[data-tab]').forEach(x=>{x.classList.toggle('active',x===tab);x.setAttribute('aria-selected',String(x===tab))});['users','roles','activity'].forEach(x=>{$('panel-'+x).hidden=x!==tab.dataset.tab})}));
['userSearch','roleFilter','statusFilter'].forEach(id=>$(id).addEventListener(id==='userSearch'?'input':'change',()=>{page=0;draw()}));
$('prevPage').addEventListener('click',()=>{page--;draw()});$('nextPage').addEventListener('click',()=>{page++;draw()});$('addUser').addEventListener('click',()=>openDrawer());$('userForm').addEventListener('submit',save);$('closeDrawer').addEventListener('click',closeDrawer);$('cancelDrawer').addEventListener('click',closeDrawer);$('drawerBackdrop').addEventListener('click',closeDrawer);$('cancelConfirm').addEventListener('click',closeConfirm);$('confirmBackdrop').addEventListener('click',e=>{if(e.target===$('confirmBackdrop'))closeConfirm()});$('acceptConfirm').addEventListener('click',()=>{const user=users.find(u=>u.id===pending);if(user){user.active=!user.active;log('Akun '+user.name+' '+(user.active?'diaktifkan.':'dinonaktifkan.'));draw()}closeConfirm()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('confirmBackdrop').hidden)closeConfirm();else if(!$('userDrawer').hidden)closeDrawer()}});
drawLog();draw();icon();
})();