import { useState, useEffect, useRef } from 'react'
import { getAuthData } from '@/services/authService'
import { sendChatbotMessage } from '@/services/api'

export function FloatingTelegramButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const authUser = getAuthData()

  // Inisialisasi pesan sambutan saat chatbox pertama kali dibuka
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const nama = authUser?.nama_users || 'Bapak/Ibu'
      const role = authUser?.role?.nama_role || authUser?.roles?.[0]?.nama_role || ''
      const roleText = role ? `sebagai ${role}` : ''
      
      const welcomeText = authUser
        ? `Halo ${nama}! 👋\n\nSaya asisten AI Sistem Tetangga. Saya siap membantu Anda memberikan informasi terkait data wilayah, statistik, pengurus, surat, dan layanan RT ${roleText}.\n\nAda yang bisa saya bantu hari ini?`
        : `Halo! 👋 Selamat datang di Sistem Tetangga.\n\nSaya asisten virtual resmi Sistem Tetangga. Silakan tanyakan informasi umum seputar layanan dan fasilitas kami. Jika Anda adalah warga atau pengurus, silakan login ke akun Anda untuk mengakses data wilayah lengkap.`

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: welcomeText,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isOpen])

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, isOpen])

  // Pertanyaan cepat (Suggestion Chips)
  const quickSuggestions = authUser
    ? ['Berapa total warga?', 'Siapa kepala dukuh wangon?', 'Berapa total dukuh dan apa saja?', 'Bagaimana alur surat?']
    : ['Apa itu Sistem Tetangga?', 'Bagaimana cara mengajukan surat?', 'Siapa saja pengurus di kelurahan?']

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || loading) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatbotMessage(query, window.location.pathname)
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res?.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Mohon maaf, terjadi kendala saat menghubungi server AI. Pastikan backend aktif dan coba lagi.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setMessages([])
    setIsOpen(false)
    setTimeout(() => setIsOpen(true), 100)
  }

  // Format teks sederhana (bold **teks** dan newlines)
  function formatText(text) {
    if (!text) return ''
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <>
      {/* Jendela Chatbox Popover */}
      {isOpen && (
        <div className="fixed bottom-22 right-5 z-50 flex h-[540px] max-h-[82vh] w-[92vw] sm:w-[390px] flex-col overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-400/30">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5Z" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-900 bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-white">Asisten AI Sistem Tetangga</h3>
                <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {authUser ? `Aktif (${authUser.nama_users})` : 'Aktif • Publik'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Bersihkan Percakapan"
                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 space-y-3.5 overflow-y-auto bg-neutral-50/70 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'max-w-[82%] rounded-tr-xs bg-sky-600 text-white shadow-xs'
                      : 'max-w-[86%] rounded-tl-xs border border-neutral-200/90 bg-white text-neutral-800 shadow-xs'
                  }`}
                >
                  {formatText(msg.text)}
                </div>
                <span className="mt-1 px-1 text-[10px] text-neutral-400">{msg.time}</span>
              </div>
            ))}

            {/* Indikator Mengetik */}
            {loading && (
              <div className="flex items-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-neutral-200/90 bg-white px-4 py-3 shadow-xs">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500" />
                </div>
              </div>
            )}

            {/* Quick Chips (Hanya tampil jika baru ada pesan sambutan) */}
            {messages.length <= 1 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-semibold text-neutral-500">Saran Pertanyaan:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item)}
                      disabled={loading}
                      className="rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 disabled:opacity-50 text-left"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="border-t border-neutral-200/80 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu seputar wilayah..."
                disabled={loading}
                className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-100/80 px-4 py-2.5 text-sm text-neutral-900 transition placeholder:text-neutral-400 focus:border-sky-500 focus:bg-white focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Kirim Pesan"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-40"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-neutral-400">
              Jawaban AI disesuaikan dengan data resmi & hak akses akun Anda.
            </p>
          </form>
        </div>
      )}

      {/* Tombol Floating Melayang di Pojok Kanan Bawah */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Tutup Chatbox' : 'Buka Asisten AI'}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-neutral-800 rotate-90 shadow-neutral-800/30'
            : 'bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-sky-600/35 hover:shadow-sky-600/50'
        }`}
      >
        {isOpen ? (
          <svg className="h-6 w-6 fill-none stroke-current stroke-2.5" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative flex items-center justify-center">
            <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5Z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}
      </button>
    </>
  )
}

// Export alias FloatingChatbot agar nama komponen semakin deskriptif
export { FloatingTelegramButton as FloatingChatbot }
