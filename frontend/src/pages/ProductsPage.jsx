import { motion } from "framer-motion";

import Header from "../components/common/Header";

import ProductsTable from "../components/products/ProductsTable";
import { Typography } from "@material-tailwind/react";

const ProductsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Products" />

      <main className="max-w-7xl mx-auto py-6 px-4 space-y-lg lg:px-8">
        {/* STATS */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div>
            <Typography variant="h4"> Product Listings</Typography>
            <Typography variant="paragraph" className="text-gray-300">
              View and manage all products in your inventory. Add, edit, or
              remove products.
            </Typography>
          </div>
        </motion.div>

        <ProductsTable />
      </main>
    </div>
  );
};
export default ProductsPage;
