import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import useAuth from "../../hooks/useAuth";

const Logout = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    auth.logout(() => navigate(config.FRONTEND_PATHS.LOGOUT_REDIRECT));
    props.handler();
  };

  return (
    <Dialog open={props.open} size="xs" handler={props.handler}>
      <DialogHeader>Logout</DialogHeader>
      <DialogBody>
        <Typography className="text-neutral-900 font-bold">
          Are you shure you want to logout?
        </Typography>
      </DialogBody>
      <DialogFooter className="space-x-sm">
        <Button variant="outlined" color="blue" onClick={props.handler}>
          <span>Cancel</span>
        </Button>
        <Button color="red" onClick={handleLogout}>
          Yes, logout
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default Logout;
