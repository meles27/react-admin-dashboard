import { motion } from "framer-motion";
import { AlertTriangle, ShoppingBag, Users, Zap } from "lucide-react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import config from "../config";
import { useGeneralAnalysisQuery } from "../services/analysisApi";
import { formatNumber, formatPrice } from "../utils";
import ApiError from "./../components/shared/ApiError";
import Spinner2 from "./../components/shared/Spinner2";
import Spinner from "./../components/shared/spinner/Spinner";

const OverviewPage = () => {
  const generalAnalysisResponse = useGeneralAnalysisQuery();
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {generalAnalysisResponse.isFetching && (
          <Spinner2
            open={
              generalAnalysisResponse.isFetching &&
              !generalAnalysisResponse.isLoading
            }
          />
        )}
        {generalAnalysisResponse.isLoading && <Spinner center />}
        {generalAnalysisResponse.isError && (
          <ApiError
            error={generalAnalysisResponse.error}
            refresh={generalAnalysisResponse.refetch}
          />
        )}
        {generalAnalysisResponse.isSuccess && (
          <>
            {/* STATS */}
            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <StatCard
                name="Inventory Value"
                icon={ShoppingBag}
                value={formatPrice(
                  generalAnalysisResponse.data.total_price,
                  config.CURRENCY,
                  true
                )}
                color="#EC4899"
              />
              <StatCard
                name="Total Products"
                icon={Zap}
                value={formatNumber(
                  generalAnalysisResponse.data.total_items,
                  false
                )}
                color="#6366F1"
              />
              <StatCard
                name="Total Users"
                icon={Users}
                value={formatNumber(
                  generalAnalysisResponse.data.total_users || 0,
                  true
                )}
                color="#8B5CF6"
              />
              <StatCard
                name="Revenue"
                icon={ShoppingBag}
                value={formatNumber(
                  generalAnalysisResponse.data.total_items,
                  true
                )}
                color="#EC4899"
              />
              <StatCard
                name="Low Stock"
                icon={AlertTriangle}
                value={23}
                color="#F59E0B"
              />
            </motion.div>

            {/* CHARTS */}

            <div className="">
              {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
              <SalesOverviewChart
                sale_trend={generalAnalysisResponse.data.sale_trend}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};
export default OverviewPage;
