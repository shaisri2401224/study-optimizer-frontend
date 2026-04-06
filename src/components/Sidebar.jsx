import React from 'react';

const NAV = [
  { id:'overview',   icon:'⬡', label:'Overview',      sub:'Summary & KPIs' },
  { id:'optimizer',  icon:'◈', label:'Optimizer',      sub:'Knapsack Engine' },
  { id:'subjects',   icon:'▦', label:'Subjects',       sub:'Manage & Track' },
  { id:'analytics',  icon:'◉', label:'Analytics',      sub:'Charts & Trends' },
  { id:'schedule',   icon:'▣', label:'Schedule',       sub:'Weekly Planner' },
  { id:'algorithm',  icon:'⬡', label:'Algorithm',      sub:'DP Visualizer' },
];

export default function Sidebar({ active, onChange, runCount }) {
  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoMark}>
          <span style={{ fontSize:18, lineHeight:1 }}>◈</span>
        </div>
        <div>
          <div style={S.logoTitle}>StudyOpt</div>
          <div style={S.logoSub}>v2.0 · Knapsack AI</div>
        </div>
      </div>

      <hr style={S.hr} />

      {/* Nav items */}
      <nav style={S.nav}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              style={{ ...S.navItem, ...(isActive ? S.navActive : {}) }}
            >
              <span style={{ ...S.navIcon, ...(isActive ? S.navIconActive : {}) }}>
                {item.icon}
              </span>
              <div style={S.navText}>
                <div style={{ ...S.navLabel, ...(isActive ? { color:'var(--text1)' } : {}) }}>
                  {item.label}
                </div>
                <div style={S.navSub}>{item.sub}</div>
              </div>
              {isActive && <div style={S.activeDot} />}
            </button>
          );
        })}
      </nav>

      <div style={{ flex:1 }} />

      {/* Footer stats */}
      <div style={S.footer}>
        <div style={S.stat}>
          <span style={S.statVal}>{runCount}</span>
          <span style={S.statLabel}>Runs</span>
        </div>
        <div style={S.statDivider} />
        <div style={S.stat}>
          <span style={S.statVal}>O(nW)</span>
          <span style={S.statLabel}>Complexity</span>
        </div>
      </div>
    </aside>
  );
}

const S = {
  sidebar: {
    width: 220, flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '1.25rem 0', height: '100vh',
    position: 'sticky', top: 0,
  },
  logo:      { display:'flex', alignItems:'center', gap:10, padding:'0 1.25rem', marginBottom:'.5rem' },
  logoMark:  { width:36, height:36, borderRadius:10, background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, boxShadow:'0 0 16px var(--purple-glow)' },
  logoTitle: { fontSize:15, fontWeight:800, color:'var(--text1)', letterSpacing:'-.02em' },
  logoSub:   { fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', marginTop:1 },
  hr:        { border:'none', borderTop:'1px solid var(--border)', margin:'.75rem 0' },
  nav:       { display:'flex', flexDirection:'column', gap:2, padding:'0 .625rem' },
  navItem:   {
    display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
    borderRadius:'var(--r)', border:'none', background:'transparent', cursor:'pointer',
    width:'100%', textAlign:'left', transition:'all .15s', position:'relative',
  },
  navActive: { background:'rgba(124,111,255,0.12)', },
  navIcon:   { fontSize:16, width:22, textAlign:'center', color:'var(--text3)', flexShrink:0 },
  navIconActive: { color:'var(--purple)' },
  navText:   { flex:1, minWidth:0 },
  navLabel:  { fontSize:13, fontWeight:600, color:'var(--text2)', lineHeight:1.3 },
  navSub:    { fontSize:10, color:'var(--text3)', lineHeight:1.2 },
  activeDot: { width:6, height:6, borderRadius:'50%', background:'var(--purple)', boxShadow:'0 0 6px var(--purple)' },
  footer:    { margin:'.75rem .625rem 0', padding:'12px', background:'var(--bg3)', borderRadius:'var(--r)', display:'flex', alignItems:'center', justifyContent:'space-around' },
  stat:      { display:'flex', flexDirection:'column', alignItems:'center', gap:2 },
  statVal:   { fontSize:13, fontWeight:800, color:'var(--purple)', fontFamily:'var(--mono)' },
  statLabel: { fontSize:10, color:'var(--text3)' },
  statDivider:{ width:1, height:24, background:'var(--border2)' },
};
