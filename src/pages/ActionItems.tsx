

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type ActionItem = {
  id: string; task: string; assignee: string | null; deadline: string | null
  is_completed: boolean; created_at: string; meeting_id: string
  meetings?: { title: string }
}

const scrollbarStyle = `
  .action-scroll::-webkit-scrollbar { width: 4px; }
  .action-scroll::-webkit-scrollbar-track { background: transparent; }
  .action-scroll::-webkit-scrollbar-thumb { background: rgba(100,87,249,0.3); border-radius: 2px; }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .action-stat-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;
    }
    .action-filter-row {
      flex-direction: column !important;
      gap: 8px !important;
    }
    .action-filter-tabs {
      width: 100% !important;
      justify-content: space-between !important;
    }
    .action-filter-tabs button {
      flex: 1 !important;
      padding: 6px 4px !important;
      font-size: 11px !important;
    }
    .action-item-row {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .action-item-actions {
      display: flex !important;
      gap: 6px !important;
      align-self: flex-end !important;
    }
    .action-item-meta {
      flex-wrap: wrap !important;
    }
    .action-header {
      padding: 16px !important;
    }
    .action-scroll {
      padding: 16px !important;
    }
    .action-edit-row {
      flex-direction: column !important;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .action-stat-grid {
      grid-template-columns: repeat(4, 1fr) !important;
    }
    .action-scroll {
      padding: 18px 20px !important;
    }
  }
`

