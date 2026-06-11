// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../lib/supabase'

// export default function Profile() {
//   const navigate = useNavigate()
//   const [user, setUser] = useState<any>(null)
//   const [profile, setProfile] = useState({ full_name: '', avatar_url: '', plan: 'free' })
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState('')
//   const [newPassword, setNewPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [changingPassword, setChangingPassword] = useState(false)
//   const [stats, setStats] = useState({ meetings: 0, actionItems: 0, completed: 0 })
//   const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats'>('profile')

//   useEffect(() => { fetchProfile() }, [])

//   const fetchProfile = async () => {
//     setLoading(true)
//     const { data: { session } } = await supabase.auth.getSession()
//     if (!session) { navigate('/login'); return }
//     setUser(session.user)

//     const { data: profileData } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', session.user.id)
//       .single()

//     if (profileData) {
//       setProfile({
//         full_name: profileData.full_name || '',
//         avatar_url: profileData.avatar_url || '',
//         plan: profileData.plan || 'free'
//       })
//     }

//     const { data: meetings } = await supabase
//       .from('meetings')
//       .select('id')
//       .eq('user_id', session.user.id)

//     const { data: actions } = await supabase
//       .from('action_items')
//       .select('id, is_completed')
//       .eq('user_id', session.user.id)

//     setStats({
//       meetings: meetings?.length || 0,
//       actionItems: actions?.length || 0,
//       completed: actions?.filter(a => a.is_completed).length || 0
//     })
//     setLoading(false)
//   }

//   const saveProfile = async () => {
//     setSaving(true)
//     setMessage('')
//     setError('')
//     const { error } = await supabase
//       .from('profiles')
//       .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
//       .eq('id', user.id)
//     if (error) setError(error.message)
//     else setMessage('✅ Profile updated successfully!')
//     setSaving(false)
//   }

//   const changePassword = async () => {
//     if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
//     if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
//     setChangingPassword(true)
//     setMessage('')
//     setError('')
//     const { error } = await supabase.auth.updateUser({ password: newPassword })
//     if (error) setError(error.message)
//     else { setMessage('✅ Password changed successfully!'); setNewPassword(''); setConfirmPassword('') }
//     setChangingPassword(false)
//   }

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     navigate('/login')
//   }

//   const initials = profile.full_name
//     ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
//     : user?.email?.charAt(0).toUpperCase() || 'U'

//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
//       Loading...
//     </div>
//   )

//   const inputStyle = {
//     width: '100%', padding: '12px 14px', borderRadius: '10px',
//     border: '1px solid rgba(255,255,255,0.1)', fontSize: '13.5px',
//     outline: 'none', background: 'rgba(255,255,255,0.05)',
//     color: 'white', fontFamily: "'DM Sans', sans-serif",
//     boxSizing: 'border-box' as const
//   }

//   const labelStyle = {
//     fontSize: '12.5px', color: 'rgba(255,255,255,0.5)',
//     display: 'block', marginBottom: '7px', fontWeight: '500' as const
//   }

//   const cardStyle = {
//     background: 'rgba(255,255,255,0.03)',
//     border: '1px solid rgba(255,255,255,0.08)',
//     borderRadius: '20px', padding: '28px',
//     backdropFilter: 'blur(20px)' as const
//   }

//   return (
//     <div style={{
//       minHeight: '100vh', padding: 'clamp(16px, 3vw, 32px)',
//       fontFamily: "'DM Sans', sans-serif",
//       background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)'
//     }}>
//       {/* Header */}
//       <div style={{ marginBottom: '28px' }}>
//         <button onClick={() => navigate('/dashboard')} style={{
//           background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
//           cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
//           display: 'flex', alignItems: 'center', gap: '6px', padding: 0
//         }}>← Back to Dashboard</button>
//         <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
//           Account Settings
//         </h1>
//         <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'rgba(255,255,255,0.4)' }}>
//           Manage your profile, security and preferences
//         </p>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: 'clamp(200px, 25%, 280px) 1fr', gap: '24px', alignItems: 'start' }}>

//         {/* Left — Avatar card */}
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           <div style={{ ...cardStyle, textAlign: 'center' }}>
//             {/* Avatar */}
//             <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
//               {profile.avatar_url ? (
//                 <img src={profile.avatar_url} alt="Avatar"
//                   style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(100,87,249,0.4)' }} />
//               ) : (
//                 <div style={{
//                   width: '80px', height: '80px', borderRadius: '50%',
//                   background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   fontSize: '28px', fontWeight: '700', color: 'white',
//                   border: '3px solid rgba(100,87,249,0.4)',
//                   boxShadow: '0 8px 24px rgba(100,87,249,0.3)'
//                 }}>{initials}</div>
//               )}
//             </div>

//             <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'white' }}>
//               {profile.full_name || 'Your Name'}
//             </h2>
//             <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>

//             <span style={{
//               background: profile.plan === 'pro' ? 'rgba(245,158,11,0.15)' : 'rgba(100,87,249,0.15)',
//               color: profile.plan === 'pro' ? '#f59e0b' : '#a5b4fc',
//               padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
//             }}>
//               {profile.plan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
//             </span>
//           </div>

//           {/* Stats card */}
//           <div style={cardStyle}>
//             <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'white' }}>Your Stats</h3>
//             {[
//               { label: 'Total Meetings', value: stats.meetings, icon: '🎙' },
//               { label: 'Action Items', value: stats.actionItems, icon: '📋' },
//               { label: 'Completed Tasks', value: stats.completed, icon: '✅' },
//             ].map(s => (
//               <div key={s.label} style={{
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                 padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
//               }}>
//                 <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.icon} {s.label}</span>
//                 <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{s.value}</span>
//               </div>
//             ))}
//           </div>

//           {/* Danger zone */}
//           <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
//             <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>Danger Zone</h3>
//             <button onClick={handleLogout} style={{
//               width: '100%', padding: '10px', borderRadius: '10px',
//               background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
//               color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
//               transition: 'all 0.2s'
//             }}
//               onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
//               onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
//             >Sign Out</button>
//           </div>
//         </div>

//         {/* Right — Tabs */}
//         <div>
//           {/* Tab bar */}
//           <div style={{
//             display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)',
//             padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
//             marginBottom: '20px', width: 'fit-content'
//           }}>
//             {([
//               { key: 'profile', label: '👤 Profile' },
//               { key: 'security', label: '🔒 Security' },
//               { key: 'stats', label: '📊 Activity' },
//             ] as const).map(tab => (
//               <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
//                 padding: '8px 18px', borderRadius: '9px', border: 'none',
//                 background: activeTab === tab.key ? 'rgba(100,87,249,0.3)' : 'transparent',
//                 color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.5)',
//                 fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
//               }}>{tab.label}</button>
//             ))}
//           </div>

//           {/* Messages */}
//           {message && (
//             <div style={{
//               background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
//               borderRadius: '10px', padding: '12px 16px', color: '#4ade80',
//               fontSize: '13.5px', marginBottom: '16px'
//             }}>{message}</div>
//           )}
//           {error && (
//             <div style={{
//               background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
//               borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
//               fontSize: '13.5px', marginBottom: '16px'
//             }}>{error}</div>
//           )}

//           {/* Profile tab */}
//           {activeTab === 'profile' && (
//             <div style={cardStyle}>
//               <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Profile Information</h3>

//               <div style={{ marginBottom: '18px' }}>
//                 <label style={labelStyle}>Full Name</label>
//                 <input
//                   value={profile.full_name}
//                   onChange={e => setProfile({ ...profile, full_name: e.target.value })}
//                   placeholder="Enter your full name"
//                   style={inputStyle}
//                   onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
//                   onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
//                 />
//               </div>

//               <div style={{ marginBottom: '18px' }}>
//                 <label style={labelStyle}>Email Address</label>
//                 <input
//                   value={user?.email || ''}
//                   disabled
//                   style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
//                 />
//                 <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
//                   Email cannot be changed
//                 </p>
//               </div>

//               <div style={{ marginBottom: '24px' }}>
//                 <label style={labelStyle}>Avatar URL</label>
//                 <input
//                   value={profile.avatar_url}
//                   onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
//                   placeholder="https://example.com/avatar.jpg"
//                   style={inputStyle}
//                   onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
//                   onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
//                 />
//                 <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
//                   Paste a direct image URL for your profile picture
//                 </p>
//               </div>

//               <div style={{ marginBottom: '24px' }}>
//                 <label style={labelStyle}>Plan</label>
//                 <div style={{
//                   padding: '12px 16px', borderRadius: '10px',
//                   background: 'rgba(100,87,249,0.1)', border: '1px solid rgba(100,87,249,0.2)',
//                   display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//                 }}>
//                   <div>
//                     <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'white' }}>
//                       {profile.plan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
//                     </div>
//                     <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
//                       {profile.plan === 'pro' ? 'All features unlocked' : 'Upgrade to unlock advanced features'}
//                     </div>
//                   </div>
//                   {profile.plan !== 'pro' && (
//                     <button style={{
//                       background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                       border: 'none', color: 'white', padding: '7px 16px',
//                       borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
//                     }}>Upgrade</button>
//                   )}
//                 </div>
//               </div>

//               <button onClick={saveProfile} disabled={saving} style={{
//                 padding: '12px 28px', borderRadius: '12px',
//                 background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
//                 color: 'white', border: 'none', fontSize: '14px',
//                 fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
//                 opacity: saving ? 0.7 : 1,
//                 boxShadow: '0 8px 24px rgba(100,87,249,0.3)'
//               }}>
//                 {saving ? '⏳ Saving...' : '💾 Save Changes'}
//               </button>
//             </div>
//           )}

//           {/* Security tab */}
//           {activeTab === 'security' && (
//             <div style={cardStyle}>
//               <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Change Password</h3>
//               <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
//                 Choose a strong password with at least 6 characters.
//               </p>

//               <div style={{ marginBottom: '18px' }}>
//                 <label style={labelStyle}>New Password</label>
//                 <input
//                   type="password"
//                   value={newPassword}
//                   onChange={e => setNewPassword(e.target.value)}
//                   placeholder="Enter new password"
//                   style={inputStyle}
//                   onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
//                   onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
//                 />
//               </div>

//               <div style={{ marginBottom: '28px' }}>
//                 <label style={labelStyle}>Confirm New Password</label>
//                 <input
//                   type="password"
//                   value={confirmPassword}
//                   onChange={e => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm new password"
//                   style={inputStyle}
//                   onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
//                   onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
//                 />
//                 {confirmPassword && newPassword !== confirmPassword && (
//                   <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
//                     ❌ Passwords do not match
//                   </p>
//                 )}
//                 {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
//                   <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '5px' }}>
//                     ✅ Passwords match
//                   </p>
//                 )}
//               </div>

//               <button onClick={changePassword} disabled={changingPassword || !newPassword || newPassword !== confirmPassword} style={{
//                 padding: '12px 28px', borderRadius: '12px',
//                 background: newPassword && newPassword === confirmPassword
//                   ? 'linear-gradient(135deg, #6457F9, #8B7FF7)'
//                   : 'rgba(255,255,255,0.08)',
//                 color: newPassword && newPassword === confirmPassword ? 'white' : 'rgba(255,255,255,0.3)',
//                 border: 'none', fontSize: '14px', fontWeight: '700',
//                 cursor: changingPassword || !newPassword || newPassword !== confirmPassword ? 'not-allowed' : 'pointer',
//                 boxShadow: newPassword && newPassword === confirmPassword ? '0 8px 24px rgba(100,87,249,0.3)' : 'none'
//               }}>
//                 {changingPassword ? '⏳ Updating...' : '🔒 Update Password'}
//               </button>

//               {/* Session info */}
//               <div style={{
//                 marginTop: '32px', paddingTop: '24px',
//                 borderTop: '1px solid rgba(255,255,255,0.08)'
//               }}>
//                 <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'white' }}>Session Info</h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   {[
//                     { label: 'Signed in as', value: user?.email },
//                     { label: 'Provider', value: user?.app_metadata?.provider || 'email' },
//                     { label: 'Last sign in', value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A' },
//                   ].map(item => (
//                     <div key={item.label} style={{
//                       display: 'flex', justifyContent: 'space-between',
//                       padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
//                       borderRadius: '8px', gap: '12px'
//                     }}>
//                       <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
//                       <span style={{ fontSize: '12.5px', color: 'white', fontWeight: '500', textAlign: 'right' }}>{item.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Activity tab */}
//           {activeTab === 'stats' && (
//             <div style={cardStyle}>
//               <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Your Activity</h3>

//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
//                 {[
//                   { label: 'Meetings', value: stats.meetings, icon: '🎙', color: '#6457F9' },
//                   { label: 'Tasks', value: stats.actionItems, icon: '📋', color: '#3b82f6' },
//                   { label: 'Done', value: stats.completed, icon: '✅', color: '#22c55e' },
//                 ].map(s => (
//                   <div key={s.label} style={{
//                     background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
//                     padding: '20px', border: '1px solid rgba(255,255,255,0.06)',
//                     textAlign: 'center'
//                   }}>
//                     <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
//                     <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{s.value}</div>
//                     <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Completion rate */}
//               <div style={{ marginBottom: '20px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                   <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Task completion rate</span>
//                   <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
//                     {stats.actionItems > 0 ? Math.round((stats.completed / stats.actionItems) * 100) : 0}%
//                   </span>
//                 </div>
//                 <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
//                   <div style={{
//                     height: '100%', borderRadius: '4px',
//                     background: 'linear-gradient(90deg, #6457F9, #22c55e)',
//                     width: `${stats.actionItems > 0 ? Math.round((stats.completed / stats.actionItems) * 100) : 0}%`,
//                     transition: 'width 1s ease'
//                   }} />
//                 </div>
//               </div>

//               <div style={{
//                 padding: '16px', background: 'rgba(100,87,249,0.08)',
//                 border: '1px solid rgba(100,87,249,0.2)', borderRadius: '12px'
//               }}>
//                 <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
//                   {stats.meetings === 0
//                     ? '🎙 Upload your first meeting to start tracking your productivity!'
//                     : `🎯 You've processed ${stats.meetings} meeting${stats.meetings > 1 ? 's' : ''} and completed ${stats.completed} out of ${stats.actionItems} action items. Keep it up!`
//                   }
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const responsiveCss = `
  .profile-layout {
    display: grid;
    grid-template-columns: clamp(200px, 25%, 280px) 1fr;
    gap: 24px;
    align-items: start;
  }
  .profile-activity-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .profile-tab-bar {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.03);
    padding: 5px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 20px;
    width: fit-content;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .profile-layout {
      grid-template-columns: 1fr !important;
    }
    .profile-activity-grid {
      grid-template-columns: 1fr !important;
    }
    .profile-tab-bar {
      width: 100% !important;
      justify-content: stretch;
    }
    .profile-tab-bar button {
      flex: 1;
      text-align: center;
    }
  }
  @media (max-width: 480px) {
    .profile-activity-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
`

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '', plan: 'free' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [stats, setStats] = useState({ meetings: 0, actionItems: 0, completed: 0 })
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats'>('profile')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    setUser(session.user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        avatar_url: profileData.avatar_url || '',
        plan: profileData.plan || 'free',
      })
    }

    const { data: meetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('user_id', session.user.id)

    const { data: actions } = await supabase
      .from('action_items')
      .select('id, is_completed')
      .eq('user_id', session.user.id)

    setStats({
      meetings: meetings?.length || 0,
      actionItems: actions?.length || 0,
      completed: actions?.filter(a => a.is_completed).length || 0,
    })
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage('')
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
      .eq('id', user.id)
    if (error) setError(error.message)
    else setMessage('✅ Profile updated successfully!')
    setSaving(false)
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setChangingPassword(true)
    setMessage('')
    setError('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setError(error.message)
    else { setMessage('✅ Password changed successfully!'); setNewPassword(''); setConfirmPassword('') }
    setChangingPassword(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
      Loading...
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', fontSize: '13.5px',
    outline: 'none', background: 'rgba(255,255,255,0.05)',
    color: 'white', fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '12.5px', color: 'rgba(255,255,255,0.5)',
    display: 'block', marginBottom: '7px', fontWeight: '500' as const,
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: 'clamp(16px, 3vw, 28px)',
    backdropFilter: 'blur(20px)' as const,
  }

  return (
    <div style={{
      minHeight: '100vh', padding: 'clamp(16px, 3vw, 32px)',
      fontFamily: "'DM Sans', sans-serif",
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)',
    }}>
      <style>{responsiveCss}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: '13px', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
        }}>← Back to Dashboard</button>
        <h1 style={{ margin: 0, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
          Account Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'rgba(255,255,255,0.4)' }}>
          Manage your profile, security and preferences
        </p>
      </div>

      <div className="profile-layout">

        {/* Left — Avatar card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(100,87,249,0.4)' }} />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: '700', color: 'white',
                  border: '3px solid rgba(100,87,249,0.4)',
                  boxShadow: '0 8px 24px rgba(100,87,249,0.3)',
                }}>{initials}</div>
              )}
            </div>

            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'white' }}>
              {profile.full_name || 'Your Name'}
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>{user?.email}</p>

            <span style={{
              background: profile.plan === 'pro' ? 'rgba(245,158,11,0.15)' : 'rgba(100,87,249,0.15)',
              color: profile.plan === 'pro' ? '#f59e0b' : '#a5b4fc',
              padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            }}>
              {profile.plan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
            </span>
          </div>

          {/* Stats card */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'white' }}>Your Stats</h3>
            {[
              { label: 'Total Meetings', value: stats.meetings, icon: '🎙' },
              { label: 'Action Items', value: stats.actionItems, icon: '📋' },
              { label: 'Completed Tasks', value: stats.completed, icon: '✅' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.icon} {s.label}</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>Danger Zone</h3>
            <button onClick={handleLogout} style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            >Sign Out</button>
          </div>
        </div>

        {/* Right — Tabs */}
        <div>
          {/* Tab bar */}
          <div className="profile-tab-bar">
            {([
              { key: 'profile', label: '👤 Profile' },
              { key: 'security', label: '🔒 Security' },
              { key: 'stats', label: '📊 Activity' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '8px 18px', borderRadius: '9px', border: 'none',
                background: activeTab === tab.key ? 'rgba(100,87,249,0.3)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Messages */}
          {message && (
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '10px', padding: '12px 16px', color: '#4ade80',
              fontSize: '13.5px', marginBottom: '16px',
            }}>{message}</div>
          )}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '12px 16px', color: '#ef4444',
              fontSize: '13.5px', marginBottom: '16px',
            }}>{error}</div>
          )}

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Profile Information</h3>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  value={user?.email || ''}
                  disabled
                  style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                />
                <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                  Email cannot be changed
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Avatar URL</label>
                <input
                  value={profile.avatar_url}
                  onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
                <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                  Paste a direct image URL for your profile picture
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Plan</label>
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(100,87,249,0.1)', border: '1px solid rgba(100,87,249,0.2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'white' }}>
                      {profile.plan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {profile.plan === 'pro' ? 'All features unlocked' : 'Upgrade to unlock advanced features'}
                    </div>
                  </div>
                  {profile.plan !== 'pro' && (
                    <button style={{
                      background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                      border: 'none', color: 'white', padding: '7px 16px',
                      borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    }}>Upgrade</button>
                  )}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} style={{
                padding: '12px 28px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6457F9, #8B7FF7)',
                color: 'white', border: 'none', fontSize: '14px',
                fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(100,87,249,0.3)',
              }}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Change Password</h3>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                Choose a strong password with at least 6 characters.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(100,87,249,0.5)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>❌ Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                  <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '5px' }}>✅ Passwords match</p>
                )}
              </div>

              <button onClick={changePassword} disabled={changingPassword || !newPassword || newPassword !== confirmPassword} style={{
                padding: '12px 28px', borderRadius: '12px',
                background: newPassword && newPassword === confirmPassword
                  ? 'linear-gradient(135deg, #6457F9, #8B7FF7)'
                  : 'rgba(255,255,255,0.08)',
                color: newPassword && newPassword === confirmPassword ? 'white' : 'rgba(255,255,255,0.3)',
                border: 'none', fontSize: '14px', fontWeight: '700',
                cursor: changingPassword || !newPassword || newPassword !== confirmPassword ? 'not-allowed' : 'pointer',
                boxShadow: newPassword && newPassword === confirmPassword ? '0 8px 24px rgba(100,87,249,0.3)' : 'none',
              }}>
                {changingPassword ? '⏳ Updating...' : '🔒 Update Password'}
              </button>

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'white' }}>Session Info</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Signed in as', value: user?.email },
                    { label: 'Provider', value: user?.app_metadata?.provider || 'email' },
                    { label: 'Last sign in', value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A' },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px', gap: '12px', flexWrap: 'wrap',
                    }}>
                      <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                      <span style={{ fontSize: '12.5px', color: 'white', fontWeight: '500', textAlign: 'right', wordBreak: 'break-all' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity tab */}
          {activeTab === 'stats' && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700', color: 'white' }}>Your Activity</h3>

              <div className="profile-activity-grid">
                {[
                  { label: 'Meetings', value: stats.meetings, icon: '🎙', color: '#6457F9' },
                  { label: 'Tasks', value: stats.actionItems, icon: '📋', color: '#3b82f6' },
                  { label: 'Done', value: stats.completed, icon: '✅', color: '#22c55e' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                    padding: '20px', border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Task completion rate</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                    {stats.actionItems > 0 ? Math.round((stats.completed / stats.actionItems) * 100) : 0}%
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: 'linear-gradient(90deg, #6457F9, #22c55e)',
                    width: `${stats.actionItems > 0 ? Math.round((stats.completed / stats.actionItems) * 100) : 0}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>

              <div style={{
                padding: '16px', background: 'rgba(100,87,249,0.08)',
                border: '1px solid rgba(100,87,249,0.2)', borderRadius: '12px',
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  {stats.meetings === 0
                    ? '🎙 Upload your first meeting to start tracking your productivity!'
                    : `🎯 You've processed ${stats.meetings} meeting${stats.meetings > 1 ? 's' : ''} and completed ${stats.completed} out of ${stats.actionItems} action items. Keep it up!`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}