import React from 'react';
import { computeValue, URGENCY_MAP, URGENCY_COLOR, CATEGORY_COLORS, WEEK_SCHEDULE, SCORE_HISTORY } from '../utils/store';

export default function OverviewPage({ subjects, result, strategy, onNavigate }) {
  const totalHours = subjects.reduce((s, x) => s + x.hours, 0);
  const avgPriority = subjects.length ? (subjects.reduce((s,x)=>s+x.priority,0)/subjects.length).toFixed(1) : 0;
  const completed   = subjects.filter(s=>s.completed).length;
  const selSet      = result ? new Set(result.selected) : new Set();
  const pickedHours = result ? subjects.filter((_,i)=>selSet.has(i)).reduce((s,x)=>s+x.hours,0) : 0;

  const categories  = [...new Set(subjects.map(s=>s.category))];

  return (
    <div style={S.page} className="fade-in">
      {/* KPI row */}
      <div style={S.kpiRow} className="stagger">
        <KPI label="Total Subjects" value={subjects.length} sub="+2 this week" color="var(--purple)" icon="▦" />
        <KPI label="Study Hours"    value={totalHours+'h'}  sub="across all subjects" color="var(--teal)"   icon="◷" />
        <KPI label="Avg Priority"   value={avgPriority}     sub="weighted score" color="var(--amber)"  icon="★" />
        <KPI label="Completed"      value={completed}       sub={`of ${subjects.length} subjects`} color="var(--green)" icon="✓" />
        {result && <KPI label="Optimal Hours" value={pickedHours+'h'} sub={`value: ${result.totalValue}`} color="var(--rose)" icon="◈" />}
      </div>

      <div style={S.grid2}>
        {/* Subject summary */}
        <div className="card fade-up">
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Subject Overview</span>
            <button className="btn btn-sm btn-ghost" onClick={()=>onNavigate('subjects')}>Manage →</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
            {subjects.slice(0,6).map((s,i) => {
              const val = computeValue(s, strategy);
              const isSel = selSet.has(i);
              const cat = CATEGORY_COLORS[s.category] || CATEGORY_COLORS['Other'];
              return (
                <div key={s.id} style={{ ...S.subRow, borderLeft:`3px solid ${isSel?'var(--purple)':'var(--border2)'}` }}>
                  <div style={{ ...S.catDot, background: cat.bg, color: cat.color }}>
                    {s.category?.[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={S.subName}>{s.name}</div>
                    <div style={S.subMeta}>{s.hours}h · P{s.priority} · {URGENCY_MAP[s.urgency]}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:700, color: isSel?'var(--purple)':'var(--text3)' }}>{val}</div>
                    <div style={{ fontSize:10, color:'var(--text3)' }}>value</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Category breakdown */}
          <div className="card fade-up">
            <div style={S.cardTitle}>By Category</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
              {categories.map(cat => {
                const subs = subjects.filter(s=>s.category===cat);
                const pct  = Math.round(subs.length / subjects.length * 100);
                const col  = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other'];
                return (
                  <div key={cat}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                      <span style={{ color:'var(--text2)', fontWeight:600 }}>{cat}</span>
                      <span style={{ color:'var(--text3)' }}>{subs.length} subjects · {pct}%</span>
                    </div>
                    <div style={{ height:6, background:'var(--bg4)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ width:pct+'%', height:'100%', background:col.color, borderRadius:99, transition:'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly load mini */}
          <div className="card fade-up">
            <div style={S.cardTitle}>This Week's Load</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginTop:14, height:70 }}>
              {WEEK_SCHEDULE.map(d => {
                const maxH = Math.max(...WEEK_SCHEDULE.map(x=>x.hours));
                const pct  = (d.hours / maxH) * 100;
                const today = new Date().toLocaleDateString('en',{weekday:'short'}).slice(0,3);
                const isToday = d.day === today;
                return (
                  <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, color:'var(--text3)' }}>{d.hours}h</div>
                    <div style={{ width:'100%', height:(pct/100)*54+4, borderRadius:4, background: isToday?'var(--purple)':'var(--bg4)', boxShadow: isToday?'0 0 10px var(--purple-glow)':'' }} />
                    <div style={{ fontSize:10, color: isToday?'var(--purple)':'var(--text3)', fontWeight: isToday?700:400 }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card fade-up">
            <div style={S.cardTitle}>Quick Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
              <button className="btn btn-full btn-primary" onClick={()=>onNavigate('optimizer')}>◈ Run Optimizer</button>
              <button className="btn btn-full" onClick={()=>onNavigate('subjects')}>▦ Add Subject</button>
              <button className="btn btn-full" onClick={()=>onNavigate('analytics')}>◉ View Analytics</button>
            </div>
          </div>
        </div>
      </div>

      {/* Score trend mini table */}
      <div className="card fade-up" style={{ marginTop:'1rem' }}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>Score Progress (6 Weeks)</span>
          <button className="btn btn-sm btn-ghost" onClick={()=>onNavigate('analytics')}>Full charts →</button>
        </div>
        <div style={{ overflowX:'auto', marginTop:12 }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Week','Math','Physics','Chemistry','English'].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCORE_HISTORY.map((r,i) => (
                <tr key={r.week} style={{ background: i%2===0?'transparent':'rgba(255,255,255,0.02)' }}>
                  <td style={S.td}><span style={{ fontFamily:'var(--mono)', color:'var(--text3)' }}>{r.week}</span></td>
                  <td style={S.td}><ScoreBadge v={r.math}/></td>
                  <td style={S.td}><ScoreBadge v={r.physics}/></td>
                  <td style={S.td}><ScoreBadge v={r.chemistry}/></td>
                  <td style={S.td}><ScoreBadge v={r.english}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color, icon }) {
  return (
    <div className="card fade-up" style={{ borderTop:`2px solid ${color}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</span>
        <span style={{ fontSize:18, color, opacity:.7 }}>{icon}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:'var(--text1)', letterSpacing:'-.02em', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{sub}</div>
    </div>
  );
}

function ScoreBadge({ v }) {
  const color = v>=80 ? 'var(--green)' : v>=70 ? 'var(--amber)' : 'var(--rose)';
  return <span style={{ fontFamily:'var(--mono)', fontSize:12, color, fontWeight:600 }}>{v}</span>;
}

const S = {
  page:     { padding:'1.5rem 1.75rem', display:'flex', flexDirection:'column', gap:'1rem' },
  kpiRow:   { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:'1rem' },
  grid2:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  cardHead: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:{ fontSize:14, fontWeight:700, color:'var(--text1)' },
  subRow:   { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'var(--bg3)', borderRadius:'var(--r)' },
  catDot:   { width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  subName:  { fontSize:13, fontWeight:600, color:'var(--text1)' },
  subMeta:  { fontSize:11, color:'var(--text3)' },
  table:    { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:       { padding:'6px 12px', textAlign:'left', color:'var(--text3)', fontWeight:700, fontSize:11, textTransform:'uppercase', borderBottom:'1px solid var(--border)' },
  td:       { padding:'8px 12px', color:'var(--text2)', borderBottom:'1px solid var(--border)' },
};
