const assert=require('node:assert/strict');
const {test}=require('node:test');
const {create}=require('../scripts/components/tag-input-legacy-adapter.js');
const catalogue=()=>['Harga BBM','APBN','Vietnam','Timnas Indonesia'];
test('legacy Tags mirror stays independent and reconciles restored draft',()=>{
 const tags=create({initial:['Vietnam'],catalogue});
 const keywords=create({initial:['APBN'],catalogue});
 assert.deepEqual(tags.getItems(),['Vietnam']);
 assert.equal(tags.reconcile(['Vietnam','Harga BBM']),true);
 assert.equal(tags.reconcile(['Vietnam','Harga BBM']),false);
 assert.deepEqual(keywords.getItems(),['APBN']);
});
test('suggestions share model matching without changing state',()=>{
 const tags=create({initial:['Vietnam'],catalogue});
 assert.deepEqual(tags.suggestions('harga'),['Harga BBM']);
 assert.deepEqual(tags.suggestions(''),[]);
 assert.deepEqual(tags.getItems(),['Vietnam']);
});
test('add plan rejects duplicates in any casing and enforces max',()=>{
 const tags=create({initial:['Vietnam','APBN','Harga BBM','Timnas Indonesia'],catalogue,max:4});
 assert.equal(tags.planAdd('vietnam').reason,'duplicate');
 assert.equal(tags.planAdd('another').reason,'limit');
 assert.deepEqual(tags.getItems(),['Vietnam','APBN','Harga BBM','Timnas Indonesia']);
});
test('remove plan preserves original editor state and allows later reconciliation',()=>{
 const tags=create({initial:['Vietnam','APBN'],catalogue});
 assert.deepEqual(tags.planRemove('Vietnam'),{ok:true,items:['APBN']});
 assert.deepEqual(tags.getItems(),['Vietnam','APBN']);
 tags.reconcile(['APBN']);
 assert.deepEqual(tags.getItems(),['APBN']);
});
test('canonical restore enforces five and trims duplicates',()=>{
 const tags=create({catalogue});
 tags.reconcile([' APBN ','apbn','Vietnam','Harga BBM','Timnas Indonesia','One','Two']);
 assert.deepEqual(tags.getItems(),['APBN','Vietnam','Harga BBM','Timnas Indonesia','One']);
});
