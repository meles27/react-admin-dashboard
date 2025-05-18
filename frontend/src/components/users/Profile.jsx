import config from "../../config";
import useAuth from "../../hooks/useAuth";
import { useRetrieveUserQuery } from "../../services/userApi";
import ApiError from "../shared/ApiError";
import RefetchApiCatchButton from "../shared/RefetchApiCatchButton";
import Spinner from "../shared/spinner/Spinner";
import Spinner2 from "../shared/Spinner2";
const Profile = () => {
  const auth = useAuth();
  const retrieveUserResponse = useRetrieveUserQuery(auth.getUser()?.id || "");

  if (retrieveUserResponse.isLoading) {
    return <Spinner center />;
  }

  if (retrieveUserResponse.isError) {
    return (
      <ApiError
        error={retrieveUserResponse.error}
        refresh={retrieveUserResponse.refetch}
      />
    );
  }
  return (
    <div className="h-full bg-gray-800 p-8">
      <Spinner2
        open={
          retrieveUserResponse.isFetching && !retrieveUserResponse.isLoading
        }
      />
      <div className="bg-neutral-800 rounded-lg shadow-xl pb-8">
        <div className="w-full h-[250px]">
          <img
            src="/assets/images/profile-background.jpg"
            className="w-full h-full rounded-tl-lg rounded-tr-lg"
          />
        </div>
        <div className="flex flex-col items-center -mt-20">
          <img
            src={
              retrieveUserResponse.data?.image
                ? config.IMAGES_URL.replace(
                    "${path}",
                    retrieveUserResponse.data?.image
                  )
                : "/assets/images/user-default-96.png"
            }
            className="w-40 border-4 border-white rounded-full"
          />
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-2xl">
              {retrieveUserResponse.data?.firstName +
                " " +
                retrieveUserResponse.data?.lastName}
            </p>
            <span className="bg-blue-500 rounded-full p-1" title="Verified">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-100 h-2.5 w-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          </div>
          <p className="text-gray-200">{retrieveUserResponse.data?.role}</p>
          <p className="text-sm text-gray-500">Ethiopia, Tigray</p>
        </div>
      </div>
      <div className="my-4 flex flex-col 2xl:flex-row space-y-4 2xl:space-y-0 2xl:space-x-4">
        <div className="w-full flex flex-col 2xl:w-1/3">
          <div className="flex-1 bg-neutral-800 rounded-lg shadow-xl p-8">
            <h4 className="text-xl text-gray-200 font-bold">Personal Info</h4>
            <ul className="mt-2 text-gray-200">
              <li className="flex border-y py-2">
                <span className="font-bold w-24">Full name:</span>
                <span className="text-gray-200">
                  {retrieveUserResponse.data?.firstName +
                    " " +
                    retrieveUserResponse.data?.lastName}
                </span>
              </li>
              {/* <li className="flex border-b py-2">
                <span className="font-bold w-24">Birthday:</span>
                <span className="text-gray-200">24 Jul, 1991</span>
              </li> */}
              <li className="flex border-b py-2">
                <span className="font-bold w-24">Joined:</span>
                <span className="text-gray-200">
                  {retrieveUserResponse.data?.dateJoined}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">Mobile:</span>
                <span className="text-gray-200">
                  {retrieveUserResponse.data?.phone}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">Email:</span>
                <span className="text-gray-200">
                  {retrieveUserResponse.data?.email}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">Location:</span>
                <span className="text-gray-200">Ethiopia Tigray</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col w-full 2xl:w-2/3">
          <div className="flex-1 bg-neutral-800 rounded-lg shadow-xl p-8">
            <h4 className="text-xl text-gray-200 font-bold">About Me</h4>
            <p className="mt-2 text-gray-200"></p>
          </div>
          {/* Statistics */}
        </div>
        {/* refresh the page */}
        <RefetchApiCatchButton callback={retrieveUserResponse.refetch} />
      </div>
    </div>
  );
};

export default Profile;
