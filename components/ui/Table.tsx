import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={`w-full border-collapse text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ children, className = '', ...props }, ref) => (
    <thead ref={ref} className={`bg-gray-100 border-b-2 border-gray-300 ${className}`} {...props}>
      {children}
    </thead>
  )
);

TableHead.displayName = 'TableHead';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => (
    <tbody ref={ref} className={`${className}`} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isHeader?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, isHeader = false, className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        border-b border-gray-200 hover:bg-gray-50 transition-colors
        ${isHeader ? 'bg-gray-100' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  isHeader?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, isHeader = false, className = '', ...props }, ref) => {
    const Tag = isHeader ? 'th' : 'td';
    return (
      <Tag
        ref={ref as any}
        className={`
          px-4 py-3 text-left
          ${isHeader ? 'font-semibold text-gray-700' : 'text-gray-600'}
          ${className}
        `}
        {...(props as any)}
      >
        {children}
      </Tag>
    );
  }
);

TableCell.displayName = 'TableCell';
