"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FaChevronLeft, FaChevronRight, FaCircleCheck, FaCompress, FaEye, FaWater } from "react-icons/fa6";
import styles from "./onevision-encoder.module.css";

interface PostMeta {
	title?: string;
	date?: string;
	mainTags?: string[];
	bibtex?: string;
}

const IMAGE_BASE = "/onevision-encoder/images";
const MEDIA_BASE = "https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images";

const GRID_SIZE = 8;
const NUM_ANIM_BLOCKS = 3;
const CODEC_ANIMATION_INTERVAL_MS = 2000;
const PIPELINE_AUTOPLAY_MS = 5000;
const SAMPLING_FRAME_COUNTS = [8, 16, 32, 64];

const AFFILIATIONS = ["LMMs Lab", "Glint Lab", "AIM for Health Lab", "MVP Lab"];

const RESOURCE_LINKS = [
	{ glyph: "\u{1F917}", label: "Models", href: "https://huggingface.co/collections/lmms-lab-encoder/onevision-encoder" },
	{ glyph: "\u{1F4C4}", label: "Tech Report", href: "https://arxiv.org/abs/2602.08683" },
	{ glyph: "\u{1F4CB}", label: "Model Card", href: "https://github.com/EvolvingLMMs-Lab/OneVision-Encoder/blob/main/docs/model_card.md" },
	{ glyph: "\u{1F4CA}", label: "Data Card", href: "https://github.com/EvolvingLMMs-Lab/OneVision-Encoder/blob/main/docs/data_card.md" },
];

const FALLBACK_BIBTEX = `@article{onevision_encoder_2026,
  title={OneVision Encoder},
  author={LMMs Lab, Glint Lab, AIM for Health Lab, MVP Lab},
  journal={arXiv preprint},
  year={2026}
}`;

/*
 * Codec patch files, filename format: imgIdx_row_col_t_h_w (verified against
 * public/onevision-encoder/images/patches_codec/). t/h/w are the source-video
 * coordinates used for placement; imgIdx/row/col only pack the file name.
 */
