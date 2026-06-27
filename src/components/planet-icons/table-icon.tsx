import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TableIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 4H20C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="2" />
      <path d="M3 14.5H21" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4V20" stroke="currentColor" strokeWidth="2" />
      <path d="M15 4V20" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
})

TableIcon.displayName = "TableIcon"
