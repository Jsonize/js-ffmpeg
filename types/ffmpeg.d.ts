import { BetaJSPromise } from "./betajs";
import { TFFmpegOpts } from "./opts";

export function ffmpeg(
    files: string | string[],
    options?: string[],
    output?: string,
    eventCallback?: (progress: TFFmpegProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TFFmpegOpts
): BetaJSPromise<void>;

export type TFFmpegProgress = {
    // TODO
};
