import { HtmlInputType } from './input'

export type InputFormType = {
  type: HtmlInputType
  placeholder?: string
  image?: string
  name: string
  label?: string
  disable?: boolean
}