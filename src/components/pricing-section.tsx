import { ClientWrapper } from "@/components/client-wrapper"
import { PricingSectionClient } from "@/components/pricing-section-client"

export function PricingSection() {
  return (
    <ClientWrapper 
      fallback={
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4 mx-auto"></div>
              <div className="h-10 w-96 bg-gray-200 animate-pulse rounded mb-4 mx-auto"></div>
              <div className="h-6 w-full max-w-2xl bg-gray-200 animate-pulse rounded mx-auto"></div>
            </div>
          </div>
        </section>
      }
    >
      <PricingSectionClient />
    </ClientWrapper>
  )
}