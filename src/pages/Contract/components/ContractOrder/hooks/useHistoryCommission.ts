import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getHistoryOrderList } from "@/services/contract";
import { Side, PositionType, Type, Open, Status } from "../configs/columns";

// 历史委托接口
interface HistoryCommission {
  symbol: string;
  pricePrecision: number;
  side: Side;
  positionType: PositionType;
  avgPrice: number;
  tradeFee: number;
  realizedAmount: number;
  type: Type;
  mtime: number;
  volume: number;
  dealVolume: number;
  price: number;
  contractId: number;
  ctime: number;
  contractName: string;
  id: string;
  open: Open;
  status: Status;
}

interface UseHistoryCommissionOptions {
  contractId?: number;
}

export const useHistoryCommission = (
  options: UseHistoryCommissionOptions = {}
) => {
  const { contractId } = options;
  const [historyCommission, setHistoryCommission] = useState<
    HistoryCommission[]
  >([]);
  const [historyCommissionNumber, setHistoryCommissionNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取历史委托列表
  const getHistoryCommission = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取历史委托");
        const { code, data, msg } = await getHistoryOrderList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (code === "0") {
          setHistoryCommission(data.orderList);
          setHistoryCommissionNumber(data.count);
        } else {
          message.error(msg);
        }
      } catch (error) {
        console.error("获取历史委托失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 根据symbol过滤数据
  const getFilteredHistoryCommission = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return historyCommission;
      return historyCommission.filter((item) => item.symbol === currentSymbol);
    },
    [historyCommission]
  );

  return {
    historyCommission,
    historyCommissionNumber,
    loading,
    getHistoryCommission,
    getFilteredHistoryCommission,
  };
};

export type { HistoryCommission };
