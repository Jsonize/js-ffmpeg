import { BetaJSPromise } from "./betajs";
import { TFFmpegProgress } from "./ffmpeg";

export function ffmpeg_multi_pass(
    files: string | string[],
    options?: string[],
    passes?: number,
    output?: string,
    eventCallback?: (progress: TFFmpegProgress) => unknown,
    eventContext?: Record<string, unknown>
): BetaJSPromise<void>;
