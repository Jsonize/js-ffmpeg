import { BetaJSPromise } from "./betajs";
import { TFFProbeSimpleResponse } from "./ffprobe-simple";
import { TOpts } from "./opts";

export function ffmpeg_simple_raw(
    files: string | string[],
    options?: TFFmpegSimpleOptions,
    output?: string,
    eventCallback?: (progress: TFFmpegSimpleProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TOpts
): BetaJSPromise<TFFmpegSimpleResponse>;

export function ffmpeg_simple(
    files: string | string[],
    options?: TFFmpegSimpleOptions,
    output?: string,
    eventCallback?: (progress: TFFmpegSimpleProgress) => unknown,
    eventContext?: Record<string, unknown>,
    opts?: TOpts
): BetaJSPromise<TFFmpegSimpleResponse>;

export type TFFmpegSimpleResponse = TFFProbeSimpleResponse;

export type TFFmpegSimpleProgress = {
    frame?: number,
    fps?: number,
    q?: number,
    size_kb?: number,
    bitrate_kbits?: number,
    dup?: number,
    drop?: number,
    time?: number,
    pass: number,
    passes: number,
    progress?: number
};

export type TFFmpegSimpleOptions = {
    output_type?: "video" | "audio" | "image" | "gif",
    synchronize?: boolean,
    framerate?: number,
    framerate_gop?: number,
    image_percentage?: number,
    image_position?: number,
    time_limit?: number,
    time_start?: number,
    time_end?: number,
    video_map?: number,
    audio_map?: number,
    video_profile?: string,
    faststart?: boolean,
    video_format?: string,
    audio_bit_rate?: number,
    video_bit_rate?: number,
    normalize_audio?: boolean,
    remove_audio?: boolean,
    width?: number,
    height?: number,
    auto_rotate?: boolean,
    rotate?: number,
    ratio_strategy?: "fixed" | "shrink" | "stretch",
    size_strategy: "keep" | "shrink" | "stretch",
    shrink_strategy?: "shrink-pad" | "crop" | "shrink-crop",
    stretch_strategy?: "pad" | "stretch-pad" | "stretch-crop",
    mixed_strategy?: "shrink-pad" | "stretch-crop" | "crop-pad",
    watermarks?: TWatermark[],
    maxMuxingQueueSize?: boolean,
} & Partial<TWatermark>;

export type TWatermark = {
    watermark: string,
    watermark_size: number,
    watermark_x: number,
    watermark_y: number,
};
