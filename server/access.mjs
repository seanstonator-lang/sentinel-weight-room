const mapKeys = new Set(['checkins','maxes','comments','fuelLogs','injuries','weightConcerns','attendance','personalSchedule']);
const writableMaps = new Set(['checkins','comments','fuelLogs','injuries','weightConcerns']);
const sharedKeys = new Set(['custom','programs','schedule','hiddenBuiltins','cycles','goals','announcements','testingDays']);
const profileFields = new Set(['mealSlots','workoutTime','nutritionTargets','gender','weightGoal','photo','avatarStyle','heightIn','trainingGoal','hideFromLeaderboard']);
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const deny = () => { throw Object.assign(new Error('This account cannot change that record.'),{status:403}); };
const clean = ({pin,subCode,...person}) => person;
export function projectRecord(row, identity) {
  if (identity.role === 'teacher' || identity.role === 'admin') return row;
  const key=row.key.replace(/^sw3:/,'');
  const value=row.value===null ? null : JSON.parse(row.value);
  let result=null;
  if(identity.role==='sub') {
    if(sharedKeys.has(key))result=value;
    else if(key==='teachers')result=(value||[]).filter(p=>p.id===identity.id).map(p=>({id:p.id,name:p.name}));
    else if(key==='students')result=(value||[]).filter(p=>identity.studentIds.includes(p.id)).map(p=>({id:p.id,name:p.name,classId:p.classId,groupId:p.groupId}));
    else if(key==='classes')result=(value||[]).filter(p=>identity.classIds.includes(p.id)).map(({joinCode,...p})=>p);
    else if(key==='groups')result=(value||[]).filter(p=>identity.classIds.includes(p.classId));
    else if(key==='attendance')result=Object.fromEntries(Object.entries(value||{}).filter(([id])=>identity.studentIds.includes(id)));
    return {...row,value:result===null?null:JSON.stringify(result)};
  }
  if (sharedKeys.has(key)) result=value;
  else if (key==='students') result=(value||[]).filter(p=>p.id===identity.id).map(clean);
  else if (key==='teachers') result=[];
  else if (key==='classes') result=(value||[]).filter(p=>p.id===identity.classId).map(({joinCode,...p})=>p);
  else if (key==='groups') result=(value||[]).filter(p=>p.classId===identity.classId);
  else if (mapKeys.has(key)) result=value && Object.hasOwn(value,identity.id) ? {[identity.id]:value[identity.id]} : {};
  else if (key==='logs:'+identity.id) result=value;
  else if (key==='prFeed') result=(value||[]).filter(p=>p.studentId===identity.id);
  return {...row,value:result===null?null:JSON.stringify(result)};
}
export function applyStudentWrite(key, value, existing, identity, method) {
  key=key.replace(/^sw3:/,'');
  if(identity.role==='sub') {
    if(key!=='attendance'||method!=='PUT'||!value||Array.isArray(value)||Object.keys(value).some(id=>!identity.studentIds.includes(id)))return deny();
    return {...(existing||{}),...value};
  }
  if(method==='DELETE') { if(key==='logs:'+identity.id) return null; return deny(); }
  if(key==='logs:'+identity.id) {if(!Array.isArray(value))return deny();return value;}
  if(writableMaps.has(key)) {
    if(!value || Array.isArray(value) || Object.keys(value).some(id=>id!==identity.id) || !Array.isArray(value[identity.id]))return deny();
    if(key==='injuries'||key==='weightConcerns') {
      const old=existing?.[identity.id]||[];
      if(old.some(r=>!value[identity.id].some(n=>equal(n,r))) || value[identity.id].some(r=>!old.some(o=>o.id===r.id)&&r.status!=='open')) return deny();
    }
    return {...(existing||{}),[identity.id]:value[identity.id]};
  }
  if(key==='students') {
    if(!Array.isArray(value)||value.length!==1||value[0].id!==identity.id)return deny();
    const old=(existing||[]).find(p=>p.id===identity.id);if(!old)return deny();
    const visible=clean(old), incoming=value[0];
    for(const field of new Set([...Object.keys(visible),...Object.keys(incoming)])) if(!profileFields.has(field)&&!equal(visible[field],incoming[field]))return deny();
    return existing.map(p=>p.id===identity.id?{...incoming,pin:old.pin}:p);
  }
  if(key==='prFeed') {
    if(!Array.isArray(value)||value.some(r=>r.studentId!==identity.id))return deny();
    return [...(existing||[]).filter(r=>r.studentId!==identity.id),...value].slice(-100);
  }
  if(key==='custom') {
    if(!Array.isArray(value)||(existing||[]).some(r=>!value.some(n=>equal(n,r))))return deny();
    const additions=value.filter(r=>!(existing||[]).some(n=>equal(n,r)));
    if(additions.some(r=>!r.name||r.mode!=='weight'||r.group!=='Other'||Object.keys(r).some(k=>!['name','mode','group'].includes(k))))return deny();
    return value;
  }
  return deny();
}
