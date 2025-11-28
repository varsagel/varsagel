import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  min?: number
  max?: number
  step?: number
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value?.[0] || min)
    
    React.useEffect(() => {
      if (value) {
        setInternalValue(value[0])
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      setInternalValue(newValue)
      onValueChange?.([newValue])
    }

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue}
          onChange={handleChange}
          className="relative h-2 w-full flex-1 appearance-none rounded-full bg-secondary cursor-pointer"
          {...props}
        />
        <div 
          className="absolute h-2 rounded-full bg-primary" 
          style={{ width: `${((internalValue - min) / (max - min)) * 100}%` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }