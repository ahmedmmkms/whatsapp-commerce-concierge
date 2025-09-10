import * as React from 'react'

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />
}

export function CardBody({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card-body ${className}`} {...props} />
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`card-title ${className}`} {...props} />
}

export function CardSubtitle({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`card-subtitle ${className}`} {...props} />
}

