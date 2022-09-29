import { BetaJSPromise } from "./betajs";
import { TFFmpegSimpleOptions, TFFmpegSimpleProgress } from "./ffmpeg-simple"
import { TOpts } from "./opts";

export function ffmpeg_playlist(
    files: string | string[],
    options?: TFFmpegPlaylistOptions,
    output?: string,
    eventCallback?: (progress: TFFmpegSimpleProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TOpts
): BetaJSPromise<TFFmpegPlaylistReponse>;

export function ffmpeg_playlist_raw(
    files: string | string[],
    options?: TFFmpegPlaylistOptions,
    output?: string,
    eventCallback?: (progress: TFFmpegSimpleProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TOpts
): BetaJSPromise<TFFmpegPlaylistReponse>;

export type TFFmpegPlaylistReponse = {playlist: `${string}/playlist.m3u8`};

export type TFFmpegPlaylistOptions = TFFmpegSimpleOptions & {
    segment_target_duration?: number,
    max_bitrate_ratio?: number,
    rate_monitor_buffer_ratio?: number,
    key_frames_interval?: number,
    renditions: TRendition[]
};

export type TRendition = {
    resolution: `${number}x${number}`,
    bitrate: number,
    audio_rate: number
};
