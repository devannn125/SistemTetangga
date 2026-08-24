import React, { useState, useEffect } from 'react'
import { getRegulations } from '../../../services/api'

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

export default function RulesPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRegulations({ per_page: 100 })
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setRules(arr)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <PageShell eyebrow="Peraturan & Tata Tertib" title="Peraturan Lingkungan" description="Baca peraturan dan tata tertib lingkungan resmi.">
      <section className="mt-6 grid gap-4">
        {loading ? (
           <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat peraturan...</div>
        ) : rules.length === 0 ? (
           <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada peraturan yang diterbitkan.</div>
        ) : rules.map((d) => (
          <article key={d.id_regulation || d.id} className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-black text-lg">{d.judul}</h3>
                <p className="mt-1 text-xs font-bold uppercase text-neutral-500">Tipe: {d.jenis_peraturan}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">{d.isi_peraturan || d.deskripsi}</p>
            {d.file_url && (
              <a href={d.file_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-bold uppercase text-sky-600 hover:underline">
                Unduh Lampiran PDF
              </a>
            )}
          </article>
        ))}
      </section>
    </PageShell>
  )
}
