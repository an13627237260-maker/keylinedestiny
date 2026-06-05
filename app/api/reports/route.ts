import { errorResponse } from "@/lib/api/response";
import { FortuneError } from "@/lib/fortune/shared/errors";

/** 历史报告已迁移至浏览器 localStorage，服务端不再持久化。 */
export async function GET() {
  return errorResponse(
    new FortuneError(
      "CLIENT_STORAGE_ONLY",
      "历史报告请在前端通过 localStorage 管理，无需服务端数据库。",
    ),
    410,
  );
}

export async function POST() {
  return errorResponse(
    new FortuneError(
      "CLIENT_STORAGE_ONLY",
      "请在前端测算完成后自动保存至 localStorage。",
    ),
    410,
  );
}
