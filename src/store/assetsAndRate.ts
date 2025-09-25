import appStore from "@/store";
import WebSocketService, { ConnectionState } from "@/utils/websocket";
import { getToken } from "@/request";

class AssetsAndRateWSManager {
  private ws: WebSocketService | null = null;
  private userId: string | number | null = null;
  private attempts: number = 0;
  private retryTimer: NodeJS.Timeout | null = null;
  private readonly maxReconnect: number = 10;

  ensure(userId?: string | number) {
    if (!userId) return;
    if (this.ws && this.ws.connectionState !== ConnectionState.CLOSED) return;
    this.userId = userId;
    this.connect();
  }

  stop() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  private connect() {
    const token = getToken();
    const base = process.env.REACT_APP_ASSETS_API_BASE;
    if (!this.userId || !token || !base) return;

    const url = `${base}/ws/asset?userId=${this.userId}&sa-token=${token}`;
    const ws = new WebSocketService(url);
    this.ws = ws;

    (ws as any).setOnConnectedCallback?.(() => {
      this.attempts = 0;
    });

    ws.connect(this.onMessage, this.onError);
  }

  private onMessage = (message: string) => {
    try {
      // 任意消息到达视为已连通
      this.attempts = 0;

      if (typeof message === "string" && (message.startsWith("ping") || message === "__ping__")) {
        this.ws?.send(JSON.stringify({ type: "__pong__" }));
        return;
      }
      const res: any = JSON.parse(message);
      if (res?.type === "__ping__") {
        this.ws?.send(JSON.stringify({ type: "__pong__" }));
        return;
      }

      if (Array.isArray(res?.data) && res?.eventType === "Assets") {
        appStore.setAssetData(res.data);
      }

      if (res?.data && res?.eventType === "Rate") {
        const rates = res.data?.rates;
        if (rates && typeof rates === "object") {
          const newData = Object.keys(rates).map((key: any) => ({
            coinSymbol: key,
            baseSymbol: "USDT",
            price: rates[key] || 0,
          }));
          appStore.setCoinRateData(newData);
        } else {
          appStore.setCoinRateData(res.data);
        }
      }
    } catch (e) {
      console.error("Assets/Rate WS message error:", e);
    }
  };

  private onError = (err: any) => {
    console.error("Assets WS error:", err);
    this.ws = null;

    if (this.attempts >= this.maxReconnect) {
      console.warn(`资产WS重连已达上限(${this.maxReconnect})，停止重连`);
      return;
    }

    this.attempts += 1;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.retryTimer = setTimeout(() => {
      try { this.connect(); } catch {}
    }, 3000);
  };
}

const assetsAndRateWS = new AssetsAndRateWSManager();
export default assetsAndRateWS;


