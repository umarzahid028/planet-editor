import { mergeAttributes } from "@/planet-core/react"
import PlanetHorizontalRule from "@/planet-core/extension-horizontal-rule"

export const HorizontalRule = PlanetHorizontalRule.extend({
  renderHTML() {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { "data-type": this.name }),
      ["hr"],
    ]
  },
})

export default HorizontalRule
