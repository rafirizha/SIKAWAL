import * as React from "react";

import { cn } from "@/lib/utils";

export const selectBaseClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select className={cn(selectBaseClass, className)} ref={ref} {...props}>
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";

export { Select };
