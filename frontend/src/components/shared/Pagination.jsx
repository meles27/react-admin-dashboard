import { Button, Chip, Typography } from "@material-tailwind/react";
import { forwardRef, useImperativeHandle, useRef } from "react";

const Pagination = forwardRef(
  ({ next, previous, totalItems, pageSize, activePage = 0 }, ref) => {
    const totalPage = Math.ceil(Number(totalItems) / Number(pageSize));
    const activePageRef = useRef(
      activePage < totalPage && activePage >= 0 ? activePage : 0
    );

    const reset = () => {
      activePageRef.current = 0;
    };

    const prevPage = () => {
      if (activePageRef.current <= 0) return;
      activePageRef.current = activePageRef.current - 1;
    };
    // end of pagination

    const nextHandler = () => {
      if (typeof next == "function") {
        if (!(activePageRef.current === totalPage - 1)) {
          activePageRef.current = activePageRef.current + 1;
        }
        return next({
          offset: activePageRef.current * pageSize,
          limit: pageSize,
        });
      }
    };

    const previousHandler = () => {
      if (typeof previous == "function") {
        prevPage();
        return previous({
          offset: activePageRef.current * pageSize,
          limit: pageSize,
        });
      }
    };

    const getCurrentPage = () => {
      return activePageRef.current;
    };
    // leftup reset function to parent
    useImperativeHandle(ref, () => ({
      reset,
      getCurrentPage,
    }));

    if (totalItems <= 0 || pageSize > totalItems) {
      return <div className="hidden"></div>;
    }

    return (
      <div className="flex flex-1 w-full gap-2 items-end justify-between p-sm border border-neutral-100 shadow-sm bg-white rounded-xl">
        <Button
          variant="outlined"
          className="text-black"
          size="sm"
          color="blue"
          disabled={activePageRef.current == 0 ? true : false}
          onClick={previousHandler}
        >
          Previous
        </Button>

        <div className="flex flex-col items-start gap-xs sm:flex-row sm:items-center sm:gap-sm">
          <Chip
            variant="ghost"
            color="blue"
            size="sm"
            value={<span>{totalItems} items</span>}
          />
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {Number(activePageRef.current) + 1} of {totalPage}
          </Typography>
        </div>

        <Button
          className="text-black"
          variant="outlined"
          size="sm"
          color="blue"
          disabled={activePageRef.current == totalPage - 1 ? true : false}
          onClick={nextHandler}
        >
          Next
        </Button>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";
export default Pagination;
