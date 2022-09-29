import { BetaJSPromise } from "./betajs";
import { TFFmpegSimpleOptions, TFFmpegSimpleProgress, TFFmpegSimpleResponse } from "./ffmpeg-simple";
import { TOpts } from "./opts";

export function ffmpeg_graceful(
    files: string | string[],
    options?: TFFmpegSimpleOptions,
    output?: string,
    eventCallback?: (progress: TFFmpegSimpleProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TOpts
): BetaJSPromise<TFFmpegSimpleResponse>;
