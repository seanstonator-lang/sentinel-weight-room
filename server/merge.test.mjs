import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeRecords } from '../src/merge-records.js';
test('two students can append records without overwriting one another',()=>{
  const first={id:'a',weight:100},second={id:'b',weight:200};
  assert.deepEqual(mergeRecords([], [first], [second]), [second,first]);
});
test('independent students can save shared check-in or nutrition maps',()=>{
  assert.deepEqual(mergeRecords({}, {a:[{id:'1'}]}, {b:[{id:'2'}]}), {a:[{id:'1'}],b:[{id:'2'}]});
});
test('successive local writes preserve remote changes missing from local UI state',()=>{
  const base=[{id:'a',weight:100}];
  const local=[{id:'a',weight:105}];
  const remote=[{id:'a',weight:100},{id:'b',weight:200}];
  assert.deepEqual(mergeRecords(base,local,remote),[{id:'a',weight:105},{id:'b',weight:200}]);
});
test('same-field collisions and deletion/edit collisions are rejected',()=>{
  assert.throws(()=>mergeRecords({weight:100},{weight:110},{weight:120}));
  assert.throws(()=>mergeRecords([{id:'a',weight:100}],[],[{id:'a',weight:110}]));
});
test('unrelated profile patches merge and new records merge from empty storage',()=>{
  assert.deepEqual(mergeRecords({name:'A',height:70},{name:'B',height:70},{name:'A',height:71}),{name:'B',height:71});
  assert.deepEqual(mergeRecords(null,{a:1},{b:2}),{a:1,b:2});
});
