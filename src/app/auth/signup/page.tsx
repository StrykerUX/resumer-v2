'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { ArrowLeft, Gift, Loader2 } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {t('auth.signup.title')} <span className="text-blue-600">Resumer-v2</span>
          </h2>
          <p className="mt-2 text-gray-600">
            {t('auth.signup.subtitle')}
          </p>
          
          <Badge variant="secondary" className="mt-4">
            <Gift className="w-4 h-4 mr-2" />
            {t('auth.signup.freeCredits')}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signup.createAccount')}</CardTitle>
            <CardDescription>
              {t('auth.signup.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.signup.firstName')}</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.signup.lastName')}</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signup.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signup.password')}</Label>
                <Input
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
                <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.signup.createAccount')}...
                  </>
                ) : (
                  t('auth.signup.createAccount')
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                {t('auth.signup.haveAccount')}{" "}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                  {t('auth.signup.signInHere')}
                </Link>
              </div>

              <div className="text-xs text-gray-500 text-center">
                {t('auth.signup.termsAgreement')}{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-500">
                  {t('auth.signup.termsOfService')}
                </Link>{" "}
                {t('auth.signup.and')}{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-500">
                  {t('auth.signup.privacyPolicy')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}