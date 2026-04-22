interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'start' | 'center'
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'start',
}: SectionHeaderProps) {
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-right items-start'
  return (
    <div className={`flex flex-col gap-3 ${alignCls}`}>
      {eyebrow && (
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-reno-500" />
          {eyebrow}
        </span>
      )}
      <h2 className="heading text-3xl md:text-4xl">{title}</h2>
      {description && (
        <p className="max-w-2xl text-base leading-8 text-reno-600 dark:text-reno-300">
          {description}
        </p>
      )}
    </div>
  )
}
