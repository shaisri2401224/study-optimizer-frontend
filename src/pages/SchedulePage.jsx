import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../utils/store';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const COLORS_LIST = ['var(--purple)','var(--teal)','var(--amber)','var(--rose)','var(--blue)','var(--green)'];

export default function SchedulePage({ subjects, result }) {
  const [schedule, setSchedule] = useState(() => buildInitialSchedule(subjects, result));
  const [dragging, setDragging] = useState(null);
  const [view,     setView]     = useState('week'); // week | list

  function buildInitialSchedule(subjects, result) {
    const s = {};
    if (!result) return s;
    const selSet = new Set(result.selected);
    const picked = subjects.filter((_,i) => selSet.has(i));
    picked.forEach((sub, i) => {
      const day  = DAYS[i % 5];
      const slot = SLOTS[i + 1];
      s[`${day}-${slot}`] = { subject: sub, color: COLORS_LIST[i % COLORS_LIST.length] };
    });
    return s;
  }

  function handleDrop(day, slot) {
    if (!dragging) return;
    setSchedule(prev => {
      const next = { ...prev };
      // Remove from old slot
      Object.keys(next).forEach(k => {
        if (next[k]?.subject?.id === dragging.subject.id) delete next[k];
      });
      next[`${day}-${slot}`] = dragging;
      return next;
    });
    setDragging(null);
  }

  function removeBlock(day, slot) {
    setSchedule(prev => {
      const next = { ...prev };
      delete next[`${day}-${slot}`];
      return next;
    });
  }

  const totalScheduled = Object.keys(schedule).length;
  const hoursScheduled = Object.values(schedule).reduce((s,v)=>s+(v?.subject?.hours||0),0);

  return (
    <div style={S.page} className="fade-in">
      {/* Header controls */}
      <div style={S.topRow}>
        <div style={{ display:'flex', gap:8 }}>
          <div style={S.stat}><span style={S.statV}>{totalScheduled}</span><span style={S.statL}>Sessions</span></div>
          <div style={S.stat}><span style={S.statV}>{hoursScheduled}h</span><span style={S.statL}>Scheduled</span></div>
          <div style={S.stat}><span style={S.statV}>{subjects.length}</span><span style={S.statL}>Subjects</span></div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`btn btn-sm ${view==='week'?'btn-primary':''}`} onClick={()=>setView('week')}>Week View</button>
          <button className={`btn btn-sm ${view==='list'?'btn-primary':''}`} onClick={()=>setView('list')}>List View</button>
          <button className="btn btn-sm" onClick={()=>setSchedule(buildInitialSchedule(subjects, result))}>↺ Reset</button>
        </div>
      </div>

      {view==='week' ? (
        <div style={{ overflowX:'auto' }}>
          {/* Week grid */}
          <div style={S.grid}>
            {/* Time column */}
            <div style={S.timeCol}>
              <div style={S.dayHeader} />
              {SLOTS.map(t=>(
                <div key={t} style={S.timeCell}>{t}</div>
              ))}
            </div>
            {/* Day columns */}
            {DAYS.map(day=>(
              <div key={day} style={S.dayCol}>
                <div style={S.dayHeader}>{day.slice(0,3)}</div>
                {SLOTS.map(slot=>{
                  const key   = `${day}-${slot}`;
                  const block = schedule[key];
                  return (
                    <div
                      key={slot}
                      style={S.cell}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={()=>handleDrop(day,slot)}
                    >
                      {block ? (
                        <div
                          draggable
                          onDragStart={()=>setDragging(block)}
                          style={{ ...S.block, background:`${block.color}22`, border:`1px solid ${block.color}66`, color:block.color }}
                        >
                          <div style={{ fontSize:11, fontWeight:700, lineHeight:1.3 }}>{block.subject.name.slice(0,12)}</div>
                          <div style={{ fontSize:10, opacity:.8 }}>{block.subject.hours}h</div>
                          <button style={S.removeBtn} onClick={()=>removeBlock(day,slot)}>×</button>
                        </div>
                      ) : (
                        <div style={S.emptyCell} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List view */
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {DAYS.map(day=>{
            const dayBlocks = SLOTS.map(s=>({ slot:s, block:schedule[`${day}-${s}`] })).filter(x=>x.block);
            if (!dayBlocks.length) return null;
            return (
              <div key={day} className="card">
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text1)', marginBottom:10 }}>{day}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {dayBlocks.map(({ slot, block })=>(
                    <div key={slot} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'var(--bg3)', borderRadius:'var(--r)', borderLeft:`3px solid ${block.color}` }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text3)', minWidth:50 }}>{slot}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text1)', flex:1 }}>{block.subject.name}</span>
                      <span style={{ fontSize:12, color:block.color }}>{block.subject.hours}h</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>removeBlock(day,slot)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(schedule).length===0 && (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>
              Run the optimizer first, then your schedule will appear here.
            </div>
          )}
        </div>
      )}

      {/* Unscheduled subjects */}
      <div className="card" style={{ marginTop:'1rem' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:10 }}>
          Drag subjects to schedule · Unscheduled: {subjects.filter(s=>!Object.values(schedule).find(b=>b?.subject?.id===s.id)).length}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {subjects
            .filter(s=>!Object.values(schedule).find(b=>b?.subject?.id===s.id))
            .map((s,i)=>{
              const c = COLORS_LIST[i%COLORS_LIST.length];
              return (
                <div key={s.id}
                  draggable
                  onDragStart={()=>setDragging({ subject:s, color:c })}
                  style={{ background:`${c}18`, border:`1px solid ${c}44`, borderRadius:'var(--r)', padding:'6px 12px', cursor:'grab', fontSize:13, fontWeight:600, color:c }}
                >
                  {s.name} · {s.hours}h
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:      { padding:'1.5rem 1.75rem' },
  topRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:10 },
  stat:      { display:'flex', flexDirection:'column', alignItems:'center', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'8px 16px' },
  statV:     { fontSize:18, fontWeight:800, color:'var(--purple)', fontFamily:'var(--mono)', lineHeight:1 },
  statL:     { fontSize:10, color:'var(--text3)', marginTop:2 },
  grid:      { display:'flex', gap:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden', minWidth:780 },
  timeCol:   { width:56, flexShrink:0 },
  dayCol:    { flex:1, borderLeft:'1px solid var(--border)' },
  dayHeader: { height:36, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--text2)', background:'var(--bg3)', borderBottom:'1px solid var(--border)' },
  timeCell:  { height:52, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', borderBottom:'1px solid var(--border)' },
  cell:      { height:52, padding:2, borderBottom:'1px solid var(--border)', position:'relative' },
  block:     { height:'100%', borderRadius:6, padding:'4px 6px', cursor:'grab', position:'relative', overflow:'hidden' },
  emptyCell: { height:'100%', borderRadius:6 },
  removeBtn: { position:'absolute', top:2, right:3, background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:14, lineHeight:1, opacity:.6, padding:0 },
};
