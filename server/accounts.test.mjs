import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from './server.mjs';
test('individual codes, scoped reads/writes, substitute attendance, logout and code reset',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'sentinel-accounts-'));
 const origin='http://localhost:3000',password='test-admin-password-only';
 const server=createApp({databasePath:join(dir,'db.sqlite'),password,publicOrigin:origin,secureCookie:false});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const call=async(path,method='GET',body,cookie='')=>fetch(base+'/api'+path,{method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const login=async(body)=>{const r=await call('/login','POST',body);assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];};
 try {
 const admin=await login({password});
 async function put(key,value,cookie=admin){const current=await (await call('/records/sw3:'+key,'GET',undefined,cookie)).json();return call('/records/sw3:'+key,'PUT',{value:JSON.stringify(value),revision:current.revision},cookie);}
 const students=[{id:'a',name:'Alice',pin:'1234',classId:'c',groupId:'g'},{id:'b',name:'Bob',pin:'5678',classId:'other'}];
 await put('students',students);await put('teachers',[{id:'t',name:'Teacher',pin:'1357',subCode:'sub-secret'}]);await put('classes',[{id:'c',teacherId:'t',name:'Class',joinCode:'class-secret'}]);
 await put('logs:b',[{id:'b-log',weight:200}]);await put('checkins',{b:[{id:'b-check',score:25}]});
 const directory=await (await call('/accounts')).json();assert.deepEqual(Object.keys(directory.students[0]).sort(),['id','name']);assert.ok(!JSON.stringify(directory).includes('1357'));
 assert.equal((await call('/login','POST',{role:'student',id:'a',pin:'9999'})).status,401);
 const student=await login({role:'student',id:'a',pin:'1234'});
 const rows=await (await call('/records','GET',undefined,student)).json();
 assert.equal(rows.identity.role,'student');const data=Object.fromEntries(rows.records.map(r=>[r.key,JSON.parse(r.value)]));
 assert.equal(data['sw3:students'].length,1);assert.ok(!('pin' in data['sw3:students'][0]));assert.deepEqual(data['sw3:checkins'],{});
 assert.equal((await (await call('/records/sw3:logs:b','GET',undefined,student)).json()).value,null);
 for(const key of ['teachers','teacherCode','schedule','maxes','logs:b'])assert.equal((await put(key,[],student)).status,403,key);
 assert.equal((await put('students',[{...data['sw3:students'][0],pin:'0000'}],student)).status,403);
 assert.equal((await put('students',[{...data['sw3:students'][0],heightIn:70}],student)).status,200);
 assert.equal((await put('logs:a',[{id:'a-log',weight:100}],student)).status,200);
 assert.equal((await put('checkins',{a:[{id:'a-check',score:80}]},student)).status,200);
 const teacher=await login({role:'teacher',id:'t',pin:'1357'});
 const checkins=JSON.parse((await (await call('/records/sw3:checkins','GET',undefined,teacher)).json()).value);
 assert.equal(checkins.a[0].score,80);assert.equal(checkins.b[0].score,25);
 const sub=await login({role:'sub',id:'t',pin:'sub-secret'});
 const subdata=await (await call('/records','GET',undefined,sub)).json();
 assert.equal(JSON.parse(subdata.records.find(r=>r.key==='sw3:students').value).length,1);
 assert.equal((await put('attendance',{a:[{id:'present',present:true}]},sub)).status,200);
 assert.equal((await put('attendance',{b:[]},sub)).status,403);
 assert.equal((await put('checkins',{},sub)).status,403);
 await call('/logout','POST',{},student);assert.equal((await call('/records','GET',undefined,student)).status,401);
 const student2=await login({role:'student',id:'a',pin:'1234'});
 await put('students',students.map(s=>s.id==='a'?{...s,pin:'4321'}:s));
 assert.equal((await call('/records','GET',undefined,student2)).status,401);
 for(let n=0;n<10;n++)await call('/login','POST',{role:'student',id:'a',pin:'9999'});
 assert.equal((await call('/login','POST',{role:'student',id:'a',pin:'4321'})).status,429);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
