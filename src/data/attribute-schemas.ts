export type AttrField = {
  label: string
  key?: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'range-number' | 'multiselect'
  options?: string[]
  minKey?: string
  maxKey?: string
  required?: boolean
  minLabel?: string
  maxLabel?: string
  min?: number
  max?: number
}

export const ATTR_SCHEMAS: Record<string, AttrField[]> = {};
