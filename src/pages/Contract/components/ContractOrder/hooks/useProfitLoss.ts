import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getHistoryPositionList } from "@/services/contract";
import { PositionType, Side } from "../configs/columns";

// 盈亏记录接口
interface TradeRecord {
  openAvgPrice: number; // 开仓均价
  positionType: PositionType; // 仓位类型
  realizedAmount: number; // 已实现盈亏
  positionVolume: number; // 仓位数量
  leverageLevel: number; // 杠杆倍数
  openPrice: number; // 开仓价格
  settleProfit: number; // 结算盈亏
  mtime: number; // 修改时间
  orderSide: Side; // 订单方向
  profitRealizedAmount: number; // 盈亏
  contractId: number; // 合约ID
  historyRealizedAmount: number; // 历史已实现盈亏
  ctime: number; // 创建时间
  id: number; // 仓位ID
  closePrice: number; // 平仓价格
}

interface UseProfitLossOptions {
  contractId?: number;
}

export const useProfitLoss = (options: UseProfitLossOptions = {}) => {
  const { contractId } = options;
  const [profitLoss, setProfitLoss] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取盈亏记录
  const getProfitLoss = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取盈亏记录");
        const res = await getHistoryPositionList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (res.code === "0") {
          setProfitLoss(res.data?.positionList || []);
        } else {
          message.error(res.msg);
        }
        console.log(res);
      } catch (error) {
        console.error("获取盈亏记录失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 根据symbol过滤数据
  const getFilteredProfitLoss = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return profitLoss;
      return profitLoss.filter((item) => item.contractId === contractId);
    },
    [profitLoss, contractId]
  );

  return {
    profitLoss,
    loading,
    getProfitLoss,
    getFilteredProfitLoss,
  };
};

export type { TradeRecord };
