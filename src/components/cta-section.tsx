'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have enhanced their resumes with AI. 
            Start your free analysis today and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8 bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/auth/signup">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90">
            <div>
              <div className="text-3xl font-bold mb-2">10k+</div>
              <div>Resumes Enhanced</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">94%</div>
              <div>Interview Rate Increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">48hrs</div>
              <div>Average Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}