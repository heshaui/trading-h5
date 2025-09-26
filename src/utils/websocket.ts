type MessageCallback = (message: string) => void;
type ErrorCallback = (error: Event) => void;
type CloseCallback = (event: CloseEvent, manual: boolean) => void;
type ConnectedCallback = () => void;

enum ConnectionState {
  CONNECTING,
  OPEN,
  CLOSED,
  RECONNECTING,
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private readonly maxReconnectAttempts: number;

  private reconnectAttempts: number = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private manualClose: boolean = false;

  private state: ConnectionState = ConnectionState.CLOSED;
  private messageCallback?: MessageCallback;
  private errorCallback?: ErrorCallback;
  private connectedCallback?: ConnectedCallback;
  private closeCallback?: CloseCallback;

  constructor(
    url: string,
    options: {
      maxReconnectAttempts?: number; // 最大重试次数，默认 Infinity
      headers?: Record<string, string>; // WebSocket 请求头
    } = {}
  ) {
    this.url = url;
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
    this.headers = options.headers;
  }

  private readonly headers?: Record<string, string>;

  connect(onMessage: MessageCallback, onError?: ErrorCallback): void {
    if (this.state !== ConnectionState.CLOSED) {
      console.warn(`连接已存在，当前状态: ${ConnectionState[this.state]}`);
      return;
    }

    this.messageCallback = onMessage;
    this.errorCallback = onError;
    this.state = ConnectionState.CONNECTING;
    // 每次主动发起连接，视为非手动关闭状态
    this.manualClose = false;

    try {
      // 直接创建 WebSocket 连接，请求头将由服务端代理处理
      this.socket = new WebSocket(this.url);
      // 设置二进制数据类型为arraybuffer，这样便于处理
      this.socket.binaryType = "arraybuffer";
    } catch (error) {
      console.error("WebSocket connection error:", error); /*  */
      this.state = ConnectionState.CLOSED;
      if (this.errorCallback) {
        const event = new Event("error");
        Object.defineProperty(event, "error", {
          value: new Error("Failed to establish WebSocket connection"),
        });
        this.errorCallback(event);
      }
    }
    this.setupEventListeners();
  }

  /**
   * 设置连接成功的回调函数
   * @param callback 连接成功时要执行的回调函数
   */
  setOnConnectedCallback(callback: ConnectedCallback): void {
    this.connectedCallback = callback;
  }

  /**
   * 设置关闭连接时的回调
   */
  setOnCloseCallback(callback: CloseCallback): void {
    this.closeCallback = callback;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.state = ConnectionState.OPEN;
      this.reconnectAttempts = 0;
      this.clearTimers();

      // 调用连接成功的回调函数
      if (this.connectedCallback) {
        this.connectedCallback();
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      if (this.messageCallback) {
        let messageData = event.data;

        // 如果是ArrayBuffer，需要检查是否为压缩数据
        if (messageData instanceof ArrayBuffer) {
          try {
            // 首先检查是否为gzip压缩数据（前两个字节是0x1f, 0x8b）
            const uint8Array = new Uint8Array(messageData);

            if (
              uint8Array.length >= 2 &&
              uint8Array[0] === 0x1f &&
              uint8Array[1] === 0x8b
            ) {
              // 这是gzip压缩数据，需要解压

              this.decompressData(uint8Array, "gzip")
                .then((decompressed) => {
                  this.messageCallback?.(decompressed);
                })
                .catch((error) => {
                  console.error("gzip解压失败:", error);
                  // 尝试直接解码
                  const decoder = new TextDecoder("utf-8");
                  messageData = decoder.decode(messageData);
                  this.messageCallback?.(messageData);
                });
              return;
            } else if (uint8Array.length >= 2 && uint8Array[0] === 0x78) {
              // 可能是deflate压缩数据 (zlib header: 0x78)

              this.decompressData(uint8Array, "deflate")
                .then((decompressed) => {
                  this.messageCallback?.(decompressed);
                })
                .catch((error) => {
                  console.error("deflate解压失败:", error);
                  // 尝试直接解码
                  const decoder = new TextDecoder("utf-8");
                  messageData = decoder.decode(messageData);
                  this.messageCallback?.(messageData);
                });
              return;
            } else {
              // 尝试不同的编码方式

              const encodings = ["utf-8", "latin1", "ascii"];
              let decoded = false;

              for (const encoding of encodings) {
                try {
                  const decoder = new TextDecoder(encoding);
                  const testDecode = decoder.decode(messageData);
                  // 简单检查是否包含JSON字符
                  if (testDecode.includes("{") || testDecode.includes("[")) {
                    console.log(`使用 ${encoding} 编码成功`);
                    messageData = testDecode;
                    decoded = true;
                    break;
                  }
                } catch (e) {
                  console.log(
                    `${encoding} 编码失败:`,
                    e instanceof Error ? e.message : String(e)
                  );
                }
              }

              if (!decoded) {
                console.log("所有编码方式都失败，使用默认UTF-8");
                const decoder = new TextDecoder("utf-8");
                messageData = decoder.decode(messageData);
              }
            }
          } catch (error) {
            console.error("处理ArrayBuffer失败:", error);
            // 如果解码失败，直接传递原始数据
            messageData = event.data;
          }
        }

        this.messageCallback?.(messageData);
      }
    };

    this.socket.onerror = (event: Event) => {
      this.errorCallback?.(event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      this.state = ConnectionState.CLOSED;
      this.clearTimers();
      this.socket = null;

      console.warn("WebSocket closed", {
        code: event.code,
        wasClean: event.wasClean,
        reason: event.reason,
        manual: this.manualClose,
      });
      // if (!event.wasClean  && this.shouldReconnect()) {
        // if (!event.wasClean && !this.manualClose && this.shouldReconnect()) {
      // 通知外部关闭事件
      if (this.closeCallback) {
        try { this.closeCallback(event, this.manualClose); } catch {}
      }

      if (!event.wasClean && !this.manualClose && this.shouldReconnect()) {
        this.handleReconnect();
      }
    };
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < this.maxReconnectAttempts;
  }

  private handleReconnect(): void {
    this.state = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`将在 ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连`);

    this.reconnectTimer = setTimeout(() => {
      if (this.messageCallback) {
        this.connect(this.messageCallback, this.errorCallback);
      }
    }, delay);
  }

  send(message: string): boolean {
    if (this.state === ConnectionState.OPEN && this.socket) {
      try {
        this.socket.send(message);
        return true;
      } catch (err) {
        console.error("消息发送失败:", err);
        return false;
      }
    }
    console.warn("消息发送失败: 连接未就绪");
    return false;
  }

  close(): void {
    this.manualClose = true;
    this.state = ConnectionState.CLOSED;
    this.clearTimers();
    this.socket?.close();
  }

  private clearTimers(): void {
    clearTimeout(this.reconnectTimer);
  }

  private async decompressData(
    data: Uint8Array,
    format: "gzip" | "deflate"
  ): Promise<string> {
    try {
      // 使用浏览器的压缩流API进行解压
      const stream = new Response(data).body;
      if (!stream) {
        throw new Error("无法创建流");
      }

      const decompressed = stream.pipeThrough(new DecompressionStream(format));
      const response = new Response(decompressed);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error(`使用DecompressionStream (${format}) 失败:`, error);

      // 如果浏览器不支持DecompressionStream，尝试使用pako库或其他方法
      throw new Error(
        `${format}解压失败，浏览器可能不支持DecompressionStream API`
      );
    }
  }

  get connectionState(): ConnectionState {
    return this.state;
  }
}

export default WebSocketService;
export { ConnectionState };
