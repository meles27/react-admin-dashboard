import classNames from "classnames";

const Spinner2 = (props) => {
  return (
    <>
      <div
        className={classNames(
          "fixed top-0 left-0 z-10 w-full transform duration-300",
          {
            flex: props.open,
            hidden: !props.open,
          }
        )}
      >
        <div className="w-full">
          <div className="h-2 w-full bg-primary-200 overflow-hidden">
            <div className="animate-progress origin-left w-full h-full bg-primary left-right"></div>
          </div>
        </div>
      </div>
      <div
        className={classNames(
          "fixed bottom-sm left-0 w-full transform duration-300 sm:bottom-0 lg:hidden",
          {
            flex: props.open,
            hidden: !props.open,
          }
        )}
      >
        <div className="w-full">
          <div className="h-2 w-full bg-primary-200 overflow-hidden">
            <div className="animate-progress origin-left w-full h-full bg-primary left-right"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Spinner2;
