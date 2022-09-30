import { BetaJSPromise } from "./betajs";
import { TFFProbeOpts } from "./opts";

export function ffprobe_simple(
    file: string,
    options?: TFFProbeOpts
): BetaJSPromise<TFFProbeSimpleResponse>;

export type TFFProbeSimpleResponse = {
    filename: string,
    stream_count: number,
    size: number,
    bit_rate: number,
    start_time: number,
    duration: number,
    format_name: string,
    format_extensions: string[],
    format_default_extension: string,
    audio?: TFFProbeSimpleAudio,
    image?: TFFProbeSimpleImage,
    video?: TFFProbeSimpleVideo
};

export type TFFProbeSimpleMedia = {
    index: number,
    codec_name: string,
    codec_long_name: string,
    codec_profile: string,
    bit_rate?: number
}

export type TFFProbeSimpleAudio = TFFProbeSimpleMedia & {
    audio_channels: number,
    sample_rate?: number,
};

export type TFFProbeSimpleImage = TFFProbeSimpleMedia & {
    rotation: number,
    width: number,
    height: number,
    rotated_width: number,
    rotated_height: number,
    frames?: number
};

export type TFFProbeSimpleVideo = TFFProbeSimpleImage;
