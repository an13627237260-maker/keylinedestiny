export class FortuneError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "FortuneError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof FortuneError) {
    return {
      success: false as const,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    success: false as const,
    error: {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "未知错误",
    },
  };
}
