import React from "react";
import { Button, Tooltip } from "antd";
import { SvgIcon } from "@/components/icon";
import dayjs from "dayjs";
import BigNumber from "bignumber.js"; 
// 方向枚举
export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}
// 仓位类型枚举
export enum PositionType {
  CROSS_MARGIN = 1, // 全仓
  ISOLATED_MARGIN = 2, // 逐仓
}
// 类型枚举
export enum Type {
  LIMIT = 1, // 限价单
  MARKET = 2, // 市价单
  POST_ONLY = 3, // PostOnly
  FORCE_LIQUIDATION = 4, // 强制减仓
  POSITION_MERGE = 5, // 仓位合并
}
// 开仓状态枚举
export enum Open {
  OPEN = "OPEN", // 开仓
  CLOSE = "CLOSE", // 平仓
}
// 状态枚举
export enum Status {
  PENDING = 0, // 待成交
  NEW_ORDER = 1, // 新订单
  FULLY_FILLED = 2, // 完全成交
  PARTIALLY_FILLED = 3, // 部分成交
  CANCELLED = 4, // 已取消
  CANCELLING = 5, // 待撤销
  ABNORMAL = 6, // 已废弃
  PARTIALLY_FILLED_AND_CANCELLED = 7, // 部分成交已撤销
}
// 角色枚举
export enum Role {
  MAKER = "maker",
  TAKER = "taker",
}

// 映射对象
export const PositionTypeMap = {
  [PositionType.CROSS_MARGIN]: "order.common.crossMargin",
  [PositionType.ISOLATED_MARGIN]: "order.common.isolatedMargin",
};

export const SideMap = {
  [Side.BUY]: "order.common.buy",
  [Side.SELL]: "order.common.sell",
};

export const TypeMap = {
  [Type.LIMIT]: "order.common.limit",
  [Type.MARKET]: "order.common.market",
  [Type.POST_ONLY]: "order.common.postOnly",
  [Type.FORCE_LIQUIDATION]: "order.common.forceLiquidation",
  [Type.POSITION_MERGE]: "order.common.positionMerge",
};

export const OpenMap = {
  [Open.OPEN]: "order.common.open",
  [Open.CLOSE]: "order.common.close",
};

export const StatusMap = {
  [Status.PENDING]: "order.common.pending",
  [Status.NEW_ORDER]: "order.common.newOrder",
  [Status.FULLY_FILLED]: "order.common.fullyFilled",
  [Status.PARTIALLY_FILLED]: "order.common.partiallyFilled",
  [Status.CANCELLED]: "order.common.cancelled",
  [Status.CANCELLING]: "order.common.cancelling",
  [Status.ABNORMAL]: "order.common.abnormal",
  [Status.PARTIALLY_FILLED_AND_CANCELLED]:
    "order.common.partiallyFilledAndCancelled",
};

export const RoleMap = {
  [Role.MAKER]: "Maker",
  [Role.TAKER]: "Taker",
};