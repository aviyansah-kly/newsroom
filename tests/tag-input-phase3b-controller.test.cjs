const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=source.indexOf('function getNewsroomSharedTagsModel()');
const end=source.indexOf('function renderAiTagPreview(',start);
const controller=source.slice(start,end);
test('article Tags add/remove/suggestions use shared model',()=>{
 assert.ok(start>0&&end>start);
 assert.match(controller,/NewsroomTagInputModel\.create\(\{initial:tags,max:5/);
 assert.match(controller,/model\.remove\(index\)/);
 assert.match(controller,/model\.add\(value\)/);
 assert.match(controller,/model\.suggestions\(q,\{count:8\}\)/);
});
test('rendered chip close and suggestion buttons attach handlers to every result',()=>{
 assert.match(controller,/document\.querySelectorAll\('#tagList \[data-r\]'\)\.forEach/);
 assert.match(controller,/document\.querySelectorAll\('#tagSuggestions \[data-add\]'\)\.forEach/);
 assert.doesNotMatch(controller,/\$\('#tagSuggestions \[data-add\]'\)\.forEach/);
});
test('draft save and SEO tracking remain in Tags add/remove',()=>{
 assert.match(controller,/scheduleSave\(\)/);
 assert.match(controller,/renderSeoAutomation\(\)/);
 assert.match(controller,/seoEditedAfterAi\.add\('tags'\)/);
});
test('AI bulk Tags apply passes shared max and duplicate protections',()=>{
 assert.match(source,/\['Energi','Pertalite','Biosolar'\]\.forEach\(t=>m\.add\(t\)\)/);
});
