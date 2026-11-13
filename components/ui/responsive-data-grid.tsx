'use client';

import * as React from 'react';

export interface ResponsiveColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (item: T, index: number) => React.ReactNode;
}

export interface ResponsiveDataGridProps<T> {
  items: T[];
  getRowKey: (item: T, index: number) => string;
  columns: ResponsiveColumn<T>[];
  renderMobileCard: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  ariaLabel?: string;
  testId?: string;
}

/**
 * Reusable Table-to-2-Column Mobile Card Grid Converter (`ResponsiveDataGrid` / `MobileCardTable`).
 *
 * STRICT MOBILE RULE:
 * - Below `md` (`< 768px`): Renders a compact, touch-friendly 2-column card grid (`grid grid-cols-2 gap-2.5`)
 *   with ZERO horizontal overflow and NO `<table>` rendering on mobile screens.
 * - On `md` and above (`>= 768px`): Renders a structured, semantic desktop table (`hidden md:block`).
 */
export function ResponsiveDataGrid<T>({
  items,
  getRowKey,
  columns,
  renderMobileCard,
  emptyMessage = 'Belum ada data tercatat.',
  ariaLabel = 'Tabel Data Responsif XII PPLG 1',
  testId,
}: ResponsiveDataGridProps<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-xs text-[#5B6073] dark:border-white/15 dark:text-[#A4AAC0]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div data-testid={testId} className="w-full overflow-x-hidden">
      {/* Mobile View (< md): Mandatory 2-Column Card Grid (`grid grid-cols-2 gap-2.5`) */}
      <div
        role="list"
        aria-label={`${ariaLabel} (Tampilan Kartu Mobile 2 Kolom)`}
        className="grid grid-cols-2 gap-2.5 md:hidden"
      >
        {items.map((item, idx) => (
          <div
            key={getRowKey(item, idx)}
            role="listitem"
            className="min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white/75 p-3 shadow-xs dark:border-white/10 dark:bg-white/5"
          >
            {renderMobileCard(item, idx)}
          </div>
        ))}
      </div>

      {/* Desktop View (md+): Semantic Structured Table */}
      <div className="hidden md:block">
        <table aria-label={ariaLabel} className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-black/10 font-mono text-[11px] uppercase text-[#5B6073] dark:border-white/10 dark:text-[#A4AAC0]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`pb-2.5 font-semibold ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {items.map((item, idx) => (
              <tr key={getRowKey(item, idx)} className="transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'pr-2 text-left'
                    }`}
                  >
                    {col.render(item, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const MobileCardTable = ResponsiveDataGrid;
