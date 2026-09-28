const TELEGRAM_BOT_USERNAME = 'SistemTetangga_bot' // Username bot Telegram Anda

export function FloatingTelegramButton() {
  const href = TELEGRAM_BOT_USERNAME
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}`
    : null
  const Tag = href ? 'a' : 'button'
  const extra = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { type: 'button' }

  return (
    <Tag
      {...extra}
      aria-label="Hubungi via Telegram"
      className="fixed bottom-4 right-4 max-sm:bottom-3 max-sm:right-3 z-50 flex h-14 w-14 max-sm:h-12 max-sm:w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 pr-1 fill-current">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.285-.346-.09l-6.4 4.024-2.76-.86c-.6-.185-.615-.6.125-.89l10.736-4.133c.5-.184.953.116.825.885z" />
      </svg>
    </Tag>
  )
}
