import { BetaJSPromise } from "./betajs";
import { TFFmpegOpts } from "./opts";

export function ffmpeg_test(
    options: TFFmpegOpts
): BetaJSPromise<TFFmpegTestResponse>;

export type TFFmpegTestResponse = {
    version: TVersion,
    configuration?: string[],
    codecs: TCodec,
    capabilities: TCapabilities,
    encoders: string[],
    decoders: string[]
};

type TVersion = {
    major: number,
    minor: number,
    revision: number
} | Record<string, never>;

type TCapabilities = {
    auto_rotate: boolean
};

type TCodec = {
    support: {
        decoding: boolean,
        encoding: boolean,
        video: boolean,
        audio: boolean,
        intra: boolean,
        lossy: boolean,
        lossless: boolean
    },
    short_name: string,
    long_name: string,
    decoders: string[],
    encoders: string[]
} | Record<string, never>;