const CODEC_PATCH_FILES = [
	"0_0_0_0_0_0", "0_0_1_0_0_1", "0_0_2_0_0_2", "0_0_3_0_0_3", "0_0_4_0_0_4", "0_0_5_0_0_5", "0_0_6_0_0_6", "0_0_7_0_0_7",
	"0_1_0_0_1_0", "0_1_1_0_1_1", "0_1_2_0_1_2", "0_1_3_0_1_3", "0_1_4_0_1_4", "0_1_5_0_1_5", "0_1_6_0_1_6", "0_1_7_0_1_7",
	"0_2_0_0_2_0", "0_2_1_0_2_1", "0_2_2_0_2_2", "0_2_3_0_2_3", "0_2_4_0_2_4", "0_2_5_0_2_5", "0_2_6_0_2_6", "0_2_7_0_2_7",
	"0_3_0_0_3_0", "0_3_1_0_3_1", "0_3_2_0_3_2", "0_3_3_0_3_3", "0_3_4_0_3_4", "0_3_5_0_3_5", "0_3_6_0_3_6", "0_3_7_0_3_7",
	"0_4_0_0_4_0", "0_4_1_0_4_1", "0_4_2_0_4_2", "0_4_3_0_4_3", "0_4_4_0_4_4", "0_4_5_0_4_5", "0_4_6_0_4_6", "0_4_7_0_4_7",
	"0_5_0_0_5_0", "0_5_1_0_5_1", "0_5_2_0_5_2", "0_5_3_0_5_3", "0_5_4_0_5_4", "0_5_5_0_5_5", "0_5_6_0_5_6", "0_5_7_0_5_7",
	"0_6_0_0_6_0", "0_6_1_0_6_1", "0_6_2_0_6_2", "0_6_3_0_6_3", "0_6_4_0_6_4", "0_6_5_0_6_5", "0_6_6_0_6_6", "0_6_7_0_6_7",
	"0_7_0_0_7_0", "0_7_1_0_7_1", "0_7_2_0_7_2", "0_7_3_0_7_3", "0_7_4_0_7_4", "0_7_5_0_7_5", "0_7_6_0_7_6", "0_7_7_0_7_7",
	"1_0_0_1_3_4", "1_0_1_1_4_3", "1_0_2_1_4_4", "1_0_3_1_4_5", "1_0_4_1_5_3", "1_0_5_1_5_4", "1_0_6_2_4_3", "1_0_7_2_4_4",
	"1_1_0_2_4_5", "1_1_1_5_4_3", "1_1_2_5_5_3", "1_1_3_5_5_4", "1_1_4_6_4_3", "1_1_5_6_5_2", "1_1_6_6_5_3", "1_1_7_6_5_4",
	"1_2_0_7_2_2", "1_2_1_7_2_3", "1_2_2_7_3_3", "1_2_3_7_4_3", "1_2_4_7_5_2", "1_2_5_7_5_3", "1_2_6_8_4_4", "1_2_7_8_4_5",
	"1_3_0_8_4_6", "1_3_1_8_5_4", "1_3_2_8_5_5", "1_3_3_8_5_6", "1_3_4_9_4_4", "1_3_5_9_4_6", "1_3_6_9_5_4", "1_3_7_9_5_5",
	"1_4_0_9_5_6", "1_4_1_11_3_5", "1_4_2_11_4_4", "1_4_3_11_4_5", "1_4_4_11_5_4", "1_4_5_11_5_5", "1_4_6_12_5_2", "1_4_7_13_4_2",
	"1_5_0_13_5_2", "1_5_1_17_5_2", "1_5_2_17_5_3", "1_5_3_17_5_4", "1_5_4_17_5_5", "1_5_5_19_3_1", "1_5_6_19_3_2", "1_5_7_19_3_3",
	"1_6_0_19_4_1", "1_6_1_19_4_2", "1_6_2_19_4_3", "1_6_3_19_5_1", "1_6_4_19_5_3", "1_6_5_20_2_0", "1_6_6_20_2_5", "1_6_7_20_3_4",
	"1_7_0_20_3_5", "1_7_1_21_3_1", "1_7_2_21_3_2", "1_7_3_21_4_1", "1_7_4_21_4_2", "1_7_5_21_4_3", "1_7_6_21_4_4", "1_7_7_21_5_1",
	"2_0_0_21_5_2", "2_0_1_21_5_3", "2_0_2_21_5_4", "2_0_3_22_3_1", "2_0_4_22_3_2", "2_0_5_22_3_3", "2_0_6_22_4_1", "2_0_7_22_4_2",
	"2_1_0_22_4_3", "2_1_1_22_5_2", "2_1_2_23_2_4", "2_1_3_23_3_4", "2_1_4_27_2_1", "2_1_5_27_3_2", "2_1_6_27_4_1", "2_1_7_27_4_2",
	"2_2_0_27_5_1", "2_2_1_27_5_2", "2_2_2_27_5_3", "2_2_3_29_4_2", "2_2_4_29_4_3", "2_2_5_29_5_2", "2_2_6_29_5_3", "2_2_7_29_5_4",
	"2_3_0_31_4_1", "2_3_1_31_4_4", "2_3_2_31_5_2", "2_3_3_31_5_3", "2_3_4_32_4_4", "2_3_5_32_4_5", "2_3_6_34_3_3", "2_3_7_34_3_4",
	"2_4_0_34_3_5", "2_4_1_34_4_3", "2_4_2_34_4_4", "2_4_3_34_4_5", "2_4_4_34_5_3", "2_4_5_34_5_4", "2_4_6_34_5_5", "2_4_7_35_3_3",
	"2_5_0_35_3_4", "2_5_1_35_3_5", "2_5_2_35_4_3", "2_5_3_35_4_4", "2_5_4_35_4_5", "2_5_5_35_5_4", "2_5_6_35_5_5", "2_5_7_36_2_6",
	"2_6_0_37_2_6", "2_6_1_38_2_4", "2_6_2_38_2_5", "2_6_3_38_2_6", "2_6_4_38_2_7", "2_6_5_38_3_4", "2_6_6_38_3_5", "2_6_7_38_3_6",
	"2_7_0_38_4_4", "2_7_1_38_4_5", "2_7_2_38_4_6", "2_7_3_38_5_6", "2_7_4_39_2_7", "2_7_5_41_2_1", "2_7_6_41_3_5", "2_7_7_42_2_5",
	"3_0_0_42_3_5", "3_0_1_45_2_4", "3_0_2_46_4_2", "3_0_3_47_3_1", "3_0_4_47_3_2", "3_0_5_47_3_3", "3_0_6_47_4_1", "3_0_7_47_4_2",
	"3_1_0_47_4_3", "3_1_1_47_5_2", "3_1_2_48_5_2", "3_1_3_50_3_2", "3_1_4_50_3_3", "3_1_5_50_3_4", "3_1_6_50_3_5", "3_1_7_50_4_2",
	"3_2_0_50_4_3", "3_2_1_50_4_4", "3_2_2_50_4_5", "3_2_3_50_5_1", "3_2_4_50_5_2", "3_2_5_50_5_3", "3_2_6_50_5_4", "3_2_7_50_5_5",
	"3_3_0_53_2_4", "3_3_1_53_3_3", "3_3_2_53_3_4", "3_3_3_53_4_2", "3_3_4_53_4_3", "3_3_5_53_4_4", "3_3_6_53_5_2", "3_3_7_53_5_3",
	"3_4_0_54_2_3", "3_4_1_54_3_3", "3_4_2_56_3_2", "3_4_3_58_4_3", "3_4_4_58_4_4", "3_4_5_58_4_5", "3_4_6_58_5_3", "3_4_7_58_5_4",
	"3_5_0_58_5_5", "3_5_1_59_4_3", "3_5_2_59_4_4", "3_5_3_59_4_5", "3_5_4_59_5_4", "3_5_5_59_5_5", "3_5_6_61_2_2", "3_5_7_61_3_2",
	"3_6_0_62_2_2", "3_6_1_62_2_3", "3_6_2_62_2_4", "3_6_3_62_2_5", "3_6_4_62_3_2", "3_6_5_62_3_3", "3_6_6_62_3_4", "3_6_7_62_3_5",
	"3_7_0_62_4_2", "3_7_1_62_4_3", "3_7_2_62_4_4", "3_7_3_62_4_5", "3_7_4_63_3_4", "3_7_5_63_3_6", "3_7_6_63_3_7", "3_7_7_63_4_4",
];

interface CodecPatch {
	t: number;
	h: number;
	w: number;
	filename: string;
}

const CODEC_PATCHES_BY_T: Record<number, CodecPatch[]> = {};
for (const name of CODEC_PATCH_FILES) {
	const parts = name.split("_");
	const patch: CodecPatch = {
		t: Number(parts[3]),
		h: Number(parts[4]),
		w: Number(parts[5]),
		filename: `${name}.jpg`,
	};
	const bucket = CODEC_PATCHES_BY_T[patch.t] || [];
	bucket.push(patch);
	CODEC_PATCHES_BY_T[patch.t] = bucket;
}

const PIPELINE_STAGE_LABELS = [
	"Original Video",
	"Uniform Frame Sampling",
	"Temporal Saliency Detection",
	"Codec-Style Patch Extraction",
];

