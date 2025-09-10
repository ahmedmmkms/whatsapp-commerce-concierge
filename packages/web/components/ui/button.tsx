import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'btn'
  const v = variant === 'outline' ? 'btn-outline' : 'btn-primary'
  return <button className={`${base} ${v} ${className}`} {...props} />
}

