import { Chip, Typography } from "@material-tailwind/react";
import classNames from "classnames";
import { usePopularProductsQuery } from "../../services/analysisApi";
import { formatPrice } from "../../utils";
import ApiError from "./../shared/ApiError";
import Spinner2 from "./../shared/Spinner2";

const PopularProducts = ({ className, ...restProps }) => {
  const popularProductsResponse = usePopularProductsQuery({});

  return (
    <div
      className={classNames(
        "relative pl-sm rounded-xl space-y-md border border-neutral-200 bg-neutral-800 text-neutral-50",
        {
          [className ? className : ""]: className,
        }
      )}
      {...restProps}
    >
      <header className="w-full py-sm sticky -top-xs left-0 bg-inherit z-10">
        <Typography variant="h3" className="underline text-primary-900">
          Top 10 Products
        </Typography>
      </header>
      <ul className="w-full max-w-screen-sm list-none space-y-sm">
        {/* handle refeching */}
        <Spinner2
          open={
            popularProductsResponse.isFetching &&
            !popularProductsResponse.isLoading
          }
        />
        {/* handle loading */}
        {popularProductsResponse.isLoading && <Spinner2 center />}
        {/* handle error */}
        {popularProductsResponse.isError && (
          <ApiError error={popularProductsResponse.error} />
        )}
        {/* handle success */}
        {popularProductsResponse.isSuccess &&
          popularProductsResponse.data?.results.map((product) => (
            <li
              className="flex flex-row w-full rounded-xl border border-neutral-200  hover-effect"
              key={product.id}
            >
              <div className="flex-1 flex-shrink-0">
                <img
                  src={
                    product.icon
                      ? product.icon
                      : "/assets/images/product-default.jpg"
                  }
                  className="w-full aspect-square rounded-l-lg object-cover "
                />
              </div>
              <div className="flex-[3] px-sm py-xs">
                <div className="flex w-full items-center justify-between">
                  <Typography variant="paragraph">{product.name}</Typography>
                  <Chip
                    className="w-fit"
                    size="sm"
                    value={
                      <span className="lowercase">
                        {product.total_items} items
                      </span>
                    }
                    variant="ghost"
                    color="yellow"
                  />
                </div>
                <Typography variant="paragraph" className="font-bold">
                  {formatPrice(product.revenue)}
                </Typography>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default PopularProducts;