const PIPELINE_CASES = [
	{ file: "case1.webm", title: "Case 1: Standard Pipeline" },
	{ file: "case2.webm", title: "Case 2: Saliency Focus" },
	{ file: "case3.webm", title: "Case 3: Compression Analysis" },
	{ file: "case4.webm", title: "Case 4: Zigzag Ordering" },
	{ file: "case5.webm", title: "Case 5: Comparative Analysis" },
	{ file: "case6.webm", title: "Case 6: Comparative Analysis" },
	{ file: "case7.webm", title: "Case 7: Comparative Analysis" },
];

interface ScoreCell {
	value: string;
	best?: boolean;
}

interface LmmProbeRow {
	benchmark: string;
	cells: ScoreCell[];
}

/*
 * Columns: OV-Encoder-Lang (Codec) | Qwen3-ViT (Frame) | OV-Encoder (Codec)
 * | OV-Encoder-Frame (Frame) | SigLIP2 (Frame). Left pair is trained with
 * caption supervision, right triple without.
 */
const LMM_PROBE_GROUPS: { task: string; rows: LmmProbeRow[] }[] = [
	{
		task: "Video",
		rows: [
			{ benchmark: "MVBench", cells: [{ value: "53.2", best: true }, { value: "47.4" }, { value: "52.4", best: true }, { value: "49.8" }, { value: "47.2" }] },
			{ benchmark: "MLVU-dev", cells: [{ value: "47.4", best: true }, { value: "47.2" }, { value: "46.3" }, { value: "49.4", best: true }, { value: "48.4" }] },
			{ benchmark: "NExT-QA (MC)", cells: [{ value: "76.1", best: true }, { value: "70.1" }, { value: "75.6", best: true }, { value: "71.9" }, { value: "70.6" }] },
			{ benchmark: "VideoMME", cells: [{ value: "54.1", best: true }, { value: "47.2" }, { value: "53.4", best: true }, { value: "49.3" }, { value: "46.8" }] },
			{ benchmark: "Perception Test", cells: [{ value: "60.6", best: true }, { value: "57.1" }, { value: "60.3", best: true }, { value: "56.7" }, { value: "56.0" }] },
			{ benchmark: "TOMATO", cells: [{ value: "21.8" }, { value: "22.2", best: true }, { value: "22.2" }, { value: "21.8" }, { value: "22.3", best: true }] },
			{ benchmark: "LongVideoBench-Val-Video", cells: [{ value: "51.6", best: true }, { value: "45.0" }, { value: "50.4", best: true }, { value: "45.5" }, { value: "45.2" }] },
		],
	},
	{
		task: "Image",
		rows: [
			{ benchmark: "AI2D", cells: [{ value: "80.2", best: true }, { value: "77.8" }, { value: "75.7" }, { value: "76.5" }, { value: "78.6", best: true }] },
			{ benchmark: "ChartQA", cells: [{ value: "80.1", best: true }, { value: "79.6" }, { value: "76.5" }, { value: "77.8", best: true }, { value: "76.4" }] },
			{ benchmark: "DocVQA", cells: [{ value: "83.2" }, { value: "85.1", best: true }, { value: "78.4" }, { value: "79.5", best: true }, { value: "75.0" }] },
			{ benchmark: "InfoVQA", cells: [{ value: "51.6", best: true }, { value: "49.0" }, { value: "43.1" }, { value: "45.5", best: true }, { value: "42.0" }] },
			{ benchmark: "MMBench-EN", cells: [{ value: "80.2", best: true }, { value: "79.4" }, { value: "77.2" }, { value: "78.5" }, { value: "79.6", best: true }] },
			{ benchmark: "OCRBench", cells: [{ value: "657" }, { value: "706", best: true }, { value: "605" }, { value: "630", best: true }, { value: "621" }] },
			{ benchmark: "OCRBench v2", cells: [{ value: "30.8", best: true }, { value: "30.6" }, { value: "26.3", best: true }, { value: "26.1" }, { value: "26.1" }] },
			{ benchmark: "MMStar", cells: [{ value: "56.6", best: true }, { value: "56.6", best: true }, { value: "52.1" }, { value: "54.3" }, { value: "55.0", best: true }] },
			{ benchmark: "RealWorldQA", cells: [{ value: "66.1", best: true }, { value: "63.3" }, { value: "60.8" }, { value: "61.2" }, { value: "62.1", best: true }] },
		],
	},
];

interface AttentiveRow {
	method: string;
	tag?: string;
	arch: string;
	res: string;
	avg: ScoreCell;
	scores: ScoreCell[];
}

/* Score columns: SSV2, Diving48, Perce. Test, CharEgo, Epic Verb, Epic Noun, K400, HMDB51. */
const ATTENTIVE_PROBE_GROUPS: { label: string; rows: AttentiveRow[] }[] = [
	{
		label: "8 Frames",
		rows: [
			{ method: "MetaCLIP2", arch: "ViT-L/14", res: "224", avg: { value: "50.2" }, scores: [{ value: "47.2" }, { value: "48.0" }, { value: "47.7" }, { value: "11.0" }, { value: "48.0" }, { value: "40.9" }, { value: "82.4" }, { value: "76.3" }] },
			{ method: "AIMv2", arch: "ViT-L/14", res: "224", avg: { value: "53.8" }, scores: [{ value: "55.1" }, { value: "43.6" }, { value: "55.1" }, { value: "12.0" }, { value: "56.6" }, { value: "45.6" }, { value: "81.1" }, { value: "81.3" }] },
			{ method: "DINOv3", arch: "ViT-L/14", res: "224", avg: { value: "58.0" }, scores: [{ value: "57.4" }, { value: "58.6" }, { value: "59.3" }, { value: "13.2", best: true }, { value: "62.5", best: true }, { value: "51.7" }, { value: "82.9" }, { value: "78.6" }] },
			{ method: "SigLIP2", arch: "ViT-L/16", res: "256", avg: { value: "53.1" }, scores: [{ value: "52.6" }, { value: "50.1" }, { value: "52.7" }, { value: "11.6" }, { value: "54.2" }, { value: "43.8" }, { value: "80.9" }, { value: "79.1" }] },
			{ method: "OV-Encoder", tag: "Frame", arch: "ViT-L/14", res: "224", avg: { value: "58.4" }, scores: [{ value: "57.7" }, { value: "57.6" }, { value: "58.3" }, { value: "12.1" }, { value: "61.4" }, { value: "52.5" }, { value: "84.3" }, { value: "83.1" }] },
			{ method: "OV-Encoder", tag: "Codec", arch: "ViT-L/14", res: "224", avg: { value: "60.2", best: true }, scores: [{ value: "58.5", best: true }, { value: "67.2", best: true }, { value: "60.0", best: true }, { value: "12.3" }, { value: "62.3" }, { value: "53.9", best: true }, { value: "84.4", best: true }, { value: "83.4", best: true }] },
		],
	},
	{
		label: "16 Frames",
		rows: [
			{ method: "MetaCLIP2", arch: "ViT-L/14", res: "224", avg: { value: "51.0" }, scores: [{ value: "49.3" }, { value: "42.1" }, { value: "51.1" }, { value: "11.2" }, { value: "49.2" }, { value: "43.2" }, { value: "84.0" }, { value: "78.2" }] },
			{ method: "AIMv2", arch: "ViT-L/14", res: "224", avg: { value: "56.4" }, scores: [{ value: "57.2" }, { value: "55.7" }, { value: "56.4" }, { value: "12.4" }, { value: "58.3" }, { value: "46.2" }, { value: "82.2" }, { value: "82.6" }] },
			{ method: "DINOv3", arch: "ViT-L/14", res: "224", avg: { value: "59.1" }, scores: [{ value: "58.3" }, { value: "61.3" }, { value: "60.8" }, { value: "14.0", best: true }, { value: "63.2" }, { value: "51.9" }, { value: "83.9" }, { value: "79.7" }] },
			{ method: "SigLIP2", arch: "ViT-L/16", res: "256", avg: { value: "55.7" }, scores: [{ value: "58.2" }, { value: "56.7" }, { value: "53.3" }, { value: "11.9" }, { value: "56.4" }, { value: "45.2" }, { value: "82.7" }, { value: "81.2" }] },
			{ method: "OV-Encoder", tag: "Frame", arch: "ViT-L/14", res: "224", avg: { value: "59.9" }, scores: [{ value: "58.7" }, { value: "63.2" }, { value: "60.3" }, { value: "12.6" }, { value: "62.9" }, { value: "54.5", best: true }, { value: "85.1" }, { value: "81.6" }] },
			{ method: "OV-Encoder", tag: "Codec", arch: "ViT-L/14", res: "224", avg: { value: "61.5", best: true }, scores: [{ value: "60.1", best: true }, { value: "69.4", best: true }, { value: "60.9", best: true }, { value: "12.9" }, { value: "63.3", best: true }, { value: "54.4" }, { value: "85.4", best: true }, { value: "85.3", best: true }] },
		],
	},
];

interface EfficiencyCell {
	value: string;
	reduction?: string;
	best?: boolean;
}

interface EfficiencyRow {
	model: string;
	spec: string;
	strategyIcon: ReactNode;
	strategy: string;
	cells: EfficiencyCell[];
}

/* Score columns: 512, 1024, 2048, 4096 patches. */
const PATCH_EFFICIENCY_GROUPS: { dataset: string; icon: ReactNode; rows: EfficiencyRow[] }[] = [
	{
		dataset: "Diving48",
		icon: <FaWater aria-hidden="true" />,
		rows: [
			{
				model: "SigLIP2",
				spec: "(ViT-L/16, 256px)",
				strategyIcon: <FaCircleCheck aria-hidden="true" />,
				strategy: "Traditional Frame Sampling (dense patch processing)",
				cells: [{ value: "28.1" }, { value: "48.7" }, { value: "50.1" }, { value: "56.7" }],
			},
			{
				model: "OV-Encoder (Codec)",
				spec: "(ViT-L/14, 224px)",
				strategyIcon: <FaCompress aria-hidden="true" />,
				strategy: "16384 patches -> N patches",
				cells: [
					{ value: "46.5", reduction: "96.9% ↓", best: true },
					{ value: "54.9", reduction: "93.8% ↓", best: true },
					{ value: "67.2", reduction: "87.5% ↓", best: true },
					{ value: "69.4", reduction: "75.0% ↓", best: true },
				],
			},
		],
	},
	{
		dataset: "Perception Test",
		icon: <FaEye aria-hidden="true" />,
		rows: [
			{
				model: "SigLIP2",
				spec: "(ViT-L/16, 256px)",
				strategyIcon: <FaCircleCheck aria-hidden="true" />,
				strategy: "Traditional Frame Sampling (dense patch processing)",
				cells: [{ value: "38.7" }, { value: "50.1" }, { value: "52.7" }, { value: "53.3" }],
			},
			{
				model: "OV-Encoder (Codec)",
				spec: "(ViT-L/14, 224px)",
				strategyIcon: <FaCompress aria-hidden="true" />,
				strategy: "16384 patches -> N patches",
				cells: [
					{ value: "50.5", reduction: "96.9% ↓", best: true },
					{ value: "58.6", reduction: "93.8% ↓", best: true },
					{ value: "60.0", reduction: "87.5% ↓", best: true },
					{ value: "60.9", reduction: "75.0% ↓", best: true },
				],
			},
		],
	},
];

type PatchCell = { src: string; title: string } | null;

function buildCodecCells(t: number): PatchCell[] {
	const patches = CODEC_PATCHES_BY_T[t] || [];
	const byPosition = new Map<string, CodecPatch>();
	for (const patch of patches) {
		byPosition.set(`${patch.h}_${patch.w}`, patch);
	}
	const cells: PatchCell[] = [];
	for (let h = 0; h < GRID_SIZE; h++) {
		for (let w = 0; w < GRID_SIZE; w++) {
			const patch = byPosition.get(`${h}_${w}`);
			cells.push(
				patch
					? {
						src: `${IMAGE_BASE}/patches_codec/${patch.filename}`,
						title: `t=${patch.t + 1}, h=${patch.h}, w=${patch.w}`,
					}
					: null,
			);
		}
	}
	return cells;
}

function PatchGridBlock({ label, cells }: { label: string; cells: PatchCell[] }) {
	return (
		<figure className={styles.patchBlock}>
			<div className={styles.patchGrid}>
				{cells.map((cell, index) =>
					cell ? (
						<img
							key={index}
							className={styles.patchCell}
							src={cell.src}
							alt={cell.title}
							title={cell.title}
							loading="lazy"
						/>
					) : (
						<span key={index} className={styles.patchCellEmpty} aria-hidden="true" />
					),
				)}
			</div>
			<figcaption className={styles.patchLabel}>{label}</figcaption>
		</figure>
	);
}

function CodecPatchGrid() {
	const [baseT, setBaseT] = useState(1);
	const hoverRef = useRef(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const id = window.setInterval(() => {
			if (hoverRef.current) {
				return;
			}
			setBaseT((current) => ((current + NUM_ANIM_BLOCKS - 1) % 63) + 1);
		}, CODEC_ANIMATION_INTERVAL_MS);
		return () => window.clearInterval(id);
	}, []);

	const animatedBlocks = [];
	for (let blockIndex = 0; blockIndex < NUM_ANIM_BLOCKS; blockIndex++) {
		const t = ((baseT + blockIndex - 1) % 63) + 1;
		animatedBlocks.push({ t, cells: buildCodecCells(t) });
	}

	return (
		<div
			className={styles.patchRow}
			onMouseEnter={() => {
				hoverRef.current = true;
			}}
			onMouseLeave={() => {
				hoverRef.current = false;
			}}
		>
			<PatchGridBlock label="t = 1" cells={buildCodecCells(0)} />
			{animatedBlocks.map((block, index) => (
				<PatchGridBlock key={index} label={`t = ${block.t + 1}`} cells={block.cells} />
			))}
		</div>
	);
}

function SamplingPatchGrid() {
	return (
		<div className={styles.patchRow}>
			{SAMPLING_FRAME_COUNTS.map((frameCount, imageIndex) => {
				const cells: PatchCell[] = [];
				for (let h = 0; h < GRID_SIZE; h++) {
					for (let w = 0; w < GRID_SIZE; w++) {
						cells.push({
							src: `${IMAGE_BASE}/patches/${imageIndex}_${h}_${w}_${frameCount}_${h}_${w}.jpg`,
							title: `Frame ${imageIndex + 1}, h=${h}, w=${w}`,
						});
					}
				}
				return (
					<PatchGridBlock
						key={frameCount}
						label={`Frame ${imageIndex + 1} (${frameCount} frames sampled)`}
						cells={cells}
					/>
				);
			})}
		</div>
	);
}

function PipelineCarousel() {
	const [caseIndex, setCaseIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const id = window.setInterval(() => {
			setCaseIndex((current) => (current + 1) % PIPELINE_CASES.length);
		}, PIPELINE_AUTOPLAY_MS);
		return () => window.clearInterval(id);
	}, [paused, caseIndex]);

	const activeCase = PIPELINE_CASES[caseIndex];

	return (
		<>
			<div className={styles.panel}>
				<div className={styles.pipelineLabels}>
					{PIPELINE_STAGE_LABELS.map((label) => (
						<span key={label} className={styles.pipelineLabel}>{label}</span>
					))}
				</div>
				<div
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
				>
					<video
						key={activeCase.file}
						className={styles.pipelineVideo}
						src={`${MEDIA_BASE}/${activeCase.file}`}
						aria-label={activeCase.title}
						autoPlay
						loop
						muted
						playsInline
					/>
				</div>
			</div>
			<p className={styles.pipelineCaption}>
				Complete video processing pipeline showing the four stages from original video to
				codec-style compressed representation. Each stage demonstrates how our approach
				progressively identifies and extracts temporally-salient patches while maintaining
				rich motion information.
			</p>
			<div className={styles.pipelineControls}>
				<button
					type="button"
					className={styles.pipelineArrow}
					aria-label="Previous case"
					onClick={() => setCaseIndex((current) => (current - 1 + PIPELINE_CASES.length) % PIPELINE_CASES.length)}
				>
					<FaChevronLeft aria-hidden="true" />
				</button>
				<div className={styles.pipelineDots}>
					{PIPELINE_CASES.map((pipelineCase, index) => (
						<button
							key={pipelineCase.file}
							type="button"
							className={index === caseIndex ? `${styles.pipelineDot} ${styles.pipelineDotActive}` : styles.pipelineDot}
							aria-label={pipelineCase.title}
							aria-current={index === caseIndex ? "true" : undefined}
							title={pipelineCase.title}
							onClick={() => setCaseIndex(index)}
						/>
					))}
				</div>
				<button
					type="button"
					className={styles.pipelineArrow}
					aria-label="Next case"
					onClick={() => setCaseIndex((current) => (current + 1) % PIPELINE_CASES.length)}
				>
					<FaChevronRight aria-hidden="true" />
				</button>
			</div>
		</>
	);
}

function lmmCellClass(columnIndex: number, best?: boolean): string | undefined {
	const classes: string[] = [];
	if (columnIndex === 0 || columnIndex === 2) {
		classes.push(styles.oursCol);
	}
	if (columnIndex === 2) {
		classes.push(styles.sepLeft);
	}
	if (best) {
		classes.push(styles.bestVal);
	}
	return classes.length > 0 ? classes.join(" ") : undefined;
}

export default function OneVisionEncoderPage({ post }: { post: PostMeta }) {
	const { title, date, mainTags } = post;
	const displayTitle = title ?? "OneVision Encoder: Codec-Aligned Sparsity as a Foundational Principle for Multimodal Intelligence";
	const bibtex = post.bibtex && post.bibtex.trim().length > 0 ? post.bibtex.trim() : FALLBACK_BIBTEX;
	const formattedDate = date
		? new Date(date)
			.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
			.toUpperCase()
		: null;

	return (
		<div className="blog-content-wrapper">
			<article className="blog-article">
				<header className="blog-header-grid">
					<div className="blog-header-meta">
						<div className="blog-meta-row">
							{formattedDate && <time className="blog-date">{formattedDate}</time>}
							{mainTags && mainTags.length > 0 && (
								<>
									<span className="blog-meta-sep">/</span>
									<div className="blog-main-tags">
										{mainTags.map((tag) => (
											<span key={tag} className="blog-main-tag">{tag}</span>
										))}
									</div>
								</>
							)}
						</div>
						<div className="blog-authors">
							{AFFILIATIONS.map((name, index) => (
								<span key={name} className="blog-author">
									{name}
									{index < AFFILIATIONS.length - 1 && ","}
								</span>
							))}
						</div>
					</div>

					<div className="blog-header-main">
						<h1 className="blog-title">{displayTitle}</h1>
						<div className={styles.resourceLinks}>
							{RESOURCE_LINKS.map((link) => (
								<a
									key={link.label}
									className={styles.resourceLink}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
								>
									<span aria-hidden="true">{link.glyph}</span>
									{link.label}
								</a>
							))}
						</div>
					</div>
				</header>

				<div className={styles.prose}>
					<section id="abstract" className={styles.section}>
						<h2 className={styles.sectionTitle}>Introduction</h2>
						<p>
							<strong>Hypothesis.</strong> Artificial general intelligence is, at its core, a
							compression problem. Effective compression demands resonance: deep learning scales
							best when its architecture aligns with the fundamental structure of the data. These
							are the fundamental principles. Yet, modern vision architectures have strayed from
							these truths: visual signals are highly redundant, while discriminative information,
							the <em>surprise</em>, is sparse. Current models process dense pixel grids uniformly,
							wasting vast compute on static background rather than focusing on the predictive
							residuals that define motion and meaning. We argue that to solve visual
							understanding, we must align our architectures with the information-theoretic
							principles of video, i.e., Codecs.
						</p>
						<p>
							<strong>Method.</strong> OneVision-Encoder encodes video by compressing predictive
							visual structure into semantic meaning. By adopting Codec Patchification,
							OneVision-Encoder abandons uniform computation to focus exclusively on the 3.1%-25%
							of regions rich in signal entropy. To unify spatial and temporal reasoning under
							irregular token layouts, OneVision-Encoder employs a shared 3D RoPE and is trained
							with a large-scale cluster discrimination objective over more than one million
							semantic concepts, jointly capturing object permanence and motion dynamics.
						</p>
						<p>
							<strong>Evidence.</strong> The results validate our core hypothesis: efficiency and
							accuracy are not a trade-off; they are positively correlated. By resolving the
							dichotomy between dense grids and sparse semantics, OneVision-Encoder redefines the
							performance frontier. When integrated into large multimodal models, it consistently
							outperforms strong vision backbones such as Qwen3-ViT and SigLIP2 across 16 image,
							video, and document understanding benchmarks, despite using substantially fewer
							visual tokens and pretraining data. Notably, on video understanding tasks,
							OneVision-Encoder achieves an average improvement of 4.1% over Qwen3-ViT. Under
							attentive probing, it achieves state-of-the-art representation quality, with 17.1%
							and 8.1% Top-1 accuracy improvements over SigLIP2 and DINOv3, respectively, on
							Diving-48 under identical patch budgets. These results demonstrate that
							codec-aligned, patch-level sparsity is not an optimization trick, but a foundational
							principle for next-generation visual generalists, positioning OneVision-Encoder as a
							scalable engine for universal multimodal intelligence.
						</p>
						<figure className={styles.figure}>
							<img
								className={styles.figureImage}
								src={`${IMAGE_BASE}/method.png`}
								alt="OneVision Encoder method overview"
							/>
						</figure>
					</section>

					<section id="codec-patch-selection" className={styles.section}>
						<h2 className={styles.sectionTitle}>Codec-Style Patch Selection</h2>
						<p>
							Traditional video understanding models process frames by uniform temporal
							sampling&mdash;selecting evenly-spaced frames regardless of content. This approach
							treats all spatial regions equally, wasting computation on redundant background
							pixels that remain static across frames.
						</p>
						<p>
							Inspired by HEVC video compression, our <strong>codec-style approach</strong>{" "}
							identifies and processes only the patches that carry meaningful temporal changes.
							Just as video codecs encode motion vectors and residuals rather than full frames, we
							select patches based on their information density&mdash;preserving the dynamic,
							semantically-rich regions while discarding redundant static content.
						</p>

						<div className={styles.panel}>
							<h3 className={styles.panelTitle}>Codec-Style Input</h3>
							<p className={styles.panelNote}>
								Left: Reference frame (t=1) with all patches. Right: Three animated blocks showing
								consecutive frames (t=2,3,4 &rarr; t=5,6,7 &rarr; ...), cycling through t=2 to
								t=64. Each frame shows only salient patches at their spatial positions. The
								result: <strong>75-98% fewer patches</strong> while retaining the information that
								matters.
							</p>
							<CodecPatchGrid />
						</div>

						<div className={styles.panel}>
							<h3 className={styles.panelTitle}>Traditional Frame Sampling</h3>
							<p className={styles.panelNote}>
								Uniformly samples 4 frames and processes all patches from each. Notice the
								redundancy: static backgrounds, repeated textures, and unchanging regions are
								processed multiple times across frames&mdash;wasting computation on pixels that
								add no new information.
							</p>
							<SamplingPatchGrid />
						</div>
					</section>

					<section id="video-pipeline" className={styles.section}>
						<h2 className={styles.sectionTitle}>Video Processing Pipeline</h2>
						<p>
							The visualization below demonstrates our complete video processing pipeline. The
							animation shows four key stages: (1) <strong>Original Video</strong> - a continuous
							64-frame stream capturing the full temporal context, (2){" "}
							<strong>Uniform Frame Sampling</strong> - traditional approach selecting 4-8
							evenly-spaced frames, which is simple but lossy and misses inter-frame motion, (3){" "}
							<strong>Temporal Saliency Detection</strong> - analysis of all 64 frames to identify
							regions with high temporal information such as motion, appearance changes, and
							semantic events, and (4) <strong>Codec-Style Patch Extraction</strong> - extraction
							of only the salient patches in zigzag order, achieving 75-98% compression while
							preserving temporal dynamics.
						</p>
						<PipelineCarousel />
					</section>

					<section id="global-contrastive-learning" className={styles.section}>
						<h2 className={styles.sectionTitle}>Global Contrastive Learning</h2>
						<p>
							Standard contrastive learning (e.g., CLIP) is limited by batch size&mdash;negative
							samples are drawn only from the current batch, typically 32K-64K examples. This
							creates a narrow view of the embedding space and leads to suboptimal
							representations. Our approach maintains a{" "}
							<strong>global concept bank of 2M clustered centers</strong>, enabling each training
							sample to contrast against a diverse, representative set of negatives regardless of
							batch composition. This produces more discriminative embeddings with
							better-separated semantic clusters.
						</p>
						<figure className={styles.figure}>
							<video
								className={styles.figureVideo}
								src={`${MEDIA_BASE}/global_contrastive_comparison.webm`}
								aria-label="Global contrastive learning comparison"
								autoPlay
								loop
								muted
								playsInline
							/>
						</figure>
					</section>

					<section id="lmm-probe-results" className={styles.section}>
						<h2 className={styles.sectionTitle}>LMM Probe Results</h2>
						<p>
							<strong>Comparison of different vision encoders on multimodal benchmarks.</strong>{" "}
							All models are evaluated on a unified multimodal setting using Qwen3-4B-Instruct2507
							as the language backbone. OV-Encoder-Lang denotes the language-aligned variant of the
							OV-Encoder architecture. Qwen3-ViT is extracted from Qwen3-VL-4B. SigLIP2 uses
							siglip2-so400m-patch16-naflex. <strong>(Codec)</strong> indicates codec-guided visual
							encoding using motion vectors and residual signals, while <strong>(Frame)</strong>{" "}
							indicates frame-based visual encoding with dense spatial patchification. Bold values
							indicate the best performance under the same evaluation setting. Results reported in
							the left columns correspond to encoders trained with caption supervision, whereas
							results in the right columns correspond to encoders trained without caption
							supervision.
						</p>
						<div className={styles.tableWrapper}>
							<table className={styles.resultsTable}>
								<thead>
									<tr>
										<th scope="col" rowSpan={2}>Task</th>
										<th scope="col" rowSpan={2}>Benchmark</th>
										<th scope="colgroup" colSpan={5}>Qwen3-4B-Instruct2507</th>
									</tr>
									<tr>
										<th scope="col" className={styles.oursHead}>OV-Encoder-Lang<br />(Codec)</th>
										<th scope="col">Qwen3-ViT<br />(Frame)</th>
										<th scope="col" className={`${styles.oursHead} ${styles.sepLeft}`}>OV-Encoder<br />(Codec)</th>
										<th scope="col">OV-Encoder-Frame<br />(Frame)</th>
										<th scope="col">SigLIP2<br />(Frame)</th>
									</tr>
								</thead>
								<tbody>
									{LMM_PROBE_GROUPS.map((group) =>
										group.rows.map((row, rowIndex) => (
											<tr key={row.benchmark}>
												{rowIndex === 0 && (
													<td rowSpan={group.rows.length} className={styles.taskGroupCell}>
														{group.task}
													</td>
												)}
												<td className={styles.rowHeader}>{row.benchmark}</td>
												{row.cells.map((cell, columnIndex) => (
													<td key={columnIndex} className={lmmCellClass(columnIndex, cell.best)}>
														{cell.value}
													</td>
												))}
											</tr>
										)),
									)}
								</tbody>
							</table>
						</div>
						<p className={styles.footnote}>
							* Bold values indicate the best performance under the same evaluation setting.
						</p>
					</section>

					<section id="attentive-probe-results" className={styles.section}>
						<h2 className={styles.sectionTitle}>Attentive Probe Results</h2>
						<p>
							Performance comparison of different vision encoders using Attentive Probe
							evaluation. Models are evaluated using <strong>single clip</strong> input and trained
							for <strong>10 epochs</strong> across 8 action recognition datasets. Results show
							average performance and per-dataset scores for 8-frame and 16-frame configurations.
						</p>
						<p>
							OV-Encoder (Codec) refers to a variant of OV-Encoder that replaces traditional frame
							sampling with codec-style input, where dense full-frame inputs are substituted by
							codec-guided patch reorganization. Under the same attentive probe setting and token
							budget, patches are selectively reallocated across the input clip based on
							codec-native motion vectors and residuals, without changing the backbone
							architecture or training protocol. This results in stronger performance on
							motion-sensitive datasets, particularly Diving48 and Perception Test.
						</p>
						<div className={styles.tableWrapper}>
							<table className={styles.resultsTable}>
								<thead>
									<tr>
										<th scope="col">Method</th>
										<th scope="col">Arch.</th>
										<th scope="col">Res.</th>
										<th scope="col">AVG</th>
										<th scope="col">SSV2</th>
										<th scope="col">Diving48</th>
										<th scope="col">Perce. Test</th>
										<th scope="col">CharEgo</th>
										<th scope="col">Epic Verb</th>
										<th scope="col">Epic Noun</th>
										<th scope="col">K400</th>
										<th scope="col">HMDB51</th>
									</tr>
								</thead>
								<tbody>
									{ATTENTIVE_PROBE_GROUPS.map((group) => (
										<Fragment key={group.label}>
											<tr className={styles.groupHeaderRow}>
												<td colSpan={12}>{group.label}</td>
											</tr>
											{group.rows.map((row) => (
												<tr key={`${row.method}-${row.tag ?? "base"}`}>
													<td className={styles.rowHeader}>
														{row.method}
														{row.tag && <span className={styles.methodTag}> ({row.tag})</span>}
													</td>
													<td>{row.arch}</td>
													<td>{row.res}</td>
													<td className={row.avg.best ? `${styles.rowAvg} ${styles.bestVal}` : styles.rowAvg}>
														{row.avg.value}
													</td>
													{row.scores.map((cell, columnIndex) => (
														<td key={columnIndex} className={cell.best ? styles.bestVal : undefined}>
															{cell.value}
														</td>
													))}
												</tr>
											))}
										</Fragment>
									))}
								</tbody>
							</table>
						</div>
						<p className={styles.footnote}>
							* Evaluation under Attentive Probe settings using single clip input, trained for 10
							epochs.
						</p>
					</section>

					<section id="patch-efficiency" className={styles.section}>
						<h2 className={styles.sectionTitle}>Patch-Efficient Video Understanding Comparison</h2>
						<p>
							Efficiency analysis comparing SigLIP2 with dense full-frame patch processing and
							OV-Encoder (Codec) under a fixed token budget. It is important to emphasize that
							OV-Encoder (Codec) does not perform temporal downsampling of the input video. All
							results are obtained from the same 64-frame (16384 patches) source video, where
							codec-native motion vectors and residuals are used to selectively extract a fixed
							number of spatiotemporal patches distributed across the entire temporal extent.
						</p>
						<p>
							For a fair comparison, SigLIP2 is evaluated under the same token budgets and adopts
							a traditional frame sampling strategy, where each group of 256 patches corresponds
							to a contiguous RGB frame. Under a fixed token budget, OV-Encoder (Codec)
							redistributes patches across time while preserving their spatial positions, enabling
							long-range temporal coverage. As a result, it outperforms SigLIP2 on Diving48 and
							Perception Test while reducing patch processing by 75.0%&ndash;96.9% compared to
							dense processing of 16,384 patches.
						</p>
						<div className={styles.tableWrapper}>
							<table className={styles.resultsTable}>
								<thead>
									<tr>
										<th scope="col">Dataset</th>
										<th scope="col">Model</th>
										<th scope="col">512 Patches</th>
										<th scope="col">1024 Patches</th>
										<th scope="col">2048 Patches</th>
										<th scope="col">4096 Patches</th>
									</tr>
								</thead>
								<tbody>
									{PATCH_EFFICIENCY_GROUPS.map((group) => (
										<Fragment key={group.dataset}>
											{group.rows.map((row, rowIndex) => (
												<tr key={row.model}>
													{rowIndex === 0 && (
														<td rowSpan={group.rows.length} className={styles.taskGroupCell}>
															<span className={styles.datasetIcon}>{group.icon}</span>
															{group.dataset}
														</td>
													)}
													<td className={styles.modelCell}>
														<div className={styles.modelName}>{row.model}</div>
														<div className={styles.modelMeta}>{row.spec}</div>
														<div className={styles.modelMeta}>
															{row.strategyIcon}
															{row.strategy}
														</div>
													</td>
													{row.cells.map((cell, columnIndex) => (
														<td key={columnIndex} className={cell.best ? styles.bestVal : undefined}>
															<div>{cell.value}</div>
															{cell.reduction && <div className={styles.cellReduction}>{cell.reduction}</div>}
														</td>
													))}
												</tr>
											))}
										</Fragment>
									))}
								</tbody>
							</table>
						</div>
						<p className={styles.footnote}>
							* Percentages under OV-Encoder-Codec indicate patch reduction relative to dense
							processing of all 16384 patches.
						</p>
						<p className={styles.footnote}>
							{"'"}
							<span className={styles.footnoteBadge}>
								<FaCompress aria-hidden="true" />
								{"16384 patches -> N patches"}
							</span>
							{"'"} indicates Codec-Style Patch Selection, where motion-relevant patches are
							selectively retained instead of temporal frame sampling.
						</p>
					</section>

					<section id="bibtex" className={styles.section}>
						<h2 className={styles.sectionTitle}>BibTeX</h2>
						<pre className={styles.bibtex}>{bibtex}</pre>
						<p className={`${styles.footnote} ${styles.footnoteCentered}`}>
							If you find our work useful, please consider citing our paper.
						</p>
					</section>

					<footer className={styles.pageFooter}>
						OneVision Encoder &middot; LLaVA-OneVision Community
					</footer>
				</div>
			</article>
		</div>
	);
}
