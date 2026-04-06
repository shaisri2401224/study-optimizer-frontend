import React, { useState } from 'react';
import {
  URGENCY_MAP,
  URGENCY_COLOR,
  CATEGORY_COLORS,
} from '../utils/store';
import { addSubject, deleteSubject, updateSubject } from '../utils/api';

const URGENCY_OPTS = [
  { v: 1.0, l: 'Low' },
  { v: 1.3, l: 'Medium' },
  { v: 1.6, l: 'High' },
  { v: 2.0, l: 'Critical' },
];

const CATEGORIES = ['Science', 'Language', 'Humanities', 'Math', 'Other'];

const EMPTY = {
  name: '',
  hours: '',
  priority: '',
  score: '',
  urgency: 1.6,
  category: 'Science',
};

export default function SubjectsPage({ subjects, setSubjects, reloadSubjects }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('priority');

  function setF(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.hours || +form.hours < 1 || +form.hours > 24) e.hours = '1-24';
    if (!form.priority || +form.priority < 1 || +form.priority > 10) e.priority = '1-10';
    if (!form.score || +form.score < 1 || +form.score > 100) e.score = '1-100';
    return e;
  }

  async function handleAdd() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      const newSubject = {
        name: form.name,
        hours: +form.hours,
        priority: +form.priority,
        score: +form.score,
        urgency: +form.urgency,
        category: form.category,
        completed: false,
        sessions: 0,
      };

      const saved = await addSubject(newSubject);

      if (reloadSubjects) {
        await reloadSubjects();
      } else {
        setSubjects((prev) => [...prev, saved]);
      }

      setForm(EMPTY);
      setErrors({});
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  }

  async function toggleComplete(id) {
    try {
      const current = subjects.find((s) => (s._id || s.id) === id);
      if (!current) return;

      const updatedData = {
        ...current,
        completed: !current.completed,
      };

      const updated = await updateSubject(id, updatedData);

      setSubjects((prev) =>
        prev.map((s) => ((s._id || s.id) === id ? updated : s))
      );
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  }

  async function remove(id) {
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  }

  const cats = ['All', ...new Set(subjects.map((s) => s.category))];

  const filtered = subjects
    .filter((s) => filter === 'All' || s.category === filter)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'priority') return b.priority - a.priority;
      if (sort === 'hours') return b.hours - a.hours;
      if (sort === 'score') return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

  return (
    <div style={S.page} className="fade-in">
      <div style={S.grid}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div style={S.sectionTitle}>+ Add New Subject</div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label">Subject Name</label>
              <input
                value={form.name}
                onChange={(e) => setF('name', e.target.value)}
                placeholder="e.g. Mathematics"
                style={errors.name ? { borderColor: 'var(--rose)' } : {}}
              />
              {errors.name && <span style={S.err}>{errors.name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Hours (1-24)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={form.hours}
                  onChange={(e) => setF('hours', e.target.value)}
                  placeholder="3"
                  style={errors.hours ? { borderColor: 'var(--rose)' } : {}}
                />
                {errors.hours && <span style={S.err}>{errors.hours}</span>}
              </div>

              <div>
                <label className="label">Priority (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.priority}
                  onChange={(e) => setF('priority', e.target.value)}
                  placeholder="8"
                  style={errors.priority ? { borderColor: 'var(--rose)' } : {}}
                />
                {errors.priority && <span style={S.err}>{errors.priority}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Score Boost %</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.score}
                  onChange={(e) => setF('score', e.target.value)}
                  placeholder="85"
                  style={errors.score ? { borderColor: 'var(--rose)' } : {}}
                />
                {errors.score && <span style={S.err}>{errors.score}</span>}
              </div>

              <div>
                <label className="label">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setF('urgency', e.target.value)}
                >
                  {URGENCY_OPTS.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) => setF('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleAdd}
              style={{ marginTop: 4 }}
            >
              + Add Subject
            </button>
          </div>
        </div>

        <div>
          <div style={S.filterRow}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search subjects..."
              style={{ maxWidth: 220, height: 34 }}
            />

            <div style={S.filterTabs}>
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{
                    ...S.filterTab,
                    ...(filter === c ? S.filterActive : {}),
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: 130, height: 34, fontSize: 12 }}
            >
              <option value="priority">Sort: Priority</option>
              <option value="hours">Sort: Hours</option>
              <option value="score">Sort: Score</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <div style={S.summaryRow}>
            <Chip label={`${filtered.length} subjects`} color="var(--purple)" />
            <Chip
              label={`${filtered.reduce((sum, x) => sum + Number(x.hours || 0), 0)}h total`}
              color="var(--teal)"
            />
            <Chip
              label={`${filtered.filter((s) => s.completed).length} completed`}
              color="var(--green)"
            />
          </div>

          <div style={S.cardsGrid} className="stagger">
            {filtered.map((s) => {
              const cat = CATEGORY_COLORS[s.category] || CATEGORY_COLORS['Other'];
              const subjectId = s._id || s.id;

              return (
                <div
                  key={subjectId}
                  className="card fade-up"
                  style={{ opacity: s.completed ? 0.7 : 1 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text1)',
                          textDecoration: s.completed ? 'line-through' : '',
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          ...S.catPill,
                          background: cat.bg,
                          color: cat.color,
                        }}
                      >
                        {s.category}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => toggleComplete(subjectId)}
                        title="Toggle complete"
                      >
                        {s.completed ? '↩' : '✓'}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => remove(subjectId)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div style={S.metaGrid}>
                    <Stat label="Hours" value={s.hours + 'h'} />
                    <Stat label="Priority" value={'P' + s.priority} />
                    <Stat label="Score" value={s.score + '%'} />
                    <Stat label="Sessions" value={s.sessions || 0} />
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span className={`pill ${URGENCY_COLOR[s.urgency] || 'pill-gray'}`}>
                      {URGENCY_MAP[s.urgency]}
                    </span>
                    {s.completed && <span className="pill pill-green">✓ Done</span>}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text3)',
                }}
              >
                No subjects match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text1)',
          fontFamily: 'var(--mono)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '.04em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Chip({ label, color }) {
  return (
    <span
      style={{
        fontSize: 12,
        color,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        padding: '3px 10px',
        borderRadius: 99,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

const S = {
  page: { padding: '1.5rem 1.75rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '1.25rem',
    alignItems: 'start',
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text1)' },
  err: { fontSize: 11, color: 'var(--rose)', marginTop: 3, display: 'block' },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterTabs: { display: 'flex', gap: 4 },
  filterTab: {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid var(--border2)',
    borderRadius: 99,
    background: 'transparent',
    color: 'var(--text2)',
    cursor: 'pointer',
  },
  filterActive: {
    background: 'var(--purple-bg)',
    color: 'var(--purple)',
    borderColor: 'rgba(124,111,255,.3)',
  },
  summaryRow: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))',
    gap: 12,
  },
  catPill: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 99,
    marginTop: 4,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 4,
    background: 'var(--bg3)',
    borderRadius: 'var(--r)',
    padding: '8px 4px',
  },
};