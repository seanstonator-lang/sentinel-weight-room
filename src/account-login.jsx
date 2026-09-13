import { WelcomeScreen } from './App.jsx';
import React, {useEffect,useState} from 'react';
export function AccountLogin({request,onLogin,message,setMessage}) {
  const [accounts,setAccounts]=useState({students:[],teachers:[]});
  const [role,setRole]=useState(null);
  const [id,setId]=useState('');
  const [pin,setPin]=useState('');
  const [query,setQuery]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{request('/accounts').then(setAccounts).catch(e=>setMessage(e.message));},[]);
  const people=role==='student'?accounts.students:accounts.teachers;
  const input={display:'block',width:'100%',boxSizing:'border-box',padding:12,margin:'10px 0',fontSize:16,borderRadius:8};
  if (!role) return <WelcomeScreen onRole={next => {setRole(next);setMessage('');}}/>;
  return <form style={{maxWidth:430,width:'100%'}} onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('Signing in…');try{await request('/login',{method:'POST',body:JSON.stringify(role==='admin'?{password:pin}:{role,id,pin})});setPin('');await onLogin();}catch(e){setMessage(e.message);}finally{setBusy(false);}}}>
    <button type="button" onClick={()=>{setRole(null);setPin('');setId('');setQuery('');setMessage('');}}>Back</button><h1>Sentinel Weight Room</h1><p>Choose your name and enter your own code.</p>
    <label htmlFor="account-role">I am a</label><select id="account-role" style={input} value={role} onChange={e=>{setRole(e.target.value);setId('');setPin('');setMessage('');}}><option value="student">Student</option><option value="teacher">Teacher</option><option value="sub">Substitute</option><option value="admin">Server administrator</option></select>
    {role!=='admin' && <><label htmlFor="account-search">Find your name</label><input id="account-search" style={input} value={query} onChange={e=>setQuery(e.target.value)}/><label htmlFor="account-name">Your name</label><select id="account-name" required style={input} value={id} onChange={e=>setId(e.target.value)}><option value="">Choose your name</option>{people.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><p>Not listed? Your teacher can add you to the roster.</p></>}
    <label htmlFor="account-pin">{role==='admin'?'Administrator password':role==='sub'?'Substitute code':'Your 4-digit code'}</label><input id="account-pin" style={input} type="password" autoComplete="current-password" inputMode={role==='admin'?'text':'numeric'} required pattern={role==='admin'||role==='sub'?undefined:'[0-9]{4}'} maxLength={role==='admin'||role==='sub'?undefined:4} value={pin} onChange={e=>setPin(e.target.value)}/>
    <button disabled={busy} style={{padding:'12px 20px',fontSize:16}} type="submit">Sign in</button><p role="status">{message}</p>
  </form>;
}
