'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function SignInPage() {
  const { t, isLoading: translationsLoading } = useTranslations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/dashboard")
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
            {t('auth.signin.title')} <span className="text-blue-600">Resumer-v2</span>
          </h2>
          <p className="mt-2 text-gray-600">
            {t('auth.signin.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signin.signIn')}</CardTitle>
            <CardDescription>
              {t('auth.signin.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signin.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signin.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signin.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.signin.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.signin.signIn')}...
                  </>
                ) : (
                  t('auth.signin.signIn')
                )}
              </Button>

              <div className="text-center">
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  {t('auth.signin.forgotPassword')}
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                {t('auth.signin.noAccount')}{" "}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
                  {t('auth.signin.signUpHere')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}