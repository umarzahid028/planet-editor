import { cn } from "@/lib/planet-utils"
import "@/components/planet-ui-primitive/input/input.scss"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="planet-input"
      className={cn("planet-input", className)}
      {...props}
    />
  )
}

export { Input }
