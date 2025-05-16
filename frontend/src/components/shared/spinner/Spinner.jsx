import classNames from "classnames";
import "./spinner.css";

const Spinner = (props = { center: true }) => {
  return (
    <div
      className={classNames("flex items-center justify-center", {
        "w-full h-full min-h-96": props.center,
        [props.className || ""]: props.className,
      })}
    >
      <section className="dots-container">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </section>
    </div>
  );
};

export default Spinner;
