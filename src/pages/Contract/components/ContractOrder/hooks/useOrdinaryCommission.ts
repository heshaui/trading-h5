import { useState, useCallback } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { getCurrentOrderList, cancelOrder } from "@/services/contract";
import { Side, PositionType, Type, Open, Status } from "../configs/columns";

// 普通委托接口
interface OrdinaryCommission {
  symbol: string;
  pricePrecision: number;
  side: Side;
  positionType: PositionType;
  avgPrice: number;
  tradeFee: number;
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

interface UseOrdinaryCommissionOptions {
  contractId?: number;
}

export const useOrdinaryCommission = (
  options: UseOrdinaryCommissionOptions = {}
) => {
  const { contractId } = options;
  const [ordinaryCommission, setOrdinaryCommission] = useState<
    OrdinaryCommission[]
  >([]);
  const [ordinaryCommissionNumber, setOrdinaryCommissionNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  // 获取普通委托列表
  const getOrdinaryCommission = useCallback(
    async (overrideContractId?: number) => {
      try {
        setLoading(true);
        console.log("获取普通委托(当前委托)");
        const { code, data, msg } = await getCurrentOrderList({
          contractId: overrideContractId ?? contractId,
          uaTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        if (code === "0") {
          setOrdinaryCommission(data.orderList);
          setOrdinaryCommissionNumber(data.count);
        } else {
          message.error(msg);
        }
      } catch (error) {
        console.error("获取普通委托失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [contractId]
  );

  // 取消普通委托
  const handleCancelOrdinaryOrder = useCallback(
    async (record: OrdinaryCommission) => {
      try {
        const params = {
          orderId: record.id,
          contractId: record.contractId,
          isConditionOrder: false,
        };
        const res = await cancelOrder(params);
        if (res.code === "0") {
          message.success(res.msg);
          // 刷新数据
          getOrdinaryCommission();
        } else {
          message.error(res.msg);
        }
      } catch (error) {
        console.error("取消普通委托失败:", error);
      }
    },
    [getOrdinaryCommission]
  );

  // 根据symbol过滤数据
  const getFilteredOrdinaryCommission = useCallback(
    (currentSymbol?: string, onlyCurrentSymbol?: boolean) => {
      if (!onlyCurrentSymbol || !currentSymbol) return ordinaryCommission;
      return ordinaryCommission.filter((item) => item.symbol === currentSymbol);
    },
    [ordinaryCommission]
  );

  return {
    ordinaryCommission,
    ordinaryCommissionNumber,
    loading,
    getOrdinaryCommission,
    handleCancelOrdinaryOrder,
    getFilteredOrdinaryCommission,
  };
};

export type { OrdinaryCommission };
