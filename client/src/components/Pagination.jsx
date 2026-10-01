import { Button } from "@/components/ui/button";

// Previous / Next controls. `pagination` is the object returned by the API:
// { page, totalPages, total, ... }. Renders nothing when everything fits on one page.
const Pagination = ({ pagination, onPageChange, disabled = false }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages } = pagination;

    return (
        <div className="flex items-center justify-center gap-4 my-8">
            <Button variant="outline" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
                Previous
            </Button>
            <span className="text-sm">
                Page {page} of {totalPages}
            </span>
            <Button variant="outline" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
                Next
            </Button>
        </div>
    );
};

export default Pagination;
