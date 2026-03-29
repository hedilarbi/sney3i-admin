'use client'

import { useEffect, useState } from 'react'

interface Submission {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  address: string
  bio: string
  status: string
  category?: { name: string; icon: string }
  createdAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/submissions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
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
        setSubmissions(prev => prev.filter(s => s._id !== id))
        if (selected?._id === id) setSelected(null)
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1F2937' }}>Inscriptions en attente</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{submissions.length} demande(s) en attente de validation</p>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#9CA3AF' }}>Chargement...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold" style={{ color: '#374151' }}>Aucune inscription en attente</p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Toutes les demandes ont été traitées</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* List */}
          <div className="flex-1 space-y-3">
            {submissions.map(sub => (
              <div
                key={sub._id}
                onClick={() => setSelected(sub)}
                className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer transition-all"
                style={{
                  border: '2px solid',
                  borderColor: selected?._id === sub._id ? '#F97316' : 'transparent',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: '#1F2937' }}>{sub.name}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{sub.category?.icon} {sub.category?.name || 'Sans catégorie'}</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{sub.city} • {sub.phone}</p>
                  </div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={e => { e.stopPropagation(); updateStatus(sub._id, 'approved') }}
                    disabled={actionLoading === sub._id + 'approved'}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
                    style={{ background: '#0D9488' }}
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); updateStatus(sub._id, 'rejected') }}
                    disabled={actionLoading === sub._id + 'rejected'}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
                    style={{ background: '#FEE2E2', color: '#991B1B' }}
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-8">
              <h3 className="font-bold text-lg mb-4" style={{ color: '#1F2937' }}>Détails</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>NOM</p>
                  <p className="font-medium" style={{ color: '#1F2937' }}>{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>EMAIL</p>
                  <p style={{ color: '#374151' }}>{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>TÉLÉPHONE</p>
                  <p style={{ color: '#374151' }}>{selected.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>CATÉGORIE</p>
                  <p style={{ color: '#374151' }}>{selected.category?.icon} {selected.category?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>VILLE / ADRESSE</p>
                  <p style={{ color: '#374151' }}>{selected.city}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{selected.address}</p>
                </div>
                {selected.bio && (
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>BIO</p>
                    <p className="text-sm" style={{ color: '#374151' }}>{selected.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
