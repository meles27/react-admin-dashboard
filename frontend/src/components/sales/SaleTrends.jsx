import { Typography } from "@material-tailwind/react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useSaleTrendsAnalysisQuery } from "../../services/analysisApi";
import ApiError from "../shared/ApiError";
import Spinner2 from "../shared/Spinner2";
import Spinner from "../shared/spinner/Spinner";

const SaleTrends = () => {
  const [searchParams] = useState({});
  const saleTrendsAnalysisResponse = useSaleTrendsAnalysisQuery(searchParams);

  return (
    <div className="w-full bg-neutral-800 text-neutral-100 p-sm space-y-sm rounded-xl border border-neutral-200">
      <div className="w-full flex justify-end"></div>
      <div className="flex w-full items-baseline justify-between pl-md">
        <Typography variant="h5" className="text-primary-900">
          Sale Analysis This Year
        </Typography>
      </div>
      {/* handle refeching */}
      <Spinner2
        open={
          saleTrendsAnalysisResponse.isFetching &&
          !saleTrendsAnalysisResponse.isLoading
        }
      />
      {/* handle loading */}
      {saleTrendsAnalysisResponse.isLoading && <Spinner center />}
      {/* handle error */}
      {saleTrendsAnalysisResponse.isError && (
        <ApiError
          error={saleTrendsAnalysisResponse.error}
          refresh={saleTrendsAnalysisResponse.refetch}
        />
      )}
      {/* handle success */}
      {saleTrendsAnalysisResponse.isSuccess && (
        <ResponsiveContainer className="!h-72">
          <AreaChart
            data={saleTrendsAnalysisResponse.data?.map((sale) => ({
              ...sale,
              week: format(sale.interval, "MMM"),
              revenue: Number(sale.revenue) / 1000,
            }))}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" />
            <YAxis />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SaleTrends;
