export interface TErrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errorSource: TErrorSources[];
  error?: unknown;
  stack?: string;
}
