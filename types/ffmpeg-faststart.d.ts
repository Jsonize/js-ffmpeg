import { BetaJSPromise } from "./betajs";
import { TFFmpegOpts } from "./opts";
import { TFFmpegProgress } from "./ffmpeg";

export function ffmpeg_faststart(
    file: string | string[],
    output?: string,
    eventCallback?: (progress: TFFmpegProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TFFmpegOpts
): BetaJSPromise<void>;
