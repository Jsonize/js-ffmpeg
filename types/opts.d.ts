import { TFFmpegTestResponse } from "./ffmpeg-test";

export type TBaseOpts = {
    docker?: string | {
        container: string,
        proxy?: string,
        replaceArguments?: {
            libfaac?: string,
            "^/var": string
        },
        preprocessFiles?: {
            chown?: string,
            chmod?: number,
            mkdirs?: boolean
        },
        postprocessFiles?: {
            chown?: string,
            chmod?: number,
            recordChown?: boolean,
            recordChmod?: boolean
        }
    },
    timeout?: number
};

export type TFFmpegOpts = TBaseOpts & { ffmpeg_binary?: string };
export type TFFProbeOpts = TBaseOpts & { ffprobe_binary?: string };

export type TOpts = TFFProbeOpts & TFFmpegOpts & {
    test_ffmpeg?: true,
    test_info?: TFFmpegTestResponse
};
