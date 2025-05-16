import { Button } from "@material-tailwind/react";

const defaultErrorCallback = () => console.log("error");

const ApiError = (props) => {
  return (
    <section className="flex w-full h-full items-center justify-center bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
            {props.error?.status || 500}
          </h1>
          {!props.error?.status ? (
            <p className="mb-4 text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
              {/* {error?.data?.detail || "Internal Server Error."} */}
              Internal Server Error.
            </p>
          ) : props.error.status == 500 ? (
            <p className="mb-4 text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
              We are already working to solve the problem.
            </p>
          ) : (
            <p className="mb-4 text-2xl tracking-tight font-bold text-gray-900 dark:text-white">
              {props.error.data?.detail}
            </p>
          )}

          <Button
            onClick={() =>
              props.refresh ? props.refresh() : defaultErrorCallback()
            }
            variant="text"
            size="sm"
            className="text-primary underline text-2xl lowercase"
          >
            retry
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ApiError;
