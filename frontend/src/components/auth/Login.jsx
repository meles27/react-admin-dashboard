import { ErrorMessage } from "@hookform/error-message";
import { Button, Typography } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import config from "../../config";
import { useApiResponseToast } from "../../hooks/useApiResponseToast";
import useAuth from "../../hooks/useAuth";
import { useJwtTokenMutation } from "../../services/authApi";
import HtmlInput from "../ui/HtmlInput";
import PasswordInput from "../ui/PasswordInput";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const form = useForm({ defaultValues: { username: "", password: "" } });
  const [searchParams] = useSearchParams(location.search);
  const [login, loginResponse] = useJwtTokenMutation();

  /**
   * jwt athorization and authentication
   */
  const auth = useAuth();
  /**
   * handle login submit
   */
  const onSubmit = (data) => {
    login({
      password: data.password,
      username: data.username,
    });
  };
  /**
   * handle error for login
   */
  useApiResponseToast(
    loginResponse.error,
    loginResponse.isError,
    loginResponse.isSuccess,
    {
      successMessage: "successfully logged in",
      successCallback: () => {
        auth.setJwtToken({
          access: loginResponse.data?.access || "",
          refresh: loginResponse.data?.refresh || "",
        });
        navigate(
          searchParams.get("from")
            ? searchParams.get("from") + location.hash
            : auth.isAllowedTo([config.USER_ROLE.admin])
            ? config.FRONTEND_PATHS.ADMIN_LOGIN_REDIRECT
            : auth.isAllowedTo([
                config.USER_ROLE.cashier,
                config.USER_ROLE.staff,
              ])
            ? config.FRONTEND_PATHS.STUFF_LOGIN_REDIRECT
            : config.FRONTEND_PATHS.USER_LOGIN_REDIRECT,
          {
            replace: true,
          }
        );
      },
    }
  );

  return (
    <>
      {auth.isAuthenticated() ? (
        <Navigate
          to={
            searchParams.get("from")
              ? searchParams.get("from") + location.hash
              : auth.isAllowedTo([config.USER_ROLE.ADMIN])
              ? config.FRONTEND_PATHS.ADMIN_LOGIN_REDIRECT
              : auth.isAllowedTo([
                  config.USER_ROLE.cashier,
                  config.USER_ROLE.staff,
                ])
              ? config.FRONTEND_PATHS.STUFF_LOGIN_REDIRECT
              : config.FRONTEND_PATHS.USER_LOGIN_REDIRECT
          }
          replace={true}
        />
      ) : (
        <div className="py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-primary-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
              <div className="max-w-md mx-auto">
                <div>
                  <h1 className="text-2xl font-semibold">Login</h1>
                </div>
                <div className="divide-y divide-gray-200">
                  <form
                    className="py-8 text-base leading-6 space-y-md text-gray-700 sm:text-lg sm:leading-7"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="space-y-xs">
                      <Typography variant="h6">Username</Typography>
                      <HtmlInput
                        placeholder="username ....."
                        className="w-full py-2"
                        {...form.register("username", {
                          required: "username is required",
                        })}
                      />
                    </div>

                    <ErrorMessage
                      errors={form.formState.errors}
                      name="username"
                    />

                    <div className="space-y-xs">
                      <span className="flex w-full items-baseline justify-between text-nowrap">
                        <Typography variant="h6">Password</Typography>
                        <Button
                          size="sm"
                          variant="text"
                          className="text-blue-500 underline text-sm hover:cursor-pointer"
                        >
                          Forget Password?
                        </Button>
                      </span>
                      <PasswordInput
                        className="w-full"
                        {...form.register("password", {
                          required: "password is required",
                        })}
                      />
                    </div>

                    <ErrorMessage
                      errors={form.formState.errors}
                      name="password"
                      render={({ message }) => <p>{message}</p>}
                    />
                    <div className="relative">
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        loading={loginResponse.isLoading}
                      >
                        Submit
                      </Button>
                    </div>
                    <p className="flex text-center text-sm text-primary-500 gap-sm">
                      Don&#x27;t have an account yet?
                      <a
                        href="#"
                        className="font-semibold underline hover:underline focus:text-primary-800 focus:outline-none"
                      >
                        Sign up
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
