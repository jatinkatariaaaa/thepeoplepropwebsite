import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Prop Firm Insights | The People Prop',
  description:
    'Read the latest prop trading insights, strategies, risk management tips, and industry news from The People Prop. Get funded and trade smarter.',
  keywords: [
    'prop firm blog',
    'trading insights',
    'prop firm tips',
    'funded trader blog',
    'forex trading blog',
  ],
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
