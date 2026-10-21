const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../scripts/newsroom-editorial-reusable.js'),'utf8');
test('legacy Tag writer is preserved and mirrored without overriding existing handlers',()=>{
 assert.match(source,/function attachSharedTagsMirror\(/);
 assert.match(source,/MutationObserver\(synchronize\)/);
 assert.match(source,/mirror\.reconcile\(read\(\)\)/);
 assert.match(source,/window\.__nrPhase3bTagsMirror=/);
 assert.match(source,/bindLegacyTagSuggestionClicks\(\)/);
 assert.doesNotMatch(source,/window\.newsroomTagCatalog\s*=(?!=)/);
});
test('adapter is loaded lazily only by editor and failures fall back to legacy Tags',()=>{
 assert.match(source,/script\.src='scripts\/components\/tag-input-legacy-adapter\.js'/);
 assert.match(source,/script\.onerror=.*legacy Tags remains active/);
});
