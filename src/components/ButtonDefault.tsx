import { ButtonType } from '@/types/button'
import Link from 'next/link'

export const ButtonDefault: ButtonType = ({
  text,
  type,
  style = 'outDark',
  link = '',
  shadow,
  radius = 'rounded-2xl',
  paddingx = 'px-4', // Ajuste para aumentar o padding
  paddingy = 'py-2', // Ajuste para aumentar o padding
  tailwind,
  submit = false,
  disabled = false,
  onClick,
}) => {
  return (
    <>
      {type === 'button' && (
        <button
          className={`${style === 'outDark' && 'border-2 border-light-blue bg-white text-black hover:bg-blue'} ${style === 'light' && 'bg-white text-black hover:bg-light-blue hover:scale-105'} text-base font-medium transition-all active:outline active:outline-2 active:outline-light-blue900 ${shadow && 'shadow-clean shadow-light-gray250'} ${disabled && 'cursor-not-allowed'} ${radius && radius} ${tailwind && tailwind} ${paddingx} ${paddingy} inline-flex items-center justify-center`}
          typ-e={submit ? 'submit' : 'button'}
          disabled={disabled}
          onClick={onClick}
        >
          {text}
        </button>
      )}

      {type === 'link' && (
        <button
          type="button"
          disabled={disabled}
          className={`${style === 'outDark' && 'border-2 border-light-blue bg-white text-black hover:bg-blue'} ${style === 'light' && 'bg-white text-black hover:bg-light-blue hover:scale-105'} text-base font-medium transition-all active:outline active:outline-2 active:outline-light-blue900 ${shadow && 'shadow-clean shadow-light-gray250'} ${disabled && 'cursor-not-allowed'} ${radius && radius} ${tailwind && tailwind} ${paddingx} ${paddingy} inline-flex items-center justify-center`}
        >
          <Link href={link}>{text}</Link>
        </button>
      )}
    </>
  );
};