import { request } from '@/request/index';
import { API_MODULE_NAME } from '@/config/apiConfig';

const fixUrl = `/${API_MODULE_NAME.AMBIT_ASSETS_WEB}`

// Type definition for request parameters
interface ConfigRequestParams {
  [key: string]: any; // This allows any properties but still provides type safety
}

interface TradeRequestParams {
  [key: string]: any; // This allows any properties but still provides type safety
}

interface RecordsRequestParams {
  [key: string]: any; // This allows any properties but still provides type safety
}

// /api/v1/trade_convert/config
// /api/v1/trade_convert/saveOrUpdateConfig
// /api/v1/trade_convert/trade
// /api/v1/trade_convert/records

export function getConfig(data: ConfigRequestParams): Promise<any> {
  return request(`${fixUrl}/assets-web/v1/trade_convert/config`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateConfig(data: ConfigRequestParams): Promise<any> {
  return request(`/assets-web/v1/trade_convert/saveOrUpdateConfig`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function trade(data: TradeRequestParams): Promise<any> {
  return request(`${fixUrl}/assets-web/v1/trade_convert/trade`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function records(data: RecordsRequestParams): Promise<any> {
  return request(`${fixUrl}/assets-web/v1/trade_convert/records`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}


export function getPrice(data: TradeRequestParams): Promise<any> {
  return request(`${fixUrl}/assets-web/v1/trade_convert/price/${data.send}/${data.receive}`, {
    method: 'GET'
  });
}

export function preTrade(data: TradeRequestParams): Promise<any> {
  return request(`${fixUrl}/assets-web/v1/trade_convert/pre_trade/${data.send}/${data.receive}`, {
    method: 'GET'
  });
}

