'use client'

import { useEffect, useState } from 'react'

interface Stats {
  total: number
  approved: number
  pending: number
  suspended: number
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${color}20` }}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#6B7280' }}>{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/professionals', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const pros = data.professionals || []
      setStats({
        total: pros.length,
        approved: pros.filter((p: any) => p.status === 'approved').length,
        pending: pros.filter((p: any) => p.status === 'pending').length,
        suspended: pros.filter((p: any) => p.status === 'suspended').length,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMsg(data.message || 'Catégories initialisées')
    } catch {
      setSeedMsg('Erreur lors de l\'initialisation')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1F2937' }}>Tableau de bord</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Vue d&apos;ensemble de la plateforme TounsiPro</p>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#9CA3AF' }}>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total professionnels" value={stats.total} color="#1E3A8A" icon="👷" />
          <StatCard label="Approuvés" value={stats.approved} color="#0D9488" icon="✅" />
          <StatCard label="En attente" value={stats.pending} color="#F97316" icon="⏳" />
          <StatCard label="Suspendus" value={stats.suspended} color="#EF4444" icon="🚫" />
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4" style={{ color: '#1F2937' }}>Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ background: '#0D9488' }}
          >
            {seeding ? 'Initialisation...' : '🔄 Initialiser les catégories'}
          </button>
          {seedMsg && (
            <span className="flex items-center text-sm px-4 py-2 rounded-xl bg-green-50 text-green-700">
              ✓ {seedMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
