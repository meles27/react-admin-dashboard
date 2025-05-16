import { Tooltip, Typography } from "@material-tailwind/react";
import { motion, useMotionValue } from "framer-motion";
import { BiRefresh } from "react-icons/bi";

const RefetchApiCatchButton = (props) => {
  const y = useMotionValue(0);
  const handleCallback = async () => {
    if (!props.wait) {
      if (props.callback instanceof Promise) {
        await props.callback();
      } else {
        props.callback();
      }
    }
  };
  return (
    <Tooltip
      placement="bottom"
      className="bg-white text-primary-950 border border-primary-400 z-[10000]"
      content={<Typography variant="h6">Refresh</Typography>}
    >
      <motion.button
        drag="y"
        dragConstraints={{ top: -200, bottom: 0 }}
        style={{ y }}
        whileDrag={{
          scale: 1.05,
          boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-xl translate-y-1/2 right-sm z-[100000] rounded-xl border border-primary hover:scale-105 hover:bg-primary-50 hover:border-secondary active:scale-95"
        onClick={handleCallback}
        color="blue"
      >
        <BiRefresh
          className="animate-spin ease-linear hover:-rotate-180 hover:!text-secondary-950  hover:duration-300"
          size={40}
        />
      </motion.button>
    </Tooltip>
  );
};

export default RefetchApiCatchButton;
