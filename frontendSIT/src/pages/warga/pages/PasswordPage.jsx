import { useState } from "react"
import { PageShell } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { changePassword } from "@/services/api"
import { useToast } from "@/components/ui/ToastContext"

export default function PasswordPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.new_password.length < 6) {
      showToast("Password baru minimal 6 karakter.", "error")
      return
    }
    if (form.new_password !== form.new_password_confirmation) {
      showToast("Konfirmasi password tidak cocok.", "error")
      return
    }
    setIsSubmitting(true)
    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      })
      showToast("Password berhasil diubah.")
      setForm({ current_password: "", new_password: "", new_password_confirmation: "" })
    } catch (err) {
      console.error(err)
      showToast(err.message || "Gagal mengubah password.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      eyebrow="Keamanan Akun"
      title="Ubah Password"
      description="Perbarui password Anda untuk menjaga keamanan akun."
    >
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="border-2 border-neutral-900 bg-white p-6 rounded-xl space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-sm font-bold text-black">Password Lama <span className="text-red-500">*</span></Label>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              required
              value={form.current_password}
              onChange={handleChange}
              placeholder="Masukkan password lama"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-sm font-bold text-black">Password Baru <span className="text-red-500">*</span></Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              required
              value={form.new_password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password_confirmation" className="text-sm font-bold text-black">Konfirmasi Password Baru <span className="text-red-500">*</span></Label>
            <Input
              id="new_password_confirmation"
              name="new_password_confirmation"
              type="password"
              required
              value={form.new_password_confirmation}
              onChange={handleChange}
              placeholder="Ulangi password baru"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </form>
      </div>
    </PageShell>
  )
}
