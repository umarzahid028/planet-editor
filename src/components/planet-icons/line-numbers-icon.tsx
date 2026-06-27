import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const LineNumbersIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* gutter divider */}
      <path d="M8 5V19" />
      {/* text lines */}
      <path d="M11 7H20" />
      <path d="M11 12H20" />
      <path d="M11 17H20" />
      {/* line numbers (1, 2, 3) */}
      <path d="M4 6.2V8.8" />
      <path d="M3.4 11.4H4.6V12.6H3.4V13.8H4.6" />
      <path d="M3.4 16.4H4.6V18.8H3.4" />
    </svg>
  )
})

LineNumbersIcon.displayName = "LineNumbersIcon"
