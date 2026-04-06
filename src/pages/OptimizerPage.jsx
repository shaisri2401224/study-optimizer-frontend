import React, { useState } from 'react';
import { knapsack, computeValue, URGENCY_MAP, URGENCY_COLOR } from '../utils/store';

const STRATEGIES = [
  { value:'weighted', label:'Weighted', desc:'priority × score × urgency', color:'var(--purple)' },
  { value:'score',    label:'Max Score', desc:'maximize grade boost',       color:'var(--teal)'   },
  { value:'priority', label:'Priority',  desc:'most urgent first',          color:'var(--amber)'  },
];

export default function OptimizerPage({ subjects, strategy, setStrategy, totalHours, setTotalHours, result, setResult, onHistoryAdd }) {
  const [running, setRunning] = useState(false);

  function handleRun() {
    if (!subjects.length) return;
    setRunning(true);
    setTimeout(() => {
      const res = knapsack(subjects, totalHours, strategy);
      setResult(res);
      const selSet = new Set(res.selected);
      const picked = subjects.filter((_,i)=>selSet.has(i));
      onHistoryAdd({ id:Date.now(), ts:new Date().toLocaleTimeString(), totalValue:res.totalValue, hoursUsed:picked.reduce((s,x)=>s+x.hours,0), budget:totalHours, strategy, picked:picked.map(s=>s.name) });
      setRunning(false);
    }, 600);
  }

  const selSet = result ? new Set(result.selected) : new Set();
  const picked = subjects.filter((_,i)=>selSet.has(i));
  const skipped = subjects.filter((_,i)=>!selSet.has(i));
  const hoursUsed = picked.reduce((s,x)=>s+x.hours,0);

  return (
    <div style={S.page} className="fade-in">
      <div style={S.grid}>
        {/* Config panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Time budget */}
          <div className="card">
            <div style={S.sectionTitle}>⏱ Time Budget</div>
            <div style={{ display:'flex', alignItems:'center', gap:14, margin:'1rem 0 .5rem' }}>
              <input type="range" min={1} max={40} value={totalHours} onChange={e=>setTotalHours(+e.target.value)} style={{ flex:1 }} />
              <div style={{ textAlign:'center', minWidth:52 }}>
                <div style={{ fontSize:24, fontWeight:800, color:'var(--purple)', lineHeight:1 }}>{totalHours}</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>hours</div>
              </div>
            </div>
            <div style={S.hint}>
              {totalHours<8 && '⚡ Sprint mode — ultra focused'}
              {totalHours>=8 && totalHours<20 && '📚 Balanced session'}
              {totalHours>=20 && '🏆 Deep study — comprehensive coverage'}
            </div>
          </div>

          {/* Strategy */}
          <div className="card">
            <div style={S.sectionTitle}>🎯 Optimization Strategy</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
              {STRATEGIES.map(s=>(
                <button key={s.value} onClick={()=>setStrategy(s.value)} style={{
                  ...S.stratBtn,
                  ...(strategy===s.value ? { border:`1px solid ${s.color}`, background:`${s.color}18` } : {}),
                }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background: strategy===s.value?s.color:'var(--text3)', boxShadow: strategy===s.value?`0 0 8px ${s.color}`:'' }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color: strategy===s.value?'var(--text1)':'var(--text2)' }}>{s.label}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button className={`btn btn-primary btn-full ${running?'pulse':''}`} onClick={handleRun} disabled={!subjects.length||running} style={{ height:46, fontSize:15 }}>
            {running ? '⟳ Computing...' : '◈ Run Knapsack Algorithm'}
          </button>

          {/* Algo info */}
          <div style={S.algoBox}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--purple)', marginBottom:8 }}>Algorithm Details</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', lineHeight:1.8 }}>
              <div>n = {subjects.length} subjects</div>
              <div>W = {totalHours} hours (budget)</div>
              <div>Time: O(n × W) = O({subjects.length*totalHours})</div>
              <div>Space: O(n × W)</div>
              <div style={{ color:'var(--purple)', marginTop:4 }}>dp[i][c] = max(dp[i-1][c],</div>
              <div style={{ color:'var(--purple)', paddingLeft:12 }}>dp[i-1][c-w]+v)</div>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {result ? (
            <>
              {/* Metrics */}
              <div style={S.metricsRow}>
                <Metric label="Total Value" value={result.totalValue} color="var(--purple)" />
                <Metric label="Hours Used"  value={`${hoursUsed}/${totalHours}h`} color="var(--teal)" />
                <Metric label="Selected"    value={`${picked.length}/${subjects.length}`} color="var(--amber)" />
                <Metric label="Efficiency"  value={hoursUsed>0?(result.totalValue/hoursUsed).toFixed(1):0} color="var(--green)" />
              </div>

              {/* Selected */}
              <div className="card">
                <div style={S.sectionTitle}>✓ Selected Subjects ({picked.length})</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
                  {picked.map((s,i)=>(
                    <SubjectResult key={s.id} subject={s} strategy={strategy} selected={true} index={i} />
                  ))}
                  {picked.length===0 && <div style={S.empty}>No subjects fit the budget.</div>}
                </div>
              </div>

              {/* Skipped */}
              {skipped.length>0 && (
                <div className="card">
                  <div style={S.sectionTitle}>✗ Skipped Subjects ({skipped.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
                    {skipped.map((s,i)=>(
                      <SubjectResult key={s.id} subject={s} strategy={strategy} selected={false} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="card">
                <div style={S.sectionTitle}>📅 Suggested Study Schedule</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
                  {picked.map((s,i)=>{
                    const colors = ['var(--purple)','var(--teal)','var(--amber)','var(--rose)','var(--blue)','var(--green)'];
                    const c = colors[i%colors.length];
                    return (
                      <div key={s.id} style={{ background:`${c}18`, border:`1px solid ${c}44`, borderRadius:'var(--r)', padding:'8px 12px' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:c }}>{s.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{s.hours}h · value {computeValue(s,strategy)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={S.emptyState}>
              <div style={{ fontSize:48, marginBottom:12, opacity:.3 }}>◈</div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>Ready to Optimize</div>
              <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', maxWidth:260 }}>
                Set your time budget, choose a strategy, and run the knapsack algorithm.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="card" style={{ borderTop:`2px solid ${color}`, textAlign:'center' }}>
      <div style={{ fontSize:22, fontWeight:800, color, letterSpacing:'-.02em' }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{label}</div>
    </div>
  );
}

function SubjectResult({ subject, strategy, selected }) {
  const val = computeValue(subject, strategy);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--bg3)', borderRadius:'var(--r)', borderLeft:`3px solid ${selected?'var(--purple)':'var(--border2)'}`, opacity: selected?1:0.6 }}>
      <div style={{ fontSize:16 }}>{selected?'✓':'✗'}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text1)' }}>{subject.name}</div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>{subject.hours}h · P{subject.priority} · {URGENCY_MAP[subject.urgency]}</div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:14, fontWeight:700, color: selected?'var(--purple)':'var(--text3)' }}>{val}</div>
        <div style={{ fontSize:10, color:'var(--text3)' }}>value</div>
      </div>
    </div>
  );
}

const S = {
  page:        { padding:'1.5rem 1.75rem' },
  grid:        { display:'grid', gridTemplateColumns:'340px 1fr', gap:'1.25rem', alignItems:'start' },
  sectionTitle:{ fontSize:13, fontWeight:700, color:'var(--text2)', display:'flex', alignItems:'center', gap:6 },
  stratBtn:    { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--bg3)', cursor:'pointer', textAlign:'left', transition:'all .15s', width:'100%' },
  hint:        { fontSize:12, color:'var(--text3)', padding:'6px 10px', background:'var(--bg3)', borderRadius:'var(--r)' },
  algoBox:     { background:'var(--bg3)', border:'1px solid var(--purple-dim)', borderRadius:'var(--r)', padding:'12px 14px' },
  metricsRow:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 },
  empty:       { fontSize:13, color:'var(--text3)', textAlign:'center', padding:'1.5rem' },
  emptyState:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:320, color:'var(--text3)' },
};
