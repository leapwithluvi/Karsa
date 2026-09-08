export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    stack?: string;
    details?: Record<string, string[]>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
