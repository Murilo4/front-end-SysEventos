export type HtmlInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'checkbox'
  | 'radio'
  | 'range'

export type InputProps = {
  type: HtmlInputType
  placeholder?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent) => void
  name: string
  image?: string
  tailwind?: string
  error?: string[]
  label?: string
  disable?: boolean
}

export type InputType = (props: InputProps) => JSX.Element

export type TextAreaProps = {
  placeholder?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  name: string
  tailwind?: string
  error?: string[]
  label?: string
  disable?: boolean
}

export type TextAreaType = (props: TextAreaProps) => JSX.Element