import { BetaJSPromise } from "./betajs";
import { TFFProbeOpts } from "./opts";

export function ffprobe(
    file: string,
    options?: TFFProbeOpts
): BetaJSPromise<TFFProbeResponse>;

export type TFFProbeResponse = {
    streams: TFFProbeStream[],
    format: TFFProbeFormat
};

export type TFFProbeFormat = TFFProbeAudioFormat | TFFProbeImageFormat | TFFProbeVideoFormat;

type TBaseFormat = {
    filename: string,
    nb_streams: number,
    nb_programs: number,
    format_name: string,
    format_long_name: string,
    size: string,
    probe_score: number,
    tags: TTags
};

export type TFFProbeAudioFormat = TBaseFormat & {
    start_time: string,
    duration: string,
    bit_rate: string,
};

export type TFFProbeImageFormat = TBaseFormat & {
    start_time?: string,
    duration?: string,
    bit_rate?: string
};

export type TFFProbeVideoFormat = TBaseFormat & {
    start_time: string,
    duration: string,
    bit_rate: string
}

export type TFFProbeStream = TFFProbeAudioStream | TFFProbeImageStream | TFFProbeVideoStream;

type TBaseStream = {
    index: number,
    codec_name: string,
    codec_long_name: string,
    profile?: string,
    codec_type: string,
    codec_tag_string: string,
    codec_tag: string,
    id?: string,
    tags: TTags,
    disposition: TDisposition
};

export type TFFProbeAudioStream = TBaseStream & {
    sample_fmt: string,
    sample_rate: string,
    channels: number,
    channel_layout: string,
    bits_per_sample: number,
    r_frame_rate: string,
    avg_frame_rate: string,
    time_base: string,
    start_pts: number,
    start_time: string,
    duration_ts: number,
    duration: string,
    bit_rate: string,
    nb_frames?: string,
    extradata_size?: number
}

export type TFFProbeImageStream = TBaseStream & {
    width: number,
    height: number,
    coded_width: number,
    coded_height: number,
    closed_captions: number,
    film_grain: number,
    has_b_frames: number,
    sample_aspect_ratio?: string,
    display_aspect_ratio?: string,
    pix_fmt: string,
    level: number,
    color_range: string,
    color_space?: string,
    chroma_location?: string,
    refs: number,
    r_frame_rate: string,
    avg_frame_rate: string,
    time_base: string,
    start_pts?: number,
    start_time?: string,
    duration_ts?: number,
    duration?: string,
    bits_per_raw_sample?: string
}

export type TFFProbeVideoStream = TBaseStream & {
    width: number,
    height: number,
    coded_width: number,
    coded_height: number,
    closed_captions: number,
    film_grain: number,
    has_b_frames: number,
    pix_fmt: string,
    level: number,
    color_range?: string,
    color_space?: string,
    color_transfer?: string,
    color_primaries?: string,
    chroma_location: string,
    field_order: string,
    refs: number,
    is_avc: string,
    nal_length_size: string,
    r_frame_rate: string,
    avg_frame_rate: string,
    time_base: string,
    start_pts: number,
    start_time: string,
    duration_ts: number,
    duration: string,
    bit_rate: string,
    bits_per_raw_sample: string,
    nb_frames: string,
    extradata_size: number,
    side_data_list: TSideDataList[]
};

type TTags = {
    major_brand?: string,
    minor_version?: string,
    compatible_brands?: string,
    creation_time?: string,
    make?: string,
    language?: string,
    handler_name?: string,
    vendor_id?: string,
    encoder: string,
    "encoder-eng"?: string,
    date?: string,
    "date-eng"?: string,
    location?: string,
    "location-eng"?: string,
    model?: string,
    [id: string]: unknown
};

type TSideDataList = {
    side_data_type: string,
    displaymatrix: string,
    rotation: number
};

type TDisposition = {
    default: number,
    dub: number,
    original: number,
    comment: number,
    lyrics: number,
    karaoke: number,
    forced: number,
    hearing_impaired: number,
    visual_impaired: number,
    clean_effects: number,
    attached_pic: number,
    timed_thumbnails: number,
    captions: number,
    descriptions: number,
    metadata: number,
    dependent: number,
    still_image: number
};
