'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/dashboard/professionals', label: 'Professionnels', icon: '👷' },
  { href: '/dashboard/submissions', label: 'Inscriptions', icon: '📋' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('admin_token')
    if (!token) router.replace('/login')
  }, [router])

  function handleLogout() {
    localStorage.removeItem('admin_token')
    router.replace('/login')
  }

  if (!mounted) return null

  return (
    <div className="flex min-h-screen" style={{ background: '#F3F4F6' }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shadow-lg" style={{ background: '#1F2937' }}>
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#374151' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F97316' }}>
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">TounsiPro</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Administration</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={{
                  background: active ? '#F97316' : 'transparent',
                  color: active ? '#fff' : '#D1D5DB',
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: '#374151' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium transition-all"
            style={{ color: '#F87171' }}
          >
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
