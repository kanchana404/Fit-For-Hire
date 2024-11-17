import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
} & React.ComponentProps<"nav">;

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  ...props
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPages = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center mt-8 space-x-2", className)}
      {...props}
    >
      <PaginationPrevious
        onClick={handlePrevious}
        disabled={currentPage === 1}
      />
      <PaginationContent>
        {getPages().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
      <PaginationNext
        onClick={handleNext}
        disabled={currentPage === totalPages}
      />
    </nav>
  );
};
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex items-center space-x-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"button">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <button
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size,
      }),
      isActive && "bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90",
      !isActive && "hover:text-pink-500 transition-colors duration-200",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<"button">) => (
  <button
    aria-label="Go to previous page"
    disabled={disabled}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "icon",
      }),
      "hover:text-pink-500 transition-colors duration-200",
      "disabled:opacity-50",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-5 w-5" />
  </button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  disabled,
  ...props
}: React.ComponentProps<"button">) => (
  <button
    aria-label="Go to next page"
    disabled={disabled}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "icon",
      }),
      "hover:text-pink-500 transition-colors duration-200",
      "disabled:opacity-50",
      className
    )}
    {...props}
  >
    <ChevronRight className="h-5 w-5" />
  </button>
);
PaginationNext.displayName = "PaginationNext";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
};