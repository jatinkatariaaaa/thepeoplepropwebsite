const items = [
  { num: '01', highlight: '100%', title: 'Profit Split', desc: 'Keep every dollar you earn.' },
  { num: '02', highlight: '150%', title: 'Fee Refund', desc: 'More than your investment back.' },
  { num: '03', highlight: '12h', title: 'Speed', desc: 'Fastest in the industry.' },
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
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          06 &mdash; The full index
        </p>

        <div className="mt-10 flex flex-col">
          {items.map((item) => (
            <div
              key={item.num}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-6 border-t border-border py-6 transition-colors last:border-b hover:bg-background md:grid-cols-[80px_1fr_minmax(0,320px)] md:gap-10"
            >
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {item.num}
              </span>
              <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                <span className="text-primary">{item.highlight}</span>{' '}
                {item.title}
              </h3>
              <p className="col-start-2 text-sm leading-relaxed text-muted-foreground md:col-start-3 md:text-right">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
