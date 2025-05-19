import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import config from "../../config";
import { useListProductVariantQuery } from "../../services/productVariantApi";
import { formatPrice } from "../../utils";
import Pagination from "../Pagination";
import ApiError from "../shared/ApiError";
import Spinner2 from "../shared/Spinner2";
import Spinner from "../shared/spinner/Spinner";
import SearchInput from "../ui/SearchInput";

const ProductsTable = () => {
  const [searchParams, setSearchParams] = useState({
    search: "",
    limit: config.PAGE_SIZE,
    offset: 0,
  });
  const listVariantsResponse = useListProductVariantQuery(searchParams);

  const paginationRef = useRef(null);

  useEffect(() => {
    if (listVariantsResponse.isError) {
      console.log(listVariantsResponse.error?.data.detail);
    }

    if (listVariantsResponse.isSuccess) {
      console.log(listVariantsResponse.data);
    }
  }, [
    listVariantsResponse.isError,
    listVariantsResponse.isSuccess,
    listVariantsResponse.data,
    listVariantsResponse.error,
  ]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Product List</h2>
        <div className="relative">
          <SearchInput
            onChange={(e) =>
              setSearchParams((state) => ({
                ...state,
                search: e.target.value,
              }))
            }
            className="text-black"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-96">
        {listVariantsResponse.isFetching && (
          <Spinner2
            open={
              listVariantsResponse.isFetching && !listVariantsResponse.isLoading
            }
          />
        )}
        {listVariantsResponse.isLoading && <Spinner center />}
        {listVariantsResponse.isError && (
          <ApiError
            error={listVariantsResponse.error}
            refresh={listVariantsResponse.refetch}
          />
        )}
        {listVariantsResponse.isSuccess && (
          <table className="min-w-full divide-y divide-gray-700 ">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {listVariantsResponse.data?.results.map((variant) => (
                <motion.tr
                  key={variant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                    <img
                      src={
                        variant.images.length
                          ? config.IMAGES_URL.replace(
                              "${path}",
                              variant.images[0]
                            )
                          : variant?.product?.image
                          ? config.IMAGES_URL.replace(
                              "${path}",
                              variant?.product?.image
                            )
                          : "/assets/images/product-default.jpg"
                      }
                      alt="Product img"
                      className="size-10 rounded-full"
                    />
                    {variant.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {variant?.product?.category.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPrice(variant.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {variant.inventory.available}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </td> */}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* { next, previous, totalItems, pageSize, activePage = 0 } */}
      <Pagination
        ref={paginationRef}
        totalItems={listVariantsResponse.data?.count || 0}
        pageSize={config.PAGE_SIZE}
        previous={(value) =>
          setSearchParams((state) => ({
            ...state,
            offset: value.offset,
            limit: value.limit,
          }))
        }
        next={(value) =>
          setSearchParams((state) => ({
            ...state,
            offset: value.offset,
            limit: value.limit,
          }))
        }
      />
    </motion.div>
  );
};
export default ProductsTable;
