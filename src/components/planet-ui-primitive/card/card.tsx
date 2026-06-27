import { forwardRef } from "react"
import { cn } from "@/lib/planet-utils"
import "@/components/planet-ui-primitive/card/card.scss"

const Card = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("planet-card", className)} {...props} />
  }
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("planet-card-header", className)}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

const CardBody = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("planet-card-body", className)} {...props} />
    )
  }
)
CardBody.displayName = "CardBody"

const CardItemGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn("planet-card-item-group", className)}
      {...props}
    />
  )
})
CardItemGroup.displayName = "CardItemGroup"

const CardGroupLabel = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("planet-card-group-label", className)}
        {...props}
      />
    )
  }
)
CardGroupLabel.displayName = "CardGroupLabel"

const CardFooter = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("planet-card-footer", className)}
        {...props}
      />
    )
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardBody, CardItemGroup, CardGroupLabel }
