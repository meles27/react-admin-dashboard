import { useState } from "react";
import { useDispatch } from "react-redux";
import { analysisApi, useSaleAnalysisQuery } from "../../services/analysisApi";
import ApiError from "../shared/ApiError";
import RefetchApiCatchButton from "../shared/RefetchApiCatchButton";
import Spinner from "./../shared/spinner/Spinner";
import Spinner2 from "./../shared/Spinner2";
import PopularProducts from "./PopularProducts";
import SaleMetrices from "./SaleMetrices";
import SalePerAgent from "./SalePerAgent";
import SaleTrends from "./SaleTrends";

const SaleAnalysis = () => {
  const [searchParams] = useState({});
  const saleAnalysisResponse = useSaleAnalysisQuery(searchParams);
  const dispatch = useDispatch();
  console.log(saleAnalysisResponse.data);
  return (
    <div className="flex flex-col w-full p-sm gap-lg bg-inherit text-gray-100 bg-gray-800">
      {/* filter and search */}
      <section className="flex flex-col w-full gap-md lg:flex-row lg:justify-between">
        {/* hero section */}
        <div className="max-w-screen-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Sales analysis overview
          </h1>
          <p className="mt-1 text-sm text-gray-100">
            Gain insights into your sales performance and profit metrics over a
            specified period. Analyze trends, revenue, and more to make informed
            decisions.
          </p>
        </div>
      </section>
      {/* handle refeching */}
      <Spinner2
        open={
          saleAnalysisResponse.isFetching && !saleAnalysisResponse.isLoading
        }
      />
      {/* handle loading */}
      {saleAnalysisResponse.isLoading && <Spinner center />}
      {/* handle error */}
      {saleAnalysisResponse.isError && (
        <ApiError
          error={saleAnalysisResponse.error}
          refresh={saleAnalysisResponse.refetch}
        />
      )}
      {/* handle success */}
      {saleAnalysisResponse.isSuccess && (
        <>
          <SaleMetrices metrices={saleAnalysisResponse.data?.general_sales} />
          <SalePerAgent
            salePerAgents={saleAnalysisResponse.data?.per_saleAgent_sales}
          />
          <section className="flex flex-col w-full gap-sm md:flex-row">
            <SaleTrends />
            <PopularProducts
              className="max-h-96 overflow-y-hidden hover:overflow-y-auto"
              style={{ scrollbarGutter: "stable" }}
            />
          </section>
        </>
      )}

      <RefetchApiCatchButton
        callback={() => {
          dispatch(analysisApi.util.resetApiState());
          saleAnalysisResponse.refetch();
        }}
        wait={saleAnalysisResponse.isFetching}
      />
    </div>
  );
};

export default SaleAnalysis;
