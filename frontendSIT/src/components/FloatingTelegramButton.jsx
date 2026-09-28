import { useState } from 'react'
import { getAuthData } from '@/services/authService'
import { request } from '@/services/api'

const TELEGRAM_BOT_USERNAME = 'SistemTetangga_bot' // Username bot Telegram Anda

export function FloatingTelegramButton() {
  const [loading, setLoading] = useState(false)
  const authUser = getAuthData()

  async function handleClick() {
    if (!TELEGRAM_BOT_USERNAME) return
    
    // Jika user sudah login, coba dapatkan secure deep-link
    if (authUser && authUser.id_users) {
      setLoading(true)
      try {
        const res = await request('/telegram/generate-link', { method: 'POST' })
        if (res && res.url) {
          window.open(res.url, '_blank')
        } else {
          window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, '_blank')
        }
      } catch (err) {
        console.error("Gagal mendapat link rahasia", err)
        window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, '_blank')
      } finally {
        setLoading(false)
      }
    } else {
      // Jika belum login (warga publik), buka langsung
      window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label="Hubungi via Telegram"
      className={`fixed bottom-4 right-4 max-sm:bottom-3 max-sm:right-3 z-50 flex h-14 w-14 max-sm:h-12 max-sm:w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg transition-transform hover:scale-110 ${loading ? 'opacity-70 animate-pulse' : ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 pr-1 fill-current">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.09l-6.4 4.024-2.76-.86c-.6-.185-.615-.6.125-.89l10.736-4.133c.5-.184.953.116.825.885z" />
      </svg>
    </button>
  )
}
