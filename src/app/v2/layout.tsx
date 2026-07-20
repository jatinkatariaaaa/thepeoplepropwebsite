import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' })

export const metadata: Metadata = {
  title: 'The People Prop | Trade Our Capital. Keep the Profits.',
  description: 'Transparent prop trading challenges, funded accounts up to $200,000, up to 90% profit split and payouts in under 24 hours.',
  alternates: { canonical: '/v2' },
  openGraph: { title: 'The People Prop | A Prop Firm Built for Traders', description: 'Transparent rules, real capital and payouts built around the trader.', type: 'website', url: '/v2' },
  twitter: { card: 'summary_large_image', title: 'The People Prop', description: 'Trade our capital. Keep up to 90% of the profits.' },
}

export const viewport: Viewport = { themeColor: '#0d1f16', colorScheme: 'light', width: 'device-width', initialScale: 1 }

export default function V2Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`v2-scope ${bricolage.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>{children}</div>
}
