// import { Outlet } from 'react-router-dom'
// import Sidebar from '../components/Sidebar'

// export default function DashboardLayout() {
//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F9FC', fontFamily: "'DM Sans', sans-serif" }}>
//       <Sidebar />
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
//         <Outlet />
//       </div>
//     </div>
//   )
// }

import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)',
      overflow: 'hidden'
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minWidth: 0
      }}>
        <Outlet />
      </div>
    </div>
  )
}