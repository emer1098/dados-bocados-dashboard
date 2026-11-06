import React from 'react'

export interface TableProps {
  headers: React.ReactNode[]
  children: React.ReactNode
  className?: string
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`living-table-wrap ${className}`}>
      <table className="living-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

