import React from 'react';
import { BFButton } from './BF-Button';
import { BFIcons } from './BF-Icons';

interface BFPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showInfo?: boolean;
  'data-test'?: string;
}

export const BFPagination: React.FC<BFPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5,
  showInfo = true,
  'data-test': dataTest = 'bf-pagination',
}) => {
  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): number[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = currentPage - halfVisible;
    let endPage = currentPage + halfVisible;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-border gap-3"
      data-test={dataTest}
    >
      {showInfo && (
        <p className="text-sm text-muted-foreground hidden md:block">
          Mostrando {startItem} até {endItem} de {totalItems} itens
        </p>
      )}

      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
        <BFButton
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={<BFIcons.ChevronLeft size={16} />}
          className="whitespace-nowrap flex-shrink-0"
          data-test={`${dataTest}-previous`}
        >
          <span className="hidden sm:inline">Anterior</span>
        </BFButton>

        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 rounded-md text-sm transition-colors bg-card border border-border hover:bg-accent text-foreground min-w-[36px]"
                data-test={`${dataTest}-page-1`}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-3 py-1 rounded-md text-sm transition-colors min-w-[36px] ${currentPage === pageNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-accent text-foreground'
                }`}
              data-test={`${dataTest}-page-${pageNumber}`}
            >
              {pageNumber}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 rounded-md text-sm transition-colors bg-card border border-border hover:bg-accent text-foreground min-w-[36px]"
                data-test={`${dataTest}-page-${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <BFButton
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="whitespace-nowrap flex-shrink-0"
          data-test={`${dataTest}-next`}
        >
          <span className="inline-flex items-center gap-1">
            <span className="hidden sm:inline">Próxima</span>
            <BFIcons.ChevronRight size={16} />
          </span>
        </BFButton>
      </div>
    </div>
  );
};
