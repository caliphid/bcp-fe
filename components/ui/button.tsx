import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary-600 text-white shadow-md shadow-primary-500/30 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/40': variant === 'default',
            'bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:bg-rose-600': variant === 'destructive',
            'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm': variant === 'outline',
            'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'h-10 px-5 py-2': size === 'default',
            'h-9 rounded-lg px-4': size === 'sm',
            'h-12 rounded-xl px-8 text-base': size === 'lg',
            'h-10 w-10 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
