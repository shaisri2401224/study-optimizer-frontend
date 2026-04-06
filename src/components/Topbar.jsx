import React from 'react';

const PAGE_META = {
  overview:  { title:'Overview',         sub:'Your study performance at a glance' },
  optimizer: { title:'Knapsack Optimizer', sub:'Find your optimal study plan' },
  subjects:  { title:'Subject Manager',  sub:'Add, edit and track your subjects' },
  analytics: { title:'Analytics',        sub:'Charts, trends & insights' },
  schedule:  { title:'Weekly Schedule',  sub:'Plan your study sessions' },
  algorithm: { title:'Algorithm Visualizer', sub:'Explore the DP table step-by-step' },
};

export default function Topbar({ page, subjects, result }) {
  const meta = PAGE_META[page] || {};
  const now = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });

  return (
    <header style={S.bar}>
      <div>
        <div style={S.title}>{meta.title}</div>
        <div style={S.sub}>{meta.sub}</div>
      </div>
      <div style={S.right}>
        <div style={S.date}>{now}</div>
        {result && (
          <div style={S.badge}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--teal)', boxShadow:'0 0 6px var(--teal)', display:'inline-block' }} />
            Plan active · {result.selected.length} subjects
          </div>
        )}
        <div style={S.avatar}>SA</div>
      </div>
    </header>
  );
}

const S = {
  bar:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.75rem', borderBottom:'1px solid var(--border)', background:'var(--bg2)', position:'sticky', top:0, zIndex:50 },
  title:  { fontSize:17, fontWeight:800, color:'var(--text1)', letterSpacing:'-.02em' },
  sub:    { fontSize:12, color:'var(--text3)', marginTop:1 },
  right:  { display:'flex', alignItems:'center', gap:12 },
  date:   { fontSize:12, color:'var(--text3)', fontFamily:'var(--mono)' },
  badge:  { display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--teal)', background:'var(--teal-bg)', border:'1px solid rgba(0,212,170,.2)', padding:'4px 10px', borderRadius:99 },
  avatar: { width:32, height:32, borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', boxShadow:'0 0 12px var(--purple-glow)' },
};
