export type ButtonProps = {
    text: string
    link?: string
    type: 'button' | 'link'
    style?: 'dark ' | 'outDark' | 'light' | 'outLight'
    radius?:
      | 'rounded-sm'
      | 'rounded'
      | 'rounded-md'
      | 'rounded-lg'
      | 'rounded-xl'
      | 'rounded-1xl'
      | 'rounded-2xl'
      | 'rounded-3xl'
      | 'rounded-full'
    paddingx?:
      | 'px-1'
      | 'px-2'
      | 'px-2'
      | 'px-3'
      | 'px-4'
      | 'px-5'
      | 'px-6'
      | 'px-7'
      | 'px-8'
      | 'px-9'
      | 'px-10'
      | 'px-16'
      | 'px-20'
    paddingy?:
      | 'py-1'
      | 'py-2'
      | 'py-2'
      | 'py-3'
      | 'py-4'
      | 'py-5'
      | 'py-6'
      | 'py-7'
      | 'py-8'
      | 'py-9'
      | 'py-10'
    shadow?: boolean
    tailwind?: string
    submit?: boolean
    disabled?: boolean
    onClick?: () => void
  }
  
  export type ButtonType = (props: ButtonProps) => JSX.Element