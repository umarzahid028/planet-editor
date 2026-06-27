import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/planet-utils"
import { Separator } from "@/components/planet-ui-primitive/separator"
import "./button-group.scss"

const buttonGroupVariants = cva("planet-button-group", {
  variants: {
    orientation: {
      horizontal: "planet-button-group-horizontal",
      vertical: "planet-button-group-vertical",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="planet-button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      { className: cn("planet-button-group-text", className) },
      props
    ),
    render,
    state: { slot: "planet-button-group-text" },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="planet-button-group-separator"
      orientation={orientation}
      className={cn("planet-button-group-separator", className)}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
