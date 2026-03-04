import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 -webkit-overflow-scrolling-touch">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
