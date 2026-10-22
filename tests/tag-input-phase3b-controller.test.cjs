const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const editor=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const bridge=fs.readFileSync(path.join(__dirname,'../scripts/newsroom-editorial-reusable.js'),'utf8');
test('protected inline editor remains unchanged and owns draft/SEO updates',()=>{
 assert.match(editor,/function renderTags\(/);
 assert.match(editor,/function addExistingTag\(/);
 assert.match(editor,/scheduleSave\(\)/);
 assert.match(editor,/renderSeoAutomation\(\)/);
 assert.doesNotMatch(editor,/function getNewsroomSharedTagsModel\(/);
});
test('external shared model validates suggestion adds, AI preview, and chip removal',()=>{
 assert.match(bridge,/mirror\.checkAdd\(button\.dataset\.add\)/);
 assert.match(bridge,/mirror\.checkAdd\(button\.dataset\.previewTag\)/);
 assert.match(bridge,/mirror\.checkRemove\(position\)/);
 assert.match(bridge,/mirror\.planRemove\(value\)/);
});
test('Enter and click use existing draft-saving Tags add event',()=>{
 assert.match(bridge,/selected\.click\(\)/);
 assert.match(bridge,/new CustomEvent\('newsroom:add-existing-tag'/);
 assert.match(editor,/window\.addEventListener\('newsroom:add-existing-tag'/);
});
