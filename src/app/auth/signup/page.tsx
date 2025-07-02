'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import { Space_Grotesk, Pixelify_Sans } from 'next/font/google'
import Link from "next/link"
import { ArrowLeft, Gift, Loader2, Cpu, UserPlus } from "lucide-react"

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  variable: '--font-pixelify-sans'
})

export default function SignUpPage() {
  const { t, isLoading: translationsLoading } = useTranslations()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?message=Account created successfully")
      } else {
        const data = await response.json()
        setError(data.error || "Something went wrong")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className={`${pixelifySans.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F7F7F5] text-[#1A1A1A] relative overflow-hidden`}>
      {/* Grid pattern futurista de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#D97706 1px, transparent 1px),
            linear-gradient(90deg, #D97706 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12">
        <div className="w-[95%] max-w-md space-y-8" style={{maxWidth: '480px'}}>
          <div className="text-center">
            <Link href="/" className="font-space-grotesk inline-flex items-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-8 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.backToHome')}
            </Link>
            
            {/* Indicador sutil de tecnología */}
            <p className="text-sm text-[#6B6B6B] font-medium mb-6 flex items-center justify-center">
              <Cpu className="w-3 h-3 mr-2 text-[#D97706]" />
              Plataforma de Optimización IA
            </p>
            
            <h2 className="font-pixelify-sans text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {t('auth.signup.title').toUpperCase()}
            </h2>
            <p className="font-space-grotesk text-lg text-[#6B6B6B] font-medium mb-6">
              {t('auth.signup.subtitle')}
            </p>
            
            <div className="inline-flex items-center px-6 py-3 bg-[#D97706] text-white text-sm font-bold mb-8 rounded-xl">
              <Gift className="w-4 h-4 mr-2" />
              {t('auth.signup.freeCredits')}
            </div>
          </div>

          <div className="bg-white border-2 border-[#E5E5E5] p-8 hover:border-[#D97706] transition-all rounded-2xl hover:shadow-[0_4px_16px_rgba(217,151,6,0.12),0_12px_32px_rgba(217,151,6,0.08)]" style={{boxShadow: '0 1px 3px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04)'}}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#D97706] mb-4 flex items-center justify-center mx-auto rounded-xl">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-pixelify-sans text-xl font-bold text-[#1A1A1A] mb-2">{t('auth.signup.createAccount').toUpperCase()}</h3>
              <p className="font-space-grotesk text-[#6B6B6B] font-medium">
                {t('auth.signup.description')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-space-grotesk font-bold text-[#1A1A1A]" htmlFor="firstName">{t('auth.signup.firstName')}</Label>
                  <Input
                    className="border-2 border-[#E5E5E5] focus:border-[#D97706] font-space-grotesk"
                    id="firstName"
                    placeholder="Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-space-grotesk font-bold text-[#1A1A1A]" htmlFor="lastName">{t('auth.signup.lastName')}</Label>
                  <Input
                    className="border-2 border-[#E5E5E5] focus:border-[#D97706] font-space-grotesk"
                    id="lastName"
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-space-grotesk font-bold text-[#1A1A1A]" htmlFor="email">{t('auth.signup.email')}</Label>
                <Input
                  className="border-2 border-[#E5E5E5] focus:border-[#D97706] font-space-grotesk"
                  id="email"
                  type="email"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-space-grotesk font-bold text-[#1A1A1A]" htmlFor="password">{t('auth.signup.password')}</Label>
                <Input
                  className="border-2 border-[#E5E5E5] focus:border-[#D97706] font-space-grotesk"
                  id="password"
                  type="password"
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-space-grotesk font-bold text-[#1A1A1A]" htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</Label>
                <Input
                  className="border-2 border-[#E5E5E5] focus:border-[#D97706] font-space-grotesk"
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                className="font-space-grotesk w-full bg-[#D97706] text-white py-3 text-lg font-bold hover:bg-[#B45309] transition-all rounded-xl" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.signup.createAccount')}...
                  </>
                ) : (
                  t('auth.signup.createAccount')
                )}
              </Button>

              <div className="text-center font-space-grotesk text-sm text-[#6B6B6B] font-medium">
                {t('auth.signup.haveAccount')}{" "}
                <Link href="/auth/signin" className="text-[#D97706] hover:text-[#B45309] font-bold">
                  {t('auth.signup.signInHere')}
                </Link>
              </div>

              <div className="font-space-grotesk text-xs text-[#6B6B6B] text-center">
                {t('auth.signup.termsAgreement')}{" "}
                <Link href="#" className="text-[#D97706] hover:text-[#B45309]">
                  {t('auth.signup.termsOfService')}
                </Link>{" "}
                {t('auth.signup.and')}{" "}
                <Link href="#" className="text-[#D97706] hover:text-[#B45309]">
                  {t('auth.signup.privacyPolicy')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}