interface FalconLogoProps {
  size?: number
  className?: string
  /** رسم بدون مربّع خلفية — يستخدم currentColor فقط. */
  bare?: boolean
}

export default function FalconLogo({
  size = 40,
  className,
  bare = false,
}: FalconLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="شعار الصقر"
    >
      {!bare && (
        <rect
          width="64"
          height="64"
          rx="16"
          className="fill-reno-900 dark:fill-white"
        />
      )}
      <path
        d="M11 37c7-1.5 11.5-4.5 15.5-9.5C30 23 34.5 20 40 19c-1 3-3 5.6-5.8 7.6 4 .3 8-.8 11.8-2.6-2 4-4.8 7-8.6 8.9 3 .9 6 .8 9.6-.4-5 6.2-12 9.5-20 9.5-6 0-10.8-2-13-5z"
        className={bare ? 'fill-reno-900 dark:fill-white' : 'fill-white dark:fill-reno-900'}
      />
      <circle
        cx="41.5"
        cy="26.5"
        r="1.5"
        className={bare ? 'fill-white dark:fill-reno-900' : 'fill-reno-900 dark:fill-white'}
      />
    </svg>
  )
}
