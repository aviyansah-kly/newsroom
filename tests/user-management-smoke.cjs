const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const html=fs.readFileSync('users.html','utf8');
const js=fs.readFileSync('scripts/newsroom-user-management.js','utf8');
const css=fs.readFileSync('styles/newsroom-user-management.css','utf8');
const nav=fs.readFileSync('scripts/newsroom-global-navigation.js','utf8');

test('Users, permissions, activity, dialog and CRUD controls exist',()=>{
 for(const id of ['userRows','userSearch','roleFilter','statusFilter','panel-users','panel-roles','panel-activity','userDrawer','userForm','confirmBackdrop']){
   assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/role="tabpanel"/);
 assert.match(js,/function openDrawer/);
 assert.match(js,/function save/);
 assert.match(js,/function confirmAction/);
});
test('prototype remains dummy-only with no backend or account mutation',()=>{
 assert.match(html,/data dummy/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
});
test('table has stable widths, 14px row content, legible action controls',()=>{
 assert.match(css,/table-layout:fixed/);
 assert.match(css,/\.nr-users-table td\{[^}]*font-size:14px/);
 assert.match(css,/\.nr-users-table th:nth-child\(6\)/);
 assert.match(css,/\.nr-row-actions/);
 assert.match(js,/dataset\.label/);
});
test('mobile users become labeled cards and permissions remain horizontally scrollable',()=>{
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/#panel-users \.nr-users-table tr\{display:grid/);
 assert.match(css,/content:attr\(data-label\)/);
 assert.match(css,/\.nr-permissions\{min-width:800px\}/);
});
test('uses Newsroom design tokens, handles dark mode and selected navigation',()=>{
 assert.match(css,/var\(--nr-border/);
 assert.match(css,/html\[data-theme="dark"\] \.nr-users-page/);
 assert.match(nav,/classList\.contains\('nr-users-page'\)/);
 assert.match(nav,/aria-current/);
 assert.match(nav,/User Management/);
 assert.match(nav,/users.html/);
});

test('legacy CMS account fields and per-channel role controls exist',()=>{
 for(const id of ['fieldUsername','fieldDisplayName','fieldKlyId','fieldTitle','fieldPartner',
  'fieldVerified','fieldTwoFactor','fieldContributor','fieldProductManager','fieldAiEditor','fieldAutopilot',
  'fieldExpirationEnabled','fieldExpirationDate','fieldPassword','grantRole','deskOptions','grantsList','addGrant']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(js,/function addGrantFromSelection/);
 assert.match(js,/pendingChannelSelection/);
 assert.match(js,/function confirmAction/);
});
test('No passwords persisted in user state and role/category assignments are isolated',()=>{
 assert.match(js,/workingGrants\.map\(g=>\(\{\.\.\.g\}\)\)/);
 assert.match(js,/\$\('fieldPassword'\)\.value=''/);
});
