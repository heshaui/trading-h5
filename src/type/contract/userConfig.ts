/**
 * 用户合约配置类型定义
 */
export interface UserConfigType {
  /** 用户ID */
  userId?: string | number;
  /** 合约状态 1:已开通 0:未开通 */
  contractStatus?: number;
  /** 是否启用合约交易 */
  isContractEnabled?: boolean;
  /** 杠杆倍数 */
  leverage?: number;
  /** 当前杠杆倍数 */
  nowLevel?: number;
  /** 保证金模式 1:逐仓 2:全仓 */
  marginMode?: number;
  /** 持仓模式 1:单向持仓 2:双向持仓 */
  positionMode?: number;
  /** 风险等级 */
  riskLevel?: number;
  /** 最大杠杆倍数 */
  maxLeverage?: number;
  /** 最小杠杆倍数 */
  minLeverage?: number;
  /** 可用保证金 */
  availableMargin?: number;
  /** 已用保证金 */
  usedMargin?: number;
  /** 总保证金 */
  totalMargin?: number;
  /** 未实现盈亏 */
  unrealizedPnl?: number;
  /** 已实现盈亏 */
  realizedPnl?: number;
  /** 手续费等级 */
  feeLevel?: number;
  /** 手续费率 */
  feeRate?: number;
  /** 创建时间 */
  createTime?: number;
  /** 更新时间 */
  updateTime?: number;
  /** 其他配置项 */
  [key: string]: any;
}

/**
 * 用户合约配置状态类型
 */
export interface UserConfigState {
  /** 用户合约配置数据 */
  userConfig: UserConfigType;
  /** 是否正在加载 */
  isLoadingUserConfig: boolean;
}

/**
 * 用户合约配置Hook返回类型
 */
export interface UseUserConfigReturn {
  /** 用户合约配置数据 */
  userConfig: UserConfigType;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 加载用户合约配置 */
  loadUserConfig: (params?: any) => Promise<UserConfigType>;
  /** 清除用户合约配置 */
  clearUserConfig: () => void;
  /** 检查用户是否已开通合约交易 */
  isContractEnabled: () => boolean;
  /** 获取用户合约配置的特定字段 */
  getConfigValue: (key: string, defaultValue?: any) => any;
} 