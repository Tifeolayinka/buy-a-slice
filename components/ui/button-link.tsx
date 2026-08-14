import Link from "next/link"
import { type VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Base UI's Button expects a native <button> under `render`; an <a> has its
// own semantics (open-in-new-tab, middle-click) that a role="button" wrapper
// would break. Style the Link directly with the same variants instead.
function ButtonLink({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { ButtonLink }
