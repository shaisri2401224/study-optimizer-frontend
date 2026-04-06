import React, { useState } from 'react';
import { knapsack, computeValue } from '../utils/store';

export default function AlgorithmPage({ subjects, totalHours, strategy }) {
  const [step,     setStep]     = useState(-1); // -1 = full view
  const [hovered,  setHovered]  = useState(null);
  const [animating, setAnimating] = useState(false);

  const result = knapsack(subjects, totalHours, strategy);
  const { dp, selected } = result;
  const n = subjects.length;
  const W = totalHours;
  const selSet = new Set(selected);

  // Limit columns for readability
  const MAX_COLS = 16;
  const colStep  = W <= MAX_COLS ? 1 : Math.ceil(W / MAX_COLS);
  const cols     = [];
  for (let c=0; c<=W; c+=colStep) cols.push(c);
  if (cols[cols.length-1]!==W) cols.push(W);

  function runAnimation() {
    setAnimating(true);
    let i = 0;
    const interval = setInterval(()=>{
      setStep(i);
      i++;
      if (i > n) { clearInterval(interval); setAnimating(false); }
    }, 500);
  }

  const activeRow = step >= 0 ? step : n;

  return (
    <div style={S.page} className="fade-in">
      <div style={S.grid}>
        {/* Left: controls + explanation */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card">
            <div style={S.sectionTitle}>▶ Step-by-Step Trace</div>
            <div style={{ fontSize:12, color:'var(--text3)', margin:'8px 0 14px', lineHeight:1.7 }}>
              Watch the algorithm fill the DP table row by row, deciding whether to include each subject.
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <button className="btn btn-primary btn-sm" onClick={runAnimation} disabled={animating}>
                {animating?'Running…':'▶ Animate'}
              </button>
              <button className="btn btn-sm" onClick={()=>setStep(-1)}>⊞ Full Table</button>
              <button className="btn btn-sm btn-ghost" onClick={()=>setStep(Math.max(-1,step-1))} disabled={step<0}>‹ Prev</button>
              <button className="btn btn-sm btn-ghost" onClick={()=>setStep(Math.min(n,step+1))} disabled={step>=n}>Next ›</button>
            </div>
            <div style={S.stepIndicator}>
              {step < 0 ? 'Showing complete table' : step === 0 ? 'Row 0: Base case (no subjects)' : `Row ${step}: Considering "${subjects[step-1]?.name}"`}
            </div>
          </div>

          {/* Recurrence */}
          <div style={S.recurrence}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--purple)', marginBottom:8 }}>Recurrence Formula</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text2)', lineHeight:2 }}>
              <div style={{ color:'var(--teal)' }}>dp[i][c] = max(</div>
              <div style={{ paddingLeft:16, color:'var(--amber)' }}>dp[i-1][c],           // skip</div>
              <div style={{ paddingLeft:16, color:'var(--purple)' }}>dp[i-1][c-w] + v    // take</div>
              <div style={{ color:'var(--teal)' }}>)</div>
              <hr style={{ borderColor:'var(--border)', margin:'8px 0' }} />
              <div>where: w = item weight (hours)</div>
              <div>       v = item value ({strategy})</div>
            </div>
          </div>

          {/* Traceback */}
          <div className="card">
            <div style={S.sectionTitle}>🔍 Traceback Result</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
              {subjects.map((s,i)=>{
                const isSel = selSet.has(i);
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'var(--bg3)', borderRadius:'var(--r)', borderLeft:`2px solid ${isSel?'var(--purple)':'var(--border2)'}` }}>
                    <span style={{ fontSize:12, color: isSel?'var(--purple)':'var(--text3)', fontWeight:700 }}>{isSel?'✓':'✗'}</span>
                    <span style={{ fontSize:12, flex:1, color:isSel?'var(--text1)':'var(--text3)' }}>{s.name}</span>
                    <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{s.hours}h · v{computeValue(s,strategy)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:10, padding:'8px 12px', background:'var(--purple-bg)', border:'1px solid rgba(124,111,255,.3)', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:12 }}>
              <span style={{ color:'var(--text3)' }}>Optimal value: </span>
              <span style={{ color:'var(--purple)', fontWeight:700 }}>{result.totalValue}</span>
              <span style={{ color:'var(--text3)', marginLeft:12 }}>dp[{n}][{W}]</span>
            </div>
          </div>

          {/* Complexity */}
          <div className="card">
            <div style={S.sectionTitle}>⚡ Complexity Analysis</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
              {[
                { label:'Time', value:`O(n×W) = O(${n}×${W}) = O(${n*W})`, color:'var(--teal)' },
                { label:'Space', value:`O(n×W) = O(${n*W}) cells`, color:'var(--amber)' },
                { label:'Traceback', value:`O(n) = O(${n})`, color:'var(--purple)' },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', background:'var(--bg3)', borderRadius:'var(--r)' }}>
                  <span style={{ fontSize:12, color:'var(--text3)' }}>{r.label}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:11, color:r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: DP table */}
        <div className="card">
          <div style={S.sectionTitle}>📊 Dynamic Programming Table</div>
          <div style={{ fontSize:11, color:'var(--text3)', margin:'6px 0 12px' }}>
            <span style={{ display:'inline-block', width:12, height:12, background:'var(--purple-bg)', border:'1px solid rgba(124,111,255,.5)', borderRadius:3, marginRight:4 }} />
            Item picked &nbsp;
            <span style={{ display:'inline-block', width:12, height:12, background:'rgba(0,212,170,.15)', border:'1px solid rgba(0,212,170,.4)', borderRadius:3, marginRight:4, marginLeft:10 }} />
            Active row &nbsp;
            {hovered && (
              <span style={{ marginLeft:10, color:'var(--text2)' }}>
                Cell [{hovered.r}][{hovered.c}] = <strong style={{ color:'var(--purple)' }}>{dp[hovered.r]?.[hovered.c]}</strong>
              </span>
            )}
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Subject \ Hours</th>
                  {cols.map(c=><th key={c} style={S.th}>{c}h</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({length:n+1},(_,i)=>{
                  const isActive = step>=0 && i===activeRow;
                  const label    = i===0 ? '∅ none' : subjects[i-1]?.name?.slice(0,11)||`Item ${i}`;
                  return (
                    <tr key={i} style={{ background: isActive?'rgba(0,212,170,0.05)':i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                      <td style={{ ...S.rowLabel, color: isActive?'var(--teal)':'var(--text2)', fontWeight: isActive?700:500 }}>
                        {label}
                        {i===selSet.size && i>0 && <span style={{ marginLeft:4, color:'var(--purple)' }}>◈</span>}
                      </td>
                      {cols.map(c=>{
                        const val    = dp[i]?.[c] ?? 0;
                        const prev   = i>0 ? (dp[i-1]?.[c]??0) : null;
                        const picked = i>0 && val!==prev;
                        const hide   = step>=0 && i>activeRow;
                        return (
                          <td
                            key={c}
                            style={{
                              ...S.td,
                              background: hide?'var(--bg3)' : picked?'rgba(124,111,255,.15)':'transparent',
                              color:       hide?'var(--bg3)' : picked?'var(--purple)':'var(--text3)',
                              fontWeight:  picked?700:400,
                              border:      picked?'1px solid rgba(124,111,255,.3)':'1px solid var(--border)',
                              boxShadow:   hovered?.r===i&&hovered?.c===c?'inset 0 0 0 2px var(--teal)':'',
                            }}
                            onMouseEnter={()=>setHovered({r:i,c})}
                            onMouseLeave={()=>setHovered(null)}
                            title={picked?`Picked "${subjects[i-1]?.name}": ${prev} → ${val}`:`dp[${i}][${c}] = ${val}`}
                          >
                            {hide?'·':val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {W>MAX_COLS && <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>Showing {cols.length} sampled columns (every {colStep}h) of {W+1} total.</div>}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:         { padding:'1.5rem 1.75rem' },
  grid:         { display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.25rem', alignItems:'start' },
  sectionTitle: { fontSize:13, fontWeight:700, color:'var(--text2)' },
  stepIndicator:{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:'8px 12px', fontSize:12, color:'var(--text2)', fontFamily:'var(--mono)' },
  recurrence:   { background:'var(--bg3)', border:'1px solid var(--purple-dim)', borderRadius:'var(--r)', padding:'12px 14px' },
  table:        { borderCollapse:'collapse', fontSize:12, minWidth:'100%' },
  th:           { padding:'6px 10px', background:'var(--bg3)', color:'var(--text3)', fontWeight:700, fontSize:11, border:'1px solid var(--border)', textAlign:'center', whiteSpace:'nowrap' },
  td:           { padding:'4px 8px', textAlign:'center', cursor:'default', fontFamily:'var(--mono)', fontSize:12, transition:'all .1s' },
  rowLabel:     { padding:'5px 10px', background:'var(--bg3)', fontSize:12, whiteSpace:'nowrap', border:'1px solid var(--border)', position:'sticky', left:0, zIndex:1 },
};
