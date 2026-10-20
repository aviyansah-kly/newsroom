/* Static gate for the isolated Design System V3 refactor. No browser needed. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const html=read('index.html');
const shell=read('scripts/newsroom-shell.js');
const registry=JSON.parse(read('design-system/component-theme-registry.json'));
const tokens=read('styles/newsroom-theme-tokens.css');
const styles=read('styles/newsroom-theme-components.css');
const popupMarkers=(html.match(/SIXDESK_SINGLE_POPUP_MANAGER_START/g)||[]).length;
assert.equal(popupMarkers,2,'Preserve the protected index.html baseline including inert first copy');
const lucide=html.match(/<script src="https:\/\/unpkg\.com\/lucide@latest">([\s\S]*?)<\/script>/);
assert.ok(lucide,'Lucide import must remain present');
assert.ok(lucide[1].includes('SIXDESK_SINGLE_POPUP_MANAGER_START'),'Protected legacy script body must remain unchanged pending separately approved index.html migration');
assert.match(html,/window\.sixdeskCloseWorkspacePopups/,'Keep the original live popup manager');
assert.ok(shell.indexOf('styles/newsroom-theme-tokens.css')>=0);
assert.ok(shell.indexOf('styles/newsroom-theme-tokens.css')<shell.indexOf("styles/newsroom-theme-components.css"),'Theme tokens must load before component CSS');
assert.equal(registry.sourceOfTruth,'styles/newsroom-theme-tokens.css');
assert.equal(registry.components.length,19);
assert.ok(registry.components.some(x=>x.id==='shared-tag-input-behavior'),'Phase 3 TagInput must be registered');
assert.ok(registry.components.some(x=>x.id==='shared-icon-box'));
assert.ok(registry.components.some(x=>x.id==='editorial-team-picker'));
const decl=new Map();
for(const m of tokens.matchAll(/(^|\n)(:root|html\[data-theme="dark"\])\s*\{([^{}]*)\}/g)){
  const scope=m[2];
  for(const x of m[3].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)){
    const key=scope+'|'+x[1];
    assert.ok(!decl.has(key),'Duplicate canonical token declaration: '+key);
    decl.set(key,x[2].trim());
  }
}
assert.ok(decl.size>=50,'Canonical tokens should retain all existing roles');
assert.ok(!/(^|\n)(:root|html\[data-theme="dark"\])\s*\{[^{}]*--nr-ui-/m.test(styles),'Tokens must not be duplicated in component selectors');
for(const [name,key] of Object.entries(registry.tokens)){
 if(['navigationFontSize'].includes(name))continue; // deliberate existing shell owner
 const defined=[...decl.keys()].some(k=>k.endsWith('|'+key));
 // Some legacy semantic aliases remain owned by dark-mode.css, but the
 // V3 tokens must cover the new/registered shared component roles.
 if(['iconBoxBg','iconBoxBorder','iconBoxInk','iconBoxRadius','sidebarCollapseIconSize'].includes(name)){
   assert.ok(defined,'Missing migrated token '+name+': '+key);
 }
}
console.log('Design System V3 source contract OK (Editor HTML protected):',{
 popupManagers:popupMarkers,components:registry.components.length,scopedTokenDeclarations:decl.size
});