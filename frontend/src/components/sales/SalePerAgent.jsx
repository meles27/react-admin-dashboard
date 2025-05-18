import { Avatar, Typography } from "@material-tailwind/react";
import { formatNumber, formatPrice } from "../../utils";

const TABLE_HEAD = [
  "Agent",
  "Total Items",
  "Total Price",
  "Discounted",
  "Returned Items",
  "Return Value",
  "Net Price",
];

const SalePerAgent = (props) => {
  return (
    <div className="w-full space-y-sm rounded-xl border border-neutral-600 pt-md bg-neutral-800 text-neutral-100">
      <Typography variant="h5" className="underline px-sm">
        Total Sales Per Agent
      </Typography>
      <div className="w-full overflow-x-auto">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal text-neutral-100 leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.salePerAgents?.map((agentInfo) => {
              return (
                <tr
                  key={agentInfo.id}
                  className="border-none border-primary-400 hover:bg-neutral-600 active:bg-neutral-600"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={
                          agentInfo.image
                            ? agentInfo.image
                            : "/assets/images/user-default-96.png"
                        }
                        alt={agentInfo.firstName}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          className="font-normal text-neutral-100 space-x-xs"
                        >
                          <span> {agentInfo.firstName}</span>
                          <span>{agentInfo.lastName}</span>
                        </Typography>
                        <Typography
                          variant="small"
                          className="font-normal text-neutral-100 opacity-70"
                        >
                          {agentInfo.username}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {formatNumber(agentInfo.total_sale_items)} items
                  </td>

                  <td className="p-4">
                    {formatPrice(agentInfo.total_sale_price)}
                  </td>

                  <td className="p-4">
                    {formatPrice(agentInfo.total_discount)}
                  </td>

                  <td className="p-4">
                    {formatNumber(agentInfo.total_return_items)}
                  </td>

                  <td className="p-4">
                    {formatPrice(agentInfo.total_return_price)}
                  </td>

                  <td className="p-4 font-bold underline">
                    {formatPrice(
                      parseFloat(agentInfo.total_sale_price) -
                        parseFloat(agentInfo.total_return_price)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalePerAgent;
