import { Tooltip, Typography } from "@material-tailwind/react";
import { CiDiscount1 } from "react-icons/ci";
import { FcSalesPerformance } from "react-icons/fc";
import { GiCash, GiProfit } from "react-icons/gi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { RiRefund2Fill } from "react-icons/ri";
import config from "../../config";
import { formatNumber, formatPrice } from "../../utils";

const SaleMetrices = ({ metrices }) => {
  return (
    <section className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
      {/* total revenue */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              📈 Total Revenue
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatPrice(metrices?.total_sale_price || 0)}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <GiCash size={25} className="!text-neutral-200" />
            Total Revenue
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatPrice(
              metrices?.total_sale_price || 0,
              config.CURRENCY,
              true
            )}
          </p>
        </div>
      </Tooltip>
      {/* net revenue */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              💰 Net Revenue (After returns)
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatPrice(
                parseFloat(metrices?.total_sale_price || "0") -
                  parseFloat(metrices?.total_refund_price || "0")
              )}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            {/* <GiCash size={25} className="!text-neutral-200" />
            Net Revenue */}
            <span className="text-xl">💰</span> Net Revenue
          </Typography>
          <p className="text-lg font-bold text-secondary-900 underline">
            {formatPrice(
              parseFloat(metrices?.total_sale_price || "0") -
                parseFloat(metrices?.total_refund_price || "0"),
              config.CURRENCY,
              true
            )}
          </p>
        </div>
      </Tooltip>
      {/* total sale items */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Total Sold Items
            </Typography>
            <Typography
              variant="paragraph"
              className="text-secondary-800 space-x-xs"
            >
              {formatNumber(metrices?.total_sale_items || 0) + " items"}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <FcSalesPerformance
              color="blue"
              size={25}
              className="!text-neutral-200"
            />
            Total Sold Items
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatNumber(metrices?.total_sale_items || "") + " items"}
          </p>
        </div>
      </Tooltip>
      {/* net sale items */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Net Sold Items
            </Typography>
            <Typography
              variant="paragraph"
              className="text-secondary-800 space-x-xs"
            >
              {formatNumber(metrices?.total_sale_items || 0) + " items"}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <FcSalesPerformance size={25} className="!text-neutral-200" /> Net
            Sold Items
          </Typography>
          <p className="text-lg font-bold text-secondary-900 underline">
            {formatNumber(
              parseFloat(metrices?.total_sale_items || "0") -
                parseFloat(metrices?.total_refund_items || "0")
            ) + " items"}
          </p>
        </div>
      </Tooltip>
      {/* total discount */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Total Discount.
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatPrice(metrices?.total_discount || 0)}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <CiDiscount1 size={25} className="!text-neutral-200" /> Total
            Discount
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatPrice(metrices?.total_discount || 0, config.CURRENCY, true)}
          </p>
        </div>
      </Tooltip>
      {/* total profit */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Total Profit.
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatPrice(metrices?.total_profit || 0)}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <GiProfit size={25} className="!text-neutral-200" /> Total Profit
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatPrice(metrices?.total_profit || 0, config.CURRENCY, true)}
          </p>
        </div>
      </Tooltip>
      {/* total return items */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Total Return Products.
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatNumber(metrices?.total_refund_items || 0) + " items"}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <HiOutlineReceiptRefund size={25} className="!text-neutral-200" />
            Total Return Items
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatNumber(metrices?.total_refund_items || 0, true)} items
          </p>
        </div>
      </Tooltip>
      {/* total refund price */}
      <Tooltip
        placement="bottom"
        className="bg-white border border-neutral-200 shadow-sm shadow-neutral-600"
        content={
          <div className="bg-white">
            <Typography variant="paragraph" className="text-primary-800">
              Total Refund.
            </Typography>
            <Typography variant="paragraph" className="text-secondary-800">
              {formatPrice(metrices?.total_refund_price || 0)}
            </Typography>
          </div>
        }
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-sm">
          <Typography
            variant="small"
            className="flex items-baseline gap-xs text-neutral-400 "
          >
            <RiRefund2Fill size={25} className="!text-neutral-200" /> Total
            Refund
          </Typography>
          <p className="text-lg font-bold text-neutral-100">
            {formatPrice(
              metrices?.total_refund_price || 0,
              config.CURRENCY,
              true
            )}
          </p>
        </div>
      </Tooltip>
    </section>
  );
};

export default SaleMetrices;
