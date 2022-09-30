import { BetaJSPromise } from "./betajs";
import { TFFmpegOpts } from "./opts";

export function ffmpeg_volume_detect(
    file: string,
    options?: TFFmpegOpts
): BetaJSPromise<TFFmpegVolumeDetectResponse>;

export type TFFmpegVolumeDetectResponse = {
    mean_volume: number,
    max_volume: number
};
