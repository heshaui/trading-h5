import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { createOrder, getAssetsList } from "@/services/contract";
import { Side, PositionType } from "../configs/columns";

// 仓位接口
interface Position {
  id: number; // 仓位ID
  contractId: number; // 合约ID
  contractName: string; // 合约名称
  symbol: string; // 合约符号
  positionVolume: number; // 仓位数量
  canCloseVolume: number; // 可平仓数量
  openAvgPrice: number; // 开仓均价
  indexPrice: number; // 指数价格
  reducePrice: number; // 平仓均价
  holdAmount: number; // 持仓金额
  marginRate: number; // 保证金率
  realizedAmount: number; // 已实现盈亏
  returnRate: number; // 收益率
  orderSide: Side; // 订单方向
  positionType: PositionType; // 仓位类型
  canUseAmount: number; // 可用金额
  canSubMarginAmount: number; // 可减保证金金额
  openRealizedAmount: number; // 开仓已实现盈亏
  keepRate: number; // 维持保证金率
  maxFeeRate: number; // 最大手续费率
  unRealizedAmount: number; // 未实现盈亏
  leverageLevel: number; // 杠杆倍数
  positionBalance: number; // 仓位余额
}

interface UsePositionOptions {
  contractId?: number;
}

export interface QuickCloseParams {
  type: "market" | "limit";
  price?: number;
  volume?: number;
}

export const usePosition = (options: UsePositionOptions = {}) => {
  const { contractId } = options;
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [positionNumber, setPositionNumber] = useState(0);
  // 币对精度

  // 获取仓位数据
  const getPosition = useCallback(async () => {
    try {
      setLoading(true);
      console.log("获取仓位");
      const res = await getAssetsList({
        contractId: contractId,
        uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });
      if (res.code === "0") {
        setPositions(res.data.positionList);
        setPositionNumber(res.data.positionList.length);
      } else {
        setPositions([]);
        message.error(res.msg);
      }
    } catch (error) {
      console.error("获取仓位失败:", error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // 根据symbol过滤仓位数据
  const getFilteredPositions = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return positions;
      return positions.filter((item) => item.symbol === currentSymbol);
    },
    [positions]
  );

  // 快速平仓
  const quickClose = useCallback(
    // market: 市价平仓, limit: 限价平仓
    async (record: Position, params: QuickCloseParams) => {
      const { type, price, volume } = params;
      try {
        // 请输入数量
        if (!volume) {
          message.error("请输入数量");
          return;
        }

        // 请输入价格
        if (type === "limit" && !price) {
          message.error("请输入价格");
          return;
        }

        const params = {
          contractId: record.contractId, // 合约ID
          positionType: record.positionType, // 持仓类型(1 全仓，2 仓逐)
          side: record.orderSide === "SELL" ? "BUY" : "SELL", // 买卖方向（buy 买入，sell 卖出）
          leverageLevel: record.leverageLevel, // 杠杆倍数
          price: type === "market" ? 0 : price, // 平仓价格(市价单传0)
          volume, // 平仓数量
          open: "CLOSE", // 开平仓方向(open 开仓，close 平仓)
          type: type === "market" ? 2 : 1, // 订单类型 (1 limit， 2 market)
          triggerPrice: null, // 触发价格
          isConditionOrder: false, // 是否是条件单
        };
        const { code, msg } = await createOrder(params);
        if (code === "0") {
          message.success(msg);
          getPosition();
        } else {
          message.error(msg);
        }
      } catch (error) {
        console.error("快速平仓失败:", error);
      }
    },
    [getPosition]
  );

  return {
    positions,
    loading,
    positionNumber,
    getPosition,
    getFilteredPositions,
    quickClose,
  };
};

export type { Position };
