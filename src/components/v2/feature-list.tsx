import { Info } from 'lucide-react'

const items = [
  { num: '01', highlight: '100%', title: 'Profit Split', desc: 'Keep every dollar you earn.' },
  { num: '02', highlight: '150%', title: 'Fee Refund', desc: 'More than your investment back.' },
  { num: '03', highlight: '12h', title: 'Speed', desc: 'Fastest in the industry' },
  { num: '04', highlight: '50%', title: 'In-Challenge', desc: 'Earn during evaluation.' },
  { num: '05', highlight: 'Zero', title: 'Consistency Rules', desc: 'Trade your edge freely.' },
  { num: '06', highlight: 'First', title: 'Loss Insurance', desc: 'Your first loss covered.' },
  { num: '07', highlight: '24/7', title: 'Human Support', desc: 'Real humans, any hour.' },
  { num: '08', highlight: 'Open', title: 'Weekend & News', desc: 'No calendar restrictions.' },
  { num: '09', highlight: 'EAs', title: '& Algo Allowed', desc: "Run your bots. We don't interfere." },
  { num: '10', highlight: 'Free', title: 'Challenge Reset', desc: 'Miss once? We reset you for free.' },
  { num: '11', highlight: '\u221E', title: 'Trading Days', desc: 'Take all the time you need.' },
]

export function FeatureList() {
  return (
    <section
      className="px-4 py-20"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(14,159,110,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,159,110,0.05) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 border-t border-border md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.num}
            className="relative flex gap-6 border-b border-border px-4 py-10"
          >
            <span className="pt-1 font-heading text-sm font-bold text-primary">
              {item.num}
            </span>
            <div>
              <h3 className="font-heading text-2xl font-bold text-navy">
                <span className="text-primary">{item.highlight}</span>{' '}
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <Info
              aria-hidden="true"
              className="absolute right-4 top-6 size-4 text-primary/40"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
