import { motion } from "framer-motion";
import { useState } from "react";
import { useListUsersQuery } from "../../services/userApi";
import ApiError from "../shared/ApiError";
import RefetchApiCatchButton from "./../shared/RefetchApiCatchButton";
import Spinner from "./../shared/spinner/Spinner";
import Spinner2 from "./../shared/Spinner2";
import SearchInput from "./../ui/SearchInput";
const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const listUsersResponse = useListUsersQuery({
    search: searchTerm,
  });

  return (
    <>
      {listUsersResponse.isFetching && (
        <Spinner2
          open={listUsersResponse.isFetching && !listUsersResponse.isLoading}
        />
      )}
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Users</h2>
          <SearchInput
            className="text-black"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {listUsersResponse.isLoading && <Spinner center />}
          {listUsersResponse.isError && (
            <ApiError
              error={listUsersResponse.error}
              refresh={listUsersResponse.refetch}
            />
          )}
          {listUsersResponse.isSuccess && (
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {listUsersResponse.data.results.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {user.firstName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-100">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {user.active ? "Active" : "InActive"}
                      </span>
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </td> */}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <RefetchApiCatchButton
          callback={listUsersResponse.refetch}
          wait={listUsersResponse.isFetching}
        />
      </motion.div>
    </>
  );
};
export default UsersTable;
