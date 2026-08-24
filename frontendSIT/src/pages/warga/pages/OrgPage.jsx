import React, { useState, useEffect } from 'react'
import { getOrganizationMembers } from '../../../services/api'

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

export default function OrgPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganizationMembers({ per_page: 100 })
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setMembers(arr)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <PageShell eyebrow="Struktur Organisasi" title="Struktur Organisasi & Kepengurusan" description="Mengenal lebih dekat para pengurus RT/RW yang bertugas.">
      <section className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengurus...</div>
          ) : members.length === 0 ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada data struktur organisasi.</div>
          ) : members.map((m) => (
            <div key={m.id_organization_member || m.id} className="relative rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
              <span className={`absolute top-4 right-4 h-3 w-3 rounded-full ${m.status_aktif ? 'bg-emerald-500' : 'bg-neutral-300'}`} title={m.status_aktif ? 'Aktif' : 'Nonaktif'} />
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 font-extrabold text-black text-xl mb-4">
                  {m.citizen?.nama_lengkap?.[0] || '?'}
                </div>
                <h3 className="font-bold text-black text-lg">{m.citizen?.nama_lengkap || 'Warga Terhapus'}</h3>
                <p className="mt-1 text-xs font-bold uppercase text-sky-700">{m.jabatan}</p>
                <div className="mt-4 pt-4 border-t w-full">
                  <p className="text-xs text-neutral-500">Masa Jabatan: {m.periode_mulai} - {m.periode_selesai || 'Sekarang'}</p>
                  <p className="text-xs text-neutral-500 mt-1">Kontak: {m.citizen?.no_hp || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
