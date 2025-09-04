import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getPlanOrderList, cancelOrder } from "@/services/contract";

// 条件委托接口
interface ConditionalCommission {
  id: string;
  contractId: number;
  symbol: string;
  type: "LIMIT" | "MARKET" | "CONDITIONAL";
  side: "BUY" | "SELL";
  triggerPrice: number;
  price: number;
  size: number;
  orderType: string;
  onlyReduce: boolean;
  createTime: number;
  expireTime: number;
}

interface UseConditionalCommissionOptions {
  contractId?: number;
}

export const useConditionalCommission = (
  options: UseConditionalCommissionOptions = {}
) => {
  const { contractId } = options;
  const [conditionalCommission, setConditionalCommission] = useState<
    ConditionalCommission[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 获取条件委托列表
  const getConditionalCommission = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取条件委托");
        const res = await getPlanOrderList({
          contractId: (overrideContractId ?? contractId)?.toString(),
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setConditionalCommission(res.data?.orderList || []);
        } else {
          message.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取条件委托失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 取消条件委托
  const handleCancelConditionalOrder = useCallback(
    async (record: ConditionalCommission) => {
      try {
        const params = {
          orderId: record.id,
          contractId: record.contractId,
          isConditionOrder: true,
        };
        const res = await cancelOrder(params);
        if (res.code === "0") {
          message.success(res.msg);
          // 刷新数据
          getConditionalCommission();
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error("取消条件委托失败:", error);
      }
    },
    [getConditionalCommission]
  );

  // 根据symbol过滤数据
  const getFilteredConditionalCommission = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return conditionalCommission;
      return conditionalCommission.filter(
        (item) => item.symbol === currentSymbol
      );
    },
    [conditionalCommission]
  );

  return {
    conditionalCommission,
    loading,
    getConditionalCommission,
    handleCancelConditionalOrder,
    getFilteredConditionalCommission,
  };
};

export type { ConditionalCommission };
