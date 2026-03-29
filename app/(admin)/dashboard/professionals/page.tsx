'use client'

import { useEffect, useState } from 'react'

type ProStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

interface Professional {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  status: ProStatus
  rating: number
  ratingsCount: number
  subscription: { plan: string; isActive: boolean }
  category?: { name: string; icon: string }
  createdAt: string
}

const statusColors: Record<ProStatus, { bg: string; text: string; label: string }> = {
  approved: { bg: '#D1FAE5', text: '#065F46', label: 'Approuvé' },
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejeté' },
  suspended: { bg: '#F3F4F6', text: '#4B5563', label: 'Suspendu' },
}

const planColors: Record<string, { bg: string; text: string }> = {
  free: { bg: '#F3F4F6', text: '#6B7280' },
  basic: { bg: '#DBEAFE', text: '#1E40AF' },
  premium: { bg: '#FEF3C7', text: '#92400E' },
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchProfessionals()
  }, [])

  async function fetchProfessionals() {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/professionals', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProfessionals(data.professionals || [])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: ProStatus) {
    setActionLoading(id + status)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setProfessionals(prev =>
          prev.map(p => (p._id === id ? { ...p, status } : p))
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function updateSubscription(id: string, plan: string) {
    setActionLoading(id + 'sub')
    try {
      const token = localStorage.getItem('admin_token')
      const expiresAt = plan !== 'free'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null
      await fetch(`/api/admin/professionals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription: { plan, isActive: true, expiresAt } }),
      })
      setProfessionals(prev =>
        prev.map(p => p._id === id ? { ...p, subscription: { ...p.subscription, plan } } : p)
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function deletePro(id: string) {
    if (!confirm('Confirmer la suppression ?')) return
    setActionLoading(id + 'del')
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`/api/admin/professionals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfessionals(prev => prev.filter(p => p._id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'all' ? professionals : professionals.filter(p => p.status === filter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1F2937' }}>Professionnels</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{professionals.length} professionnel(s) au total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'approved', 'pending', 'suspended', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: filter === f ? '#F97316' : '#fff',
              color: filter === f ? '#fff' : '#6B7280',
              border: '1px solid',
              borderColor: filter === f ? '#F97316' : '#E5E7EB',
            }}
          >
            {f === 'all' ? 'Tous' : statusColors[f as ProStatus]?.label || f}
            <span className="ml-2 text-xs">
              ({f === 'all' ? professionals.length : professionals.filter(p => p.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#9CA3AF' }}>Chargement...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Professionnel</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Catégorie</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Ville</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Note</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Statut</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Abonnement</th>
                <th className="px-5 py-4 text-left font-semibold" style={{ color: '#6B7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pro, i) => {
                const sc = statusColors[pro.status] || statusColors.pending
                const pc = planColors[pro.subscription?.plan] || planColors.free
                return (
                  <tr
                    key={pro._id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : undefined }}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold" style={{ color: '#1F2937' }}>{pro.name}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{pro.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: '#374151' }}>
                        {pro.category?.icon} {pro.category?.name || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ color: '#374151' }}>{pro.city || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium" style={{ color: '#F97316' }}>
                        ★ {pro.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>({pro.ratingsCount})</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={pro.subscription?.plan || 'free'}
                        onChange={e => updateSubscription(pro._id, e.target.value)}
                        disabled={actionLoading === pro._id + 'sub'}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border-0 outline-none cursor-pointer"
                        style={{ background: pc.bg, color: pc.text }}
                      >
                        <option value="free">Gratuit</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {pro.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(pro._id, 'approved')}
                            disabled={actionLoading === pro._id + 'approved'}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                            style={{ background: '#0D9488' }}
                          >
                            Approuver
                          </button>
                        )}
                        {pro.status !== 'suspended' && (
                          <button
                            onClick={() => updateStatus(pro._id, 'suspended')}
                            disabled={actionLoading === pro._id + 'suspended'}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: '#FEF3C7', color: '#92400E' }}
                          >
                            Suspendre
                          </button>
                        )}
                        {pro.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(pro._id, 'rejected')}
                            disabled={actionLoading === pro._id + 'rejected'}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: '#FEE2E2', color: '#991B1B' }}
                          >
                            Rejeter
                          </button>
                        )}
                        <button
                          onClick={() => deletePro(pro._id)}
                          disabled={actionLoading === pro._id + 'del'}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: '#F3F4F6', color: '#6B7280' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center" style={{ color: '#9CA3AF' }}>
                    Aucun professionnel trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
