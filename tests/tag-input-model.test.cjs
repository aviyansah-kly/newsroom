/* Shared TagInput behaviour regression — pure JS, no browser required. */
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {create,normalize}=require('../scripts/components/tag-input-model.js');
test('normalization and unique case-insensitive items',()=>{
 assert.equal(normalize('  Berita   Nasional  '),'Berita Nasional');
 const m=create({initial:['Pemerintah',' pemerintah ','APBN','APBN'],max:5});
 assert.deepEqual(m.getItems(),['Pemerintah','APBN']);
 assert.deepEqual(m.add(' PEMERINTAH ').reason,'duplicate');
 assert.deepEqual(m.getItems(),['Pemerintah','APBN']);
});
test('maximum item limit blocks beyond five and ignores empty',()=>{
 const m=create();
 assert.equal(m.add(' ').reason,'empty');
 for(let i=0;i<5;i++)assert.equal(m.add('Keyword '+i).ok,true);
 assert.equal(m.add('Keyword 6').reason,'limit');
 assert.equal(m.getItems().length,5);
});
test('search suggestions use catalogue, matching and exclude selected items',()=>{
 const catalogue=['APBN','Pemerintah','Energi','APBN','Berita Nasional'];
 const m=create({initial:['APBN'],catalogue:()=>catalogue});
 assert.deepEqual(m.suggestions(''),[]);
 assert.deepEqual(m.suggestions('p'),['Pemerintah']);
 assert.deepEqual(m.suggestions('e'),['Pemerintah','Energi','Berita Nasional']);
 assert.deepEqual(m.suggestions('berita'),['Berita Nasional']);
 assert.deepEqual(m.suggestions('missing'),[]);
});
test('tag click-select, keyboard-select and removals can share mutations',()=>{
 const calls=[];
 const m=create({catalogue:()=>['Energi','APBN'],onChange:items=>calls.push(items)});
 assert.equal(m.suggestions('en')[0],'Energi');
 assert.equal(m.add(m.suggestions('en')[0]).ok,true);
 assert.deepEqual(m.getItems(),['Energi']);
 assert.equal(m.remove('energi'),true);
 assert.deepEqual(m.getItems(),[]);
 assert.equal(m.remove('none'),false);
 assert.equal(calls.length,2);
});
test('SEO focus keyword and selected chips stay in sync',()=>{
 const m=create({initial:['Virgo Transport','Bangkai Kapal']});
 assert.equal(m.getItems()[0],'Virgo Transport');
 m.replaceFirst('Pelabuhan');
 assert.deepEqual(m.getItems(),['Pelabuhan','Bangkai Kapal']);
 m.replaceFirst('Bangkai Kapal');
 assert.deepEqual(m.getItems(),['Bangkai Kapal']);
 m.replaceFirst('');
 assert.deepEqual(m.getItems(),[]);
});
test('defensive copies prevent state drift and catalogue failures are isolated',()=>{
 const m=create({initial:['Tags'],catalogue:()=>{throw Error('offline')}});
 const arr=m.getItems();
 arr.push('external');
 assert.deepEqual(m.getItems(),['Tags']);
 assert.deepEqual(m.suggestions('x'),[]);
});
test('invalid configuration rejected',()=>{
 assert.throws(()=>create({max:0}),/positive integer/);
 assert.throws(()=>create({catalogue:[]}),/functions/);
});
