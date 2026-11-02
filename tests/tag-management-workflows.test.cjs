const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const page=fs.readFileSync('tags.html','utf8');
const css=fs.readFileSync('styles/newsroom-tags-workflows.css','utf8');
test('Merge Tag offers source and searched destination with explicit confirmation',()=>{
 for(const id of ['mergeTagModal','mergeTargetSearch','mergeTargetResults','mergeSourceName','mergeTargetName','mergeConfirm'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/tag\.index!==mergingIndex/);
 assert.match(page,/mergingIndex===mergeDestinationIndex/);
 assert.match(page,/destination\.usage\+=source\.usage/);
 assert.match(page,/data\.splice\(mergingIndex,1\)/);
});
test('Edit Topic is gated by active Topic and preserves its content fields',()=>{
 assert.match(page,/x\.topic\?'<button class="row-action topic-edit-action"/);
 assert.match(page,/if\(index<0\|\|!data\[index\]\?\.topic\)return/);
 for(const id of ['topicEditorModal','topicTitle','topicIntro','topicBody','topicSeoTitle','topicSeoDescription','topicEditorForm'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/tag\.topicContent=\{title,intro,body:/);
});
test('new interactions inherit theme tokens and mobile modal',()=>{
 assert.match(css,/var\(--nr-surface\)/);
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(page,/styles\/newsroom-tags-workflows\.css/);
});
test('all Tags row actions bind across every row',()=>{
 for(const selector of ['edit-tag','merge-tag','topic-edit-action']){
  assert.ok(page.includes("$$('."+selector+"').forEach"),'missing querySelectorAll for '+selector);
  assert.ok(!page.includes(" $('."+selector+"').forEach"),'incorrect single selector for '+selector);
 }
});