export default function ActionItems() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'pending'|'completed'|'overdue'>('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editTask, setEditTask] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const { data } = await supabase.from('action_items').select('*, meetings(title)')
      .eq('user_id', session?.user?.id).order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from('action_items').update({ is_completed: !current }).eq('id', id)
    setItems(prev => prev.map(i => i.id===id ? { ...i, is_completed: !current } : i))
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await supabase.from('action_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id!==id))
  }

  const startEdit = (item: ActionItem) => {
    setEditingId(item.id); setEditTask(item.task); setEditAssignee(item.assignee||'')
    setEditDeadline(item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '')
  }

  const saveEdit = async (id: string) => {
    await supabase.from('action_items').update({
      task: editTask, assignee: editAssignee||null,
      deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
    }).eq('id', id)
    setItems(prev => prev.map(i => i.id===id ? { ...i, task:editTask, assignee:editAssignee||null, deadline:editDeadline?new Date(editDeadline).toISOString():null } : i))
    setEditingId(null)
  }

  const isOverdue = (deadline: string|null, completed: boolean) =>
    !!(deadline && !completed && new Date(deadline) < new Date())

  const filtered = items.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.task.toLowerCase().includes(q) ||
      (item.assignee?.toLowerCase().includes(q) ?? false) ||
      (item.meetings?.title?.toLowerCase().includes(q) ?? false)
    if (!matchSearch) return false
    if (filter==='pending')   return !item.is_completed
    if (filter==='completed') return item.is_completed
    if (filter==='overdue')   return isOverdue(item.deadline, item.is_completed)
    return true
  })

  const total     = items.length
  const completed = items.filter(i => i.is_completed).length
  const pending   = items.filter(i => !i.is_completed).length
  const overdue   = items.filter(i => isOverdue(i.deadline, i.is_completed)).length

  const statCards = [
    { label:'Total',     value:total,     icon:'📋', color:'#6457F9', bg:'rgba(100,87,249,0.12)', key:'all' },
    { label:'Pending',   value:pending,   icon:'⏳', color:'#F59E0B', bg:'rgba(245,158,11,0.12)', key:'pending' },
    { label:'Completed', value:completed, icon:'✅', color:'#22C55E', bg:'rgba(34,197,94,0.12)',  key:'completed' },
    { label:'Overdue',   value:overdue,   icon:'🚨', color:'#EF4444', bg:'rgba(239,68,68,0.12)',  key:'overdue' },
  ]

  const surface = 'rgba(255,255,255,0.04)'

  return (
    <div className="action-scroll" style={{ padding:'24px 28px', fontFamily:"'DM Sans',sans-serif", color:'#f0f0ff', height:'100%', overflowY:'auto', boxSizing:'border-box' }}>
      <style>{scrollbarStyle}</style>

      {/* Header */}
      <div className="action-header" style={{ marginBottom:22 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:'clamp(16px,3vw,20px)', fontWeight:700, color:'#f0f0ff' }}>Action Items</h1>
        <p style={{ margin:0, fontSize:12, color:'rgba(240,240,255,0.45)' }}>Track and manage tasks extracted from your meetings</p>
      </div>

      {/* Stat cards */}
      <div className="action-stat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {statCards.map(card => (
          <div key={card.key} onClick={() => setFilter(card.key as 'all'|'pending'|'completed'|'overdue')} style={{
            background: filter===card.key ? 'rgba(100,87,249,0.1)' : surface,
            borderRadius:14, padding:'clamp(12px,2vw,18px) clamp(12px,2vw,20px)',
            border: filter===card.key ? `1px solid ${card.color}55` : '1px solid rgba(255,255,255,0.07)',
            cursor:'pointer', transition:'all 0.2s',
            boxShadow: filter===card.key ? `0 4px 20px ${card.color}22` : 'none',
            backdropFilter:'blur(10px)',
          }}>
            <div style={{ width:36, height:36, borderRadius:10, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, marginBottom:10 }}>{card.icon}</div>
            <div style={{ fontSize:11, color:'rgba(240,240,255,0.4)', marginBottom:4 }}>{card.label}</div>
            <div style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:700, color:card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="action-filter-row" style={{ display:'flex', gap:12, marginBottom:18, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'rgba(240,240,255,0.3)' }}>🔍</span>
          <input placeholder="Search by task, assignee or meeting..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:10, border:'1px solid rgba(100,87,249,0.2)', fontSize:13, outline:'none', background:'rgba(255,255,255,0.05)', color:'#f0f0ff', boxSizing:'border-box', transition:'all 0.2s' }}
            onFocus={e => e.target.style.border='1px solid rgba(100,87,249,0.5)'}
            onBlur={e => e.target.style.border='1px solid rgba(100,87,249,0.2)'}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(240,240,255,0.4)', fontSize:16 }}>✕</button>
          )}
        </div>
        <div className="action-filter-tabs" style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.04)', padding:4, borderRadius:10, border:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          {(['all','pending','completed','overdue'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'6px 13px', borderRadius:7, border:'none',
              background: filter===f ? 'linear-gradient(135deg,#6457F9,#8B7FF7)' : 'transparent',
              color: filter===f ? 'white' : 'rgba(240,240,255,0.5)',
              fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
              boxShadow: filter===f ? '0 2px 8px rgba(100,87,249,0.4)' : 'none',
              transition:'all 0.2s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {search && <p style={{ fontSize:12, color:'rgba(240,240,255,0.4)', marginBottom:10 }}>{filtered.length} result{filtered.length!==1?'s':''} for "{search}"</p>}

      {/* Items list */}
      <div style={{ background:surface, borderRadius:16, border:'1px solid rgba(100,87,249,0.15)', overflow:'hidden', marginBottom:18, backdropFilter:'blur(10px)' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'rgba(240,240,255,0.4)' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>Loading tasks...
          </div>
        ) : filtered.length===0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div style={{ fontSize:38, marginBottom:12 }}>{search?'🔍':'✅'}</div>
            <p style={{ color:'rgba(240,240,255,0.4)', fontSize:14, margin:'0 0 6px', fontWeight:500 }}>
              {search ? `No tasks found for "${search}"` : filter==='all' ? 'No action items yet' : `No ${filter} tasks`}
            </p>
            <p style={{ color:'rgba(240,240,255,0.25)', fontSize:12, margin:0 }}>
              {!search && filter==='all' && 'Upload a meeting to automatically generate tasks'}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => {
            const od = isOverdue(item.deadline, item.is_completed)
            const isEditing = editingId===item.id
            return (
              <div key={item.id} style={{
                padding:'clamp(10px,2vw,14px) clamp(12px,2vw,18px)',
                borderBottom: i<filtered.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: item.is_completed ? 'rgba(255,255,255,0.01)' : od ? 'rgba(239,68,68,0.03)' : 'transparent',
                transition:'background 0.15s',
              }}>
                {isEditing ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <input value={editTask} onChange={e => setEditTask(e.target.value)} placeholder="Task description"
                      style={{ padding:'10px 14px', borderRadius:8, border:'1px solid rgba(100,87,249,0.5)', fontSize:13, outline:'none', background:'rgba(255,255,255,0.06)', color:'#f0f0ff', width:'100%', boxSizing:'border-box' }} />
                    <div className="action-edit-row" style={{ display:'flex', gap:10 }}>
                      <input value={editAssignee} onChange={e => setEditAssignee(e.target.value)} placeholder="👤 Assignee"
                        style={{ flex:1, padding:'9px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', color:'#f0f0ff', boxSizing:'border-box' }} />
                      <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                        style={{ flex:1, padding:'9px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', fontSize:12, outline:'none', background:'rgba(255,255,255,0.05)', color:'#f0f0ff', boxSizing:'border-box' }} />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => saveEdit(item.id)} style={{ background:'linear-gradient(135deg,#6457F9,#8B7FF7)', color:'white', border:'none', padding:'8px 18px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>💾 Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background:'rgba(255,255,255,0.07)', color:'rgba(240,240,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 18px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="action-item-row" style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                    {/* Checkbox */}
                    <div onClick={() => toggleComplete(item.id, item.is_completed)} style={{
                      width:22, height:22, borderRadius:7, flexShrink:0,
                      border:`2px solid ${item.is_completed ? '#22C55E' : od ? '#EF4444' : 'rgba(100,87,249,0.5)'}`,
                      background: item.is_completed ? '#22C55E' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', marginTop:2, transition:'all 0.15s',
                    }}>
                      {item.is_completed && <span style={{ color:'white', fontSize:12, fontWeight:700 }}>✓</span>}
                    </div>

                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:'0 0 8px', fontSize:13.5, fontWeight:500, color:item.is_completed?'rgba(240,240,255,0.3)':'#f0f0ff', textDecoration:item.is_completed?'line-through':'none', lineHeight:1.5, wordBreak:'break-word' }}>{item.task}</p>
                      <div className="action-item-meta" style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                        {item.meetings?.title && (
                          <span onClick={() => navigate(`/meetings/${item.meeting_id}`)} style={{ fontSize:11, color:'#8B7FF7', background:'rgba(100,87,249,0.12)', padding:'3px 10px', borderRadius:20, fontWeight:500, cursor:'pointer', border:'1px solid rgba(100,87,249,0.2)' }}>
                            📋 {item.meetings.title.length>35?item.meetings.title.substring(0,35)+'...':item.meetings.title}
                          </span>
                        )}
                        {item.assignee && <span style={{ fontSize:11, color:'rgba(240,240,255,0.5)', background:'rgba(255,255,255,0.06)', padding:'3px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.08)' }}>👤 {item.assignee}</span>}
                        {item.deadline && (
                          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:500, color:od?'#EF4444':'#F59E0B', background:od?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)', border:`1px solid ${od?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)'}` }}>
                            {od?'🚨 Overdue: ':'📅 '}
                            {new Date(item.deadline).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          </span>
                        )}
                        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600, background:item.is_completed?'rgba(34,197,94,0.1)':od?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)', color:item.is_completed?'#22C55E':od?'#EF4444':'#F59E0B' }}>
                          {item.is_completed?'✅ Done':od?'🚨 Overdue':'⏳ Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="action-item-actions" style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => startEdit(item)} style={{ background:'rgba(100,87,249,0.12)', border:'1px solid rgba(100,87,249,0.25)', color:'#a89fff', padding:'5px 11px', borderRadius:7, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>✏️ Edit</button>
                      <button onClick={() => deleteItem(item.id)} style={{ background:'none', border:'none', fontSize:15, cursor:'pointer', color:'rgba(255,255,255,0.2)', padding:5, transition:'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#EF4444'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.2)'}
                      >🗑</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Progress bar */}
      {total>0 && (
        <div style={{ background:surface, borderRadius:14, padding:'18px 20px', border:'1px solid rgba(100,87,249,0.15)', backdropFilter:'blur(10px)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:6 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'#f0f0ff' }}>Overall Progress</span>
            <span style={{ fontSize:12, color:'rgba(240,240,255,0.45)' }}>{completed}/{total} completed ({Math.round((completed/total)*100)}%)</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:10, height:8, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:10, background:'linear-gradient(90deg,#6457F9,#8B7FF7)', width:`${total>0?Math.round((completed/total)*100):0}%`, transition:'width 0.5s ease' }} />
          </div>
          {overdue>0 && <p style={{ margin:'10px 0 0', fontSize:12, color:'#EF4444' }}>🚨 {overdue} task{overdue>1?'s are':' is'} overdue — mark done or update deadline</p>}
        </div>
      )}
    </div>
  )
}