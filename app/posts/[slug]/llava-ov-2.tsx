"use client";

import { Fragment, useState, useEffect } from "react";
import "./llava-ov-2.css";
import benchmarkChartsData from "../../../lib/benchmark-charts.json";

interface ResolutionPoint {
  w: number;
  h: number;
  count: number;
}
interface DurationBin {
  lo: number;
  hi: number;
  count: number;
}
interface DurationPayload {
  unit: "s" | "min";
  bins: DurationBin[];
}
interface BenchmarkChartPayload {
  resolution?: ResolutionPoint[];
  duration?: DurationPayload;
}
const BENCHMARK_CHARTS = benchmarkChartsData as Record<string, BenchmarkChartPayload>;

interface PostMeta {
  title?: string;
  date?: string;
  mainTags?: string[];
  bibtex?: string;
}

const ASSET_BASE = "https://cdn.jsdelivr.net/gh/anxiangsir/ov2_asset@main";

const MODEL_COLUMNS = [
  "LLaVA-OneVision-2 8B",
  "Qwen3-VL 8B",
  "Keye-VL-1.5 8B",
  "InternVL-3.5 8B",
  "PLM 8B",
  "LLaVA-OV-1.5 8B",
] as const;

type BenchmarkRow = {
  id: string;
  name: string;
  scores: [string, string, string, string, string, string];
  summary?: string;
  badges?: string[];
  example?: {
    label: string;
    question: string;
    answer: string;
  };
  isAverage?: boolean;
};

type BenchmarkGroup = {
  id: string;
  title: string;
  note: string;
  rows: BenchmarkRow[];
};

type DemoMedia = {
  kind: "video" | "image";
  src: string;
  alt: string;
  tag: string;
  label: string;
  caption: string;
};

type DemoCard = {
  question: string;
  stripe?: string;
  stripeTone?: "2d" | "3d";
  medias: DemoMedia[];
};

type DemoSection = {
  id: string;
  title: string;
  source: string;
  slides: DemoCard[][];
};

const tocGroups = [
  {
    label: "Overview",
    labelZh: "概览",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
    items: [
      { id: "overview", label: "Highlights", labelZh: "核心要点" },
      { id: "roadmap", label: "Roadmap", labelZh: "路线图" },
      { id: "benchmarks", label: "Benchmarks", labelZh: "基准测试" },
    ],
  },
  {
    label: "Data",
    labelZh: "数据",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>,
    items: [
      { id: "video-caption-dataset", label: "Video Caption Dataset", labelZh: "视频描述数据集" },
    ],
  },
  {
    label: "Method",
    labelZh: "方法",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    items: [
      { id: "training-pipeline", label: "Training Pipeline", labelZh: "训练流程" },
      { type: "stages", stages: ["stage-s1", "stage-s2", "stage-s3", "stage-s4"] },
      { id: "visual-encoder", label: "Visual Encoder", labelZh: "视觉编码器" },
    ],
  },
  {
    label: "Resources",
    labelZh: "资源",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    items: [
      { id: "code-and-demos-res", label: "Code & Demos", labelZh: "代码与演示" },
      { id: "model-checkpoints", label: "Model Checkpoints", labelZh: "模型权重" },
      { id: "training-datasets", label: "Training Datasets", labelZh: "训练数据集" },
      { id: "code-demos", label: "Code Examples", labelZh: "代码示例" },
      { id: "task-demos", label: "Task Demos", labelZh: "任务演示" },
    ],
  },
  {
    label: "Reference",
    labelZh: "引用",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    items: [
      { id: "citation", label: "Citation", labelZh: "引用" },
      { id: "references", label: "References", labelZh: "参考文献" },
    ],
  },
];

const overviewCards = [
  {
    number: "01",
    title: "Long Video Understanding",
    titleZh: "长视频理解",
    body: "Extends video comprehension from 30-second clips to 15-minute footage through a four-stage progressive training pipeline with length-stratified captions.",
    bodyZh: "通过四阶段渐进式训练流程与按时长分层的字幕数据，将视频理解能力从 30 秒短片扩展至 15 分钟长视频。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Codec-based Input",
    titleZh: "Codec 类型输入",
    body: "Adopts codec-based dense video input that preserves the native temporal signal, enabling fine-grained temporal understanding without information loss.",
    bodyZh: "采用基于 codec 的密集视频输入，保留视频原生时序信号，实现细粒度时序理解且不丢失信息。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <polyline points="8 21 16 21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Fully Open Pipeline",
    titleZh: "全流程开源",
    body: "Code, training data, evaluation pipelines, and checkpoints — every artifact across all four stages is released with no gated resources.",
    bodyZh: "代码、训练数据、评估流程与模型权重——四个阶段的全部产物完全开源，无任何受限资源。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2 4 6v6c0 5 3.5 9.4 8 10 4.5-.6 8-5 8-10V6l-8-4z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

const spotlightModes = {
  frame: {
    label: "Uniform 128 Frames",
    short: "Frame",
    summary: "The timeline only keeps evenly spaced snapshots, so high-frequency rope rotations disappear between samples.",
    map: "0.116",
    pred: "16",
    gt: "97",
    bars: [
      { label: "AP@0.1", value: "0.050", width: 6.3 },
      { label: "AP@0.2", value: "0.149", width: 15.9 },
      { label: "AP@0.3", value: "0.149", width: 15.7 },
    ],
  },
  codec: {
    label: "Codec-Selected Patches",
    short: "Codec",
    summary: "Dense codec-selected evidence follows motion-rich regions and recovers almost every jump event on the shared source-video timeline.",
    map: "0.894",
    pred: "92",
    gt: "97",
    bars: [
      { label: "AP@0.1", value: "0.796", width: 100 },
      { label: "AP@0.2", value: "0.938", width: 100 },
      { label: "AP@0.3", value: "0.948", width: 100 },
    ],
  },
} as const;

const videoBenchmarks: BenchmarkGroup = {
  id: "video-benchmarks",
  title: "Table 1a. Video Benchmarks",
  note: "Updated with current evaluation results.",
  rows: [
    {
      id: "videomme",
      name: "VideoMME",
      scores: ["71.9", "71.4", "73.0", "65.9", "60.5", "61.1"],
      summary: "First comprehensive multi-modal benchmark with 900 videos spanning 254 hours across 6 domains and 2,700 QA pairs from short clips to one-hour videos.",
      badges: ["900 videos", "2,700 questions"],
      example: {
        label: "Action reasoning",
        question: "Which of the following reasons motivated the archaeologists to excavate the tomb?",
        answer: "Highway realignment.",
      },
    },
    {
      id: "videomme-sub",
      name: "VideoMME (sub)",
      scores: ["76.3", "75.6", "76.2", "68.6", "65.6", "65.5"],
      summary: "VideoMME evaluated with subtitle modality enabled, highlighting stronger text-visual integration under the same benchmark content.",
      badges: ["900 videos", "2,700 questions"],
    },
    {
      id: "videomme-v2",
      name: "VideoMME-v2 (sub)",
      scores: ["19.9", "18.2", "14.1", "14.6", "8.7", "9.1"],
      summary: "Next-generation benchmark with tri-level hierarchy for visual aggregation, temporal modeling, and reasoning, annotated over 3,300 human-hours with 5 QA rounds.",
      badges: ["800 videos", "3,200 questions"],
    },
    {
      id: "lvbench",
      name: "LVBench",
      scores: ["55.5", "58.0", "42.8", "46.7", "44.5", "40.1"],
      summary: "Extreme long-video benchmark with 103 videos averaging 68 minutes and 1,549 QA pairs across 6 domains for long-term memory and comprehension.",
      badges: ["103 videos", "1,549 questions"],
    },
    {
      id: "videoeval-pro",
      name: "VideoEval-Pro",
      scores: ["61.5", "59.2", "54.9", "50.1", "47.2", "44.8"],
      summary: "Robust long-video benchmark with 1,289 open-ended short-answer questions on 465 videos reformatted from MCQ benchmarks to remove guessing bias.",
      badges: ["465 videos", "1,289 questions"],
    },
    {
      id: "mv-bench",
      name: "MV-Bench",
      scores: ["66.2", "69.0", "56.9", "72.1", "77.1", "51.2"],
      summary: "Evaluates temporal understanding across 20 video tasks that require multi-frame analysis from perception to cognition-oriented skills.",
    },
    {
      id: "nextqa",
      name: "NextQA",
      scores: ["82.5", "83.4", "75.8", "82.0", "84.1", "73.7"],
      summary: "Contains 5,440 videos with 52K QA pairs centered on causal, temporal, and descriptive action reasoning to push video understanding beyond description.",
      badges: ["997 videos", "5,000 questions"],
    },
    {
      id: "tempcompass",
      name: "TempCompass",
      scores: ["74.5", "74.3", "75.5", "70.4", "72.7", "57.5"],
      summary: "Tests temporal perception across speed, direction, and evaluation format variations by using conflicting videos with identical static content.",
      badges: ["410 videos", "1,580 questions"],
    },
    {
      id: "mlvu-dev",
      name: "MLVU-dev",
      scores: ["76.6", "78.1", "75.0", "71.0", "66.4", "62.1"],
      summary: "Multi-task long-video benchmark spanning movies, surveillance, and egocentric video with flexible duration extension and cross-context evaluation.",
      badges: ["1,122 videos", "2,174 questions"],
    },
    {
      id: "longvideobench",
      name: "LongVideoBench",
      scores: ["66.9", "68.0", "66.0", "62.4", "59.6", "56.2"],
      summary: "Features 3,763 subtitle-rich videos up to one hour long and 6,678 referring reasoning questions across 17 categories for interleaved video-language understanding.",
      badges: ["753 videos", "1,337 questions"],
    },
    {
      id: "mmvu-val",
      name: "MMVU-val",
      scores: ["56.2", "58.7", "68.3", "60.2", "43.3", "50.1"],
      summary: "Expert-level multi-discipline benchmark across science, healthcare, humanities, and engineering with domain-specific reasoning demands.",
      badges: ["583 videos", "1,000 questions"],
    },
    {
      id: "mmou",
      name: "MMOU",
      scores: ["39.5", "40.6", "35.3", "36.1", "26.2", "30.7"],
      summary: "Massive omni-modal benchmark with 15,000 questions on 9,038 videos, requiring joint audio-visual-text reasoning for long and complex real-world footage.",
      badges: ["9,038 videos", "15,000 questions"],
    },
    {
      id: "t-charades",
      name: "t/Charades",
      scores: ["53.5", "48.3", "45.4", "27.8", "34.5", "15.6"],
      summary: "Temporal grounding benchmark built on Charades-STA for natural-language activity localization in untrimmed videos.",
      badges: ["1,313 videos", "3,363 questions"],
    },
    {
      id: "t-activitynet",
      name: "t/ActivityNet",
      scores: ["53.8", "46.8", "41.3", "31.3", "7.6", "17.7"],
      summary: "Temporal grounding on ActivityNet Captions with dense event descriptions and localization over a large-scale event video corpus.",
      badges: ["1,389 videos", "4,299 questions"],
    },
    {
      id: "t-qvhighlights",
      name: "t/QVHighlights",
      scores: ["66.4", "59.4", "55.5", "31.3", "4.2", "21.0"],
      summary: "Query-based highlight detection benchmark with moment annotations and saliency scores over 10,000+ YouTube videos.",
      badges: ["1,502 videos", "1,532 questions"],
    },
    {
      id: "jumpscore",
      name: "JumpScore",
      scores: ["74.9", "30.1", "39.6", "11.0", "13.1", "2.1"],
      summary: "In-house benchmark for fine-grained temporal localization and counting of repetitive jump-rope actions under sub-second motion.",
      badges: ["240 videos", "240 questions"],
      example: {
        label: "Timestamp localization",
        question: "List the start timestamps in seconds of each jump rope event. The start is the moment the rope passes behind the legs.",
        answer: "[0.28, 4.44, 5.00, 9.56, 10.16, 10.56, 14.96, 15.52, …] (28 timestamps)",
      },
    },
    {
      id: "vsi-bench",
      name: "VSI-Bench",
      scores: ["70.9", "59.1", "36.4", "56.0", "27.9", "30.2"],
      summary: "Evaluates visual-spatial intelligence through egocentric videos with configurational, measurement-estimation, and spatiotemporal reasoning tasks.",
      badges: ["5,130 videos", "5,130 questions"],
    },
    {
      id: "revsi",
      name: "ReVSI",
      scores: ["57.6", "48.9", "32.4", "47.9", "30.7", "33.5"],
      summary: "Extended VSI-style evaluation for retained visual-spatial reasoning across longer or repeated video contexts.",
      badges: ["381 videos"],
    },
    {
      id: "avg-video",
      name: "Average",
      scores: ["62.5", "58.2", "53.6", "50.3", "43.0", "40.1"],
      isAverage: true,
    },
  ],
};

const spatialBenchmarks: BenchmarkGroup = {
  id: "spatial-benchmarks",
  title: "Table 1b. Spatial Benchmarks",
  note: "Updated with current evaluation results.",
  rows: [
    {
      id: "crpe",
      name: "CRPE",
      scores: ["77.3", "77.7", "75.2", "75.0", "77.0", "74.8"],
      summary: "Circular-based Relation Probing Evaluation tests subject, predicate, and object reasoning with abnormal and rare relations.",
      badges: ["2,000 images", "2,000 questions"],
    },
    {
      id: "metavqa",
      name: "MetaVQA",
      scores: ["69.1", "68.7", "59.2", "65.7", "45.4", "67.1"],
      summary: "Embodied scene understanding benchmark from nuScenes and Waymo that uses Set-of-Mark prompting for traffic-scene spatial reasoning.",
      badges: ["9,725 images", "9,725 questions"],
    },
    {
      id: "erqa",
      name: "ERQA",
      scores: ["43.3", "42.3", "38.3", "41.8", "44.3", "41.5"],
      summary: "Google DeepMind's multimodal embodied reasoning benchmark with robot-scene questions on spatial reasoning, trajectory reasoning, and world knowledge.",
      badges: ["400 images", "400 questions"],
    },
    {
      id: "cv-bench-2d",
      name: "CV-Bench 2D",
      scores: ["82.6", "81.0", "78.2", "77.9", "80.6", "76.5"],
      summary: "Cambrian Vision-Centric Benchmark 2D subset for object counting and spatial relation reasoning over manually inspected ADE20K and COCO examples.",
      badges: ["1,438 images", "1,438 questions"],
    },
    {
      id: "cv-bench-3d",
      name: "CV-Bench 3D",
      scores: ["92.8", "92.3", "82.0", "86.3", "82.4", "82.9"],
      summary: "3D subset of CV-Bench assessing depth order and relative distance understanding with OMNI3D examples.",
      badges: ["1,200 images", "1,200 questions"],
    },
    {
      id: "crosspoint",
      name: "CrossPoint",
      scores: ["61.9", "26.9", "20.2", "20.2", "15.7", "15.9"],
      summary: "Cross-view point correspondence benchmark with hierarchical tasks spanning grounding, visibility reasoning, correspondence judgment, and coordinate prediction.",
      badges: ["300 images", "300 questions"],
      example: {
        label: "Visibility reasoning",
        question: "Is the position of the red dot in image 1 occluded in image 2?",
        answer: "Binary visibility judgment under cross-view correspondence.",
      },
    },
    {
      id: "embspatial",
      name: "EmbSpatial",
      scores: ["78.1", "77.5", "66.3", "73.2", "73.5", "64.2"],
      summary: "Egocentric embodied spatial benchmark covering six spatial relationships across Matterport3D, AI2-THOR, and ScanNet scenes.",
      badges: ["3,640 images", "3,640 questions"],
    },
    {
      id: "sat",
      name: "SAT",
      scores: ["69.3", "69.3", "62.7", "54.7", "36.7", "61.3"],
      summary: "Dynamic Spatial Aptitude Test with synthetic scenes for perspective taking, egocentric action recognition, and motion-centric spatial reasoning.",
      badges: ["150 images", "150 questions"],
    },
    {
      id: "mmsi-bench",
      name: "MMSI-Bench",
      scores: ["29.6", "31.0", "26.7", "28.1", "31.4", "28.3"],
      summary: "Multi-image spatial-intelligence benchmark curated from over 120K images across camera motion, object motion, rotation, and geometry tasks.",
      badges: ["1,000 images", "1,000 questions"],
    },
    {
      id: "blink",
      name: "BLINK",
      scores: ["63.5", "65.1", "52.2", "55.7", "56.0", "48.3"],
      summary: "Broad multimodal perception benchmark spanning 14 classic CV tasks such as depth estimation, correspondence, forensics, and multi-view reasoning.",
      badges: ["1,901 images", "1,901 questions"],
    },
    {
      id: "tracespatial-3d",
      name: "TraceSpatial-3D",
      scores: ["31.0", "8.0", "3.0", "4.0", "1.0", "1.0"],
      summary: "3D object-centric visual trace benchmark that asks models to produce 5–10 waypoint trajectories from a single RGB image for manipulation tasks.",
      badges: ["100 images", "100 trajectories"],
      example: {
        label: "Pick & place",
        question: "Move the pale blue pillow on the sofa which is the second pale blue pillow from the right to the top of the wooden stool on the left.",
        answer: "[[604, 491, 1.75], [488, 472, 1.83], …, [183, 459, 2.15]]",
      },
    },
    {
      id: "avg-spatial",
      name: "Average",
      scores: ["63.5", "58.2", "51.3", "53.0", "49.5", "51.1"],
      isAverage: true,
    },
  ],
};

const imageBenchmarks: BenchmarkGroup = {
  id: "image-benchmarks",
  title: "Table 1c. Image Benchmarks",
  note: "Updated with current evaluation results.",
  rows: [
    {
      id: "mmstar",
      name: "MMStar",
      scores: ["64.8", "62.9", "73.6", "66.6", "57.9", "67.9"],
      summary: "Elite vision-indispensable benchmark with 1,500 human-curated samples covering six core capabilities and 18 detailed axes.",
      badges: ["1,500 images", "1,500 questions"],
    },
    {
      id: "mmbenchen",
      name: "MMBench en",
      scores: ["85.7", "84.9", "88.5", "87.9", "80.2", "85.6"],
      summary: "Bilingual benchmark with 3,000+ multiple-choice questions across 20 ability dimensions, evaluated with CircularEval.",
      badges: ["4,329 images", "4,329 questions"],
    },
    {
      id: "docvqa",
      name: "DocVQA",
      scores: ["95.2", "95.7", "94.9", "92.3", "94.6", "97.8"],
      summary: "Document visual question answering benchmark requiring structural understanding and extraction from diverse document layouts.",
      badges: ["5,349 images", "5,349 questions"],
    },
    {
      id: "chartqa",
      name: "ChartQA",
      scores: ["85.9", "85.1", "84.7", "86.7", "85.5", "86.5"],
      summary: "Combines human-written and generated questions to test arithmetic and multi-step reasoning over charts.",
      badges: ["2,500 images", "2,500 questions"],
    },
    {
      id: "infovqa",
      name: "InfoVQA",
      scores: ["74.4", "83.4", "76.9", "79.1", "80.0", "79.1"],
      summary: "InfographicVQA requires joint reasoning over layout, textual content, graphics, and data visualizations.",
      badges: ["2,801 images", "2,801 questions"],
    },
    {
      id: "ocrbench",
      name: "OCRBench",
      scores: ["78.2", "84.7", "84.8", "84.0", "83.2", "82.6"],
      summary: "Large-scale bilingual OCR benchmark with 23 tasks and 31 scenarios across recognition, localization, handwriting, and logic.",
      badges: ["1,000 images", "1,000 questions"],
    },
    {
      id: "ai2d",
      name: "AI2D",
      scores: ["84.3", "83.6", "86.0", "84.0", "92.7", "84.0"],
      summary: "Science diagram benchmark that probes diagram parsing, relationship understanding, and multiple-choice reasoning.",
      badges: ["3,088 images", "3,088 questions"],
    },
    {
      id: "v-star",
      name: "V*",
      scores: ["85.9", "85.3", "78.0", "81.7", "71.2", "77.5"],
      summary: "High-resolution visual search benchmark for small-detail attribute recognition and relative-position queries in crowded images.",
      badges: ["191 images", "191 questions"],
    },
    {
      id: "countbench",
      name: "CountBench",
      scores: ["89.0", "89.8", "83.1", "75.6", "91.8", "87.8"],
      summary: "Visual counting benchmark designed to expose compositional counting limitations in complex scenes with multiple object types.",
      badges: ["491 images", "491 questions"],
    },
    {
      id: "pixmo-count",
      name: "PixMo-Count",
      scores: ["64.0", "62.4", "55.6", "61.8", "68.0", "63.1"],
      summary: "Allen AI counting benchmark with human-verified test images and point annotations for open-ended counting QA.",
      badges: ["534 images", "534 questions"],
    },
    {
      id: "realworldqa",
      name: "RealWorldQA",
      scores: ["69.7", "69.4", "69.8", "63.1", "72.7", "68.1"],
      summary: "Practical visual reasoning benchmark built from everyday real-world images, including driving scenes and physical reasoning tasks.",
      badges: ["765 images", "765 questions"],
    },
    {
      id: "avg-image",
      name: "Average",
      scores: ["79.7", "80.7", "79.6", "78.4", "79.8", "80.0"],
      isAverage: true,
    },
  ],
};

const trackingBenchmarks: BenchmarkGroup = {
  id: "tracking-benchmarks",
  title: "Table 1d. Tracking Benchmarks",
  note: "Referring video object segmentation and reasoning.",
  rows: [
    {
      id: "davis-f",
      name: "DAVIS (F)",
      scores: ["52.7", "39.7", "14.6", "12.8", "7.8", "11.9"],
      summary: "Referring video object segmentation benchmark evaluated with region similarity (F-measure) on DAVIS.",
    },
    {
      id: "davis-jf",
      name: "DAVIS (J&F)",
      scores: ["58.7", "41.3", "5.8", "4.7", "2.0", "4.1"],
      summary: "Joint J&F score on DAVIS measuring mask quality and contour fidelity for referring video segmentation.",
    },
    {
      id: "mevis-u-f",
      name: "MeViS_U (F)",
      scores: ["37.1", "29.9", "10.1", "7.2", "5.0", "7.3"],
      summary: "Unseen split of MeViS evaluated with frame-wise region similarity for natural-language guided video object segmentation.",
    },
    {
      id: "mevis-u-jf",
      name: "MeViS_U (J&F)",
      scores: ["45.7", "28.4", "7.2", "7.5", "7.6", "6.1"],
      summary: "Combined J&F score on the unseen MeViS split under referring video segmentation.",
    },
    {
      id: "revos-ref-f",
      name: "ReVOS-ref (F)",
      scores: ["60.8", "40.7", "22.1", "22.2", "6.8", "16.8"],
      summary: "ReVOS referring benchmark scored with frame similarity for language-conditioned object tracking and segmentation.",
    },
    {
      id: "revos-ref-jf",
      name: "ReVOS-ref (J&F)",
      scores: ["58.2", "37.8", "10.7", "10.2", "8.5", "13.0"],
      summary: "Joint J&F performance on ReVOS referring-video segmentation.",
    },
    {
      id: "revos-reason-f",
      name: "ReVOS-reason (F)",
      scores: ["27.4", "24.7", "9.9", "7.9", "0.1", "6.2"],
      summary: "Reasoning-heavy ReVOS split focusing on language-guided segmentation that requires richer temporal and spatial inference.",
    },
    {
      id: "revos-reason-jf",
      name: "ReVOS-reason (J&F)",
      scores: ["29.2", "21.9", "9.6", "9.2", "10.2", "9.7"],
      summary: "Combined J&F score for the reasoning split of ReVOS, emphasizing robust tracking under compositional queries.",
    },
    {
      id: "avg-tracking",
      name: "Average",
      scores: ["46.2", "33.1", "11.3", "10.2", "6.0", "9.4"],
      isAverage: true,
    },
  ],
};

const stageCards = [
  {
    id: "stage-s1",
    pill: "S1",
    title: "Stage 1 — Bootstrap from LLaVA-OneVision-1.5 + 30s Video Caption",
    subtitle: "Lift the image-pretrained LLaVA-OneVision-1.5 8B into a video-aware model by mixing in short 30-second clip captions.",
    lines: [
      "(a) LLaVA-OneVision-1.5-Mid-Training-85M — 85M concept-balanced image-text pairs (20M ZH + 65M EN).",
      "(b) 30s-Video-Caption-4.2M — 4.2M clips, 30 frames @ 392×392. (new)",
    ],
  },
  {
    id: "stage-s2",
    pill: "S2",
    title: "Stage 2 — Instruction Tuning + 30–60s Video Caption",
    subtitle: "Scale up to large-scale multimodal instruction data and extend video understanding to medium-length 30–60s clips.",
    lines: [
      "(a) LLaVA-OneVision-1.5-Instruct-Data — 22M multimodal instruction samples.",
      "(b) HuggingFaceM4/FineVision — 24M instruction samples.",
      "(c) 30s-60s-Video-Caption-2.7M — medium-length clips, 60 frames @ 392×392. (new)",
      "(d) 60s-180s-Video-Caption-700K — minute-scale clips, 90 frames @ 392×392. (new)",
    ],
  },
  {
    id: "stage-s3",
    pill: "S3",
    title: "Stage 3 — Long Video Understanding",
    subtitle: "Push the model to long-form video reasoning by combining 10–15 minute captions with established video instruction corpora.",
    lines: [
      "(a) LLaVA-OneVision-1.5-Instruct-Data — 22M multimodal instruction samples.",
      "(b) HuggingFaceM4/FineVision — 24M instruction samples.",
      "(c) lmms-lab/LLaVA-Video-178K — 1.6M video instruction samples (captions, open-ended and MC QA).",
      "(d) OpenGVLab/VideoChat-Flash-Training-Data — long-context video instruction data.",
      "(e) 10min-15min-Video-Caption-350K — long videos, 384 frames @ 392×392. (new)",
    ],
  },
  {
    id: "stage-s4",
    pill: "S4",
    title: "Stage 4 — Longer Video + Improved Codec + Spatial & Tracking",
    subtitle: "Extend to longer videos with an improved codec and denser frame sampling up to 768f, then inject spatial reasoning and video tracking supervision.",
    lines: [
      "(a) LLaVA-OneVision-1.5-Instruct-Data — 22M multimodal instruction samples.",
      "(b) HuggingFaceM4/FineVision — 24M instruction samples.",
      "(c) allenai/Molmo2-VideoTrack + allenai/Molmo2-VideoPoint — point-based video tracking and spatio-temporal pointing.",
      "(d) 10min-15min-Video-Caption-350K (re-encoded) — long videos with the new codec, 384 frames @ 392×392. (new)",
      "(e) 10min-15min-Video-Caption-350K @ 768f — the same corpus densified to 768 frames @ 392×392. (new)",
      "(f) LLaVA-OneVision-2-Spatial-4M — 4M in-house spatial understanding samples. (new)",
    ],
  },
];

const resources = [
  {
    title: "Code & Demos",
    items: [
      {
        label: "LLaVA-OneVision-2 (GitHub)",
        badge: "Code",
        icon: "github" as const,
        href: "https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2",
        host: "github.com",
        meta: "Training code, configs, and evaluation harness.",
      },
      {
        label: "Online Demo",
        badge: "Space",
        icon: "space" as const,
        href: "https://huggingface.co/collections/mvp-lab/llava-onevision-2",
        host: "huggingface.co",
        meta: "HuggingFace Space for interactive demo.",
      },
    ],
  },
  {
    title: "Model Checkpoints",
    items: [
      {
        label: "LLaVA-OneVision-2-8B-Instruct",
        badge: "HF",
        icon: "model" as const,
        href: "https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct",
        host: "huggingface.co",
        meta: "Pretrained checkpoints on HuggingFace.",
      },
    ],
  },
  {
    title: "Training Datasets",
    items: [
      {
        label: "LLaVA-OneVision-2-Data",
        badge: "Dataset",
        icon: "dataset" as const,
        href: "https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data",
        host: "huggingface.co",
        meta: "Pretraining and instruction data.",
      },
    ],
  },
];

const resourceIcons: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.74c-2.92.64-3.54-1.4-3.54-1.4-.48-1.21-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.07 1.61 1.09 1.61 1.09.94 1.6 2.47 1.14 3.07.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.41-2.08 1.09-2.81-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.07a10 10 0 0 1 5.26 0c2-1.35 2.88-1.07 2.88-1.07.58 1.45.21 2.52.11 2.79.68.73 1.08 1.66 1.08 2.81 0 4.02-2.45 4.9-4.79 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  ),
  space: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 19 6.5 19 17.5 12 22 5 17.5 5 6.5 12 2" />
      <path d="M12 2v20M5 6.5l7 4 7-4M5 17.5l7-4 7 4" />
    </svg>
  ),
  model: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M12 7.5v4M10.5 13 6.8 16M13.5 13l3.7 3" />
    </svg>
  ),
  dataset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5.5" rx="7" ry="3" />
      <path d="M5 5.5v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6M5 11.5v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </svg>
  ),
};

const imageVideoCode = `import torch
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image

MODEL_ID = "lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct"

processor = AutoProcessor.from_pretrained(MODEL_ID, trust_remote_code=True)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID, trust_remote_code=True, dtype=torch.bfloat16, device_map="cuda",
).eval()

# ----- Image -----
image = Image.open("cat.jpg").convert("RGB")
messages = [{"role": "user", "content": [
    {"type": "image"},
    {"type": "text", "text": "Describe this image in detail."},
]}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = processor(text=[text], images=[image], return_tensors="pt", padding=True)
inputs = {k: v.to("cuda") if hasattr(v, "to") else v for k, v in inputs.items()}

out = model.generate(**inputs, max_new_tokens=256, do_sample=False)
print(processor.tokenizer.decode(out[0, inputs["input_ids"].shape[-1]:], skip_special_tokens=True))

# ----- Video -----
# Lower max_pixels if you hit OOM on long videos.
processor.video_processor.max_pixels = 200704

messages = [{"role": "user", "content": [
    {"type": "video"},
    {"type": "text", "text": "Describe what happens in this video."},
]}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = processor(
    text=[text], videos=["clip.mp4"], return_tensors="pt", padding=True,
    num_frames=16,  # exact frame count; or use target_fps / max_frames
)
inputs = {k: v.to("cuda") if hasattr(v, "to") else v for k, v in inputs.items()}
out = model.generate(**inputs, max_new_tokens=256, do_sample=False)
print(processor.tokenizer.decode(out[0, inputs["input_ids"].shape[-1]:], skip_special_tokens=True))`;

const codecBackendCode = `# Make sure: \`pip install codec-video-prep opencv-python\` and ffmpeg on PATH.
messages = [{"role": "user", "content": [
    {"type": "video"},
    {"type": "text", "text": "Describe what happens in this long video."},
]}]
text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

inputs = processor(
    text=[text],
    videos=["long_clip.mp4"],
    video_backend="codec",
    max_pixels=150000,          # per-canvas pixel budget; lower if OOM
    return_tensors="pt",
    padding=True,
    # Optional: override codec defaults from preprocessor_config.json
    # codec_config={"target_canvas": 32, "group_size": 32, "images_per_group": 4},
)
inputs = {k: v.to("cuda") if hasattr(v, "to") else v for k, v in inputs.items()}

out = model.generate(**inputs, max_new_tokens=256, do_sample=False)
print(processor.tokenizer.decode(out[0, inputs["input_ids"].shape[-1]:], skip_special_tokens=True))`;

const codeTabs = [
  {
    id: "image-video",
    label: "Image & Video",
    file: "inference.py",
    lang: "python",
    code: imageVideoCode,
  },
  {
    id: "codec-backend",
    label: "Codec Backend",
    file: "codec_backend.py",
    lang: "python",
    code: codecBackendCode,
  },
];

const taskDemoSections: DemoSection[] = [
  {
    id: "temporal-grounding",
    title: "Temporal Grounding",
    source: "TimeLens-Bench · mean IoU ≥ 0.95 over 5 runs",
    slides: [
      [
        {
          question: "He jumps a ramp and dives into a pile of leaves.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/4/full.webm`, alt: "Jump ramp input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/4/prediction.webm`, alt: "Jump ramp prediction video", tag: "A", label: "Answer", caption: "Predicted interval 38–41 s · ActivityNet Captions · IoU 1.00" },
          ],
        },
        {
          question: "A boy is wearing boxing gloves practicing boxing.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/6/full.webm`, alt: "Boxing input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/6/prediction.webm`, alt: "Boxing prediction video", tag: "A", label: "Answer", caption: "Predicted interval 62–87 s · ActivityNet Captions · IoU 0.98" },
          ],
        },
      ],
      [
        {
          question: "Two men are facing the camera and talking.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/8/full.webm`, alt: "Talking heads input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/8/prediction.webm`, alt: "Talking heads prediction video", tag: "A", label: "Answer", caption: "Predicted interval 81–133 s · QVHighlights · IoU 1.00" },
          ],
        },
        {
          question: "A man takes a bag from the bottom cabinet.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/1/full.webm`, alt: "Cabinet input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/1/prediction.webm`, alt: "Cabinet prediction video", tag: "A", label: "Answer", caption: "Predicted interval 11–15 s · Charades-STA · IoU 1.00" },
          ],
        },
      ],
      [
        {
          question: "A boy puts his hand on top of his head in the bathroom and takes a selfie.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/2/full.webm`, alt: "Bathroom selfie input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/2/prediction.webm`, alt: "Bathroom selfie prediction video", tag: "A", label: "Answer", caption: "Predicted interval 15–18 s · Charades-STA · IoU 1.00" },
          ],
        },
        {
          question: "A person puts on a red plaid shirt.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/3/full.webm`, alt: "Plaid shirt input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/3/prediction.webm`, alt: "Plaid shirt prediction video", tag: "A", label: "Answer", caption: "Predicted interval 23–32 s · Charades-STA · IoU 1.00" },
          ],
        },
      ],
      [
        {
          question: "A man wearing white clothes is practicing Tai Chi by the sea.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/5/full.webm`, alt: "Tai Chi input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/5/prediction.webm`, alt: "Tai Chi prediction video", tag: "A", label: "Answer", caption: "Predicted interval 189–208 s · ActivityNet Captions · IoU 0.98" },
          ],
        },
        {
          question: "A person washes and drains a mop in a bucket.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/7/full.webm`, alt: "Mop input video", tag: "I", label: "Input video", caption: "Source clip" },
            { kind: "video", src: `${ASSET_BASE}/demo/temporal_grounding/7/prediction.webm`, alt: "Mop prediction video", tag: "A", label: "Answer", caption: "Predicted interval 22–34 s · ActivityNet Captions · IoU 0.98" },
          ],
        },
      ],
    ],
  },
  {
    id: "video-tracking",
    title: "Video Tracking",
    source: "Referring video object segmentation (R-VOS)",
    slides: [
      [
        {
          question: "Track the animal moving forward.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video/1/original.webm`, alt: "Animal tracking input", tag: "I", label: "Input video", caption: "Referring prompt rollout" },
            { kind: "video", src: `${ASSET_BASE}/demo/video/1/mask.webm`, alt: "Animal tracking mask", tag: "A", label: "Answer", caption: "Per-frame predicted mask" },
          ],
        },
        {
          question: "Track the person whose appearance deviates the most from the norm.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video/2/original.webm`, alt: "Crowd tracking input", tag: "I", label: "Input video", caption: "Referring prompt rollout" },
            { kind: "video", src: `${ASSET_BASE}/demo/video/2/mask.webm`, alt: "Crowd tracking mask", tag: "A", label: "Answer", caption: "Per-frame predicted mask" },
          ],
        },
      ],
      [
        {
          question: "Track a sport car.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video/3/original.webm`, alt: "Sport car tracking input", tag: "I", label: "Input video", caption: "Referring prompt rollout" },
            { kind: "video", src: `${ASSET_BASE}/demo/video/3/mask.webm`, alt: "Sport car tracking mask", tag: "A", label: "Answer", caption: "Per-frame predicted mask" },
          ],
        },
        {
          question: "Track a blue and white colored surfboard in the right hand of dark blue swim suit.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video/4/original.webm`, alt: "Surfboard tracking input", tag: "I", label: "Input video", caption: "Referring prompt rollout" },
            { kind: "video", src: `${ASSET_BASE}/demo/video/4/mask.webm`, alt: "Surfboard tracking mask", tag: "A", label: "Answer", caption: "Per-frame predicted mask" },
          ],
        },
      ],
    ],
  },
  {
    id: "video-manipulation",
    title: "Video Manipulation",
    source: "Real-world robot manipulation · online re-querying",
    slides: [
      [
        {
          question: "Put the apple on the green plate placed on the table.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video_manipulation/1/original.webm`, alt: "Apple rollout", tag: "R", label: "Execution rollout", caption: "Robot rollout" },
            { kind: "image", src: `${ASSET_BASE}/demo/video_manipulation/1/traj_0s.png`, alt: "Apple predicted trajectory", tag: "A", label: "Answer", caption: "9 predicted (x, y, z) waypoints at t = 0 s" },
          ],
        },
        {
          question: "Put the bread into the oven.",
          medias: [
            { kind: "video", src: `${ASSET_BASE}/demo/video_manipulation/2/original.webm`, alt: "Bread rollout", tag: "R", label: "Execution rollout", caption: "Robot rollout" },
            { kind: "image", src: `${ASSET_BASE}/demo/video_manipulation/2/traj_0s.png`, alt: "Bread predicted trajectory", tag: "A", label: "Answer", caption: "5 predicted (x, y, z) waypoints at t = 0 s" },
          ],
        },
      ],
    ],
  },
  {
    id: "spatial-grounding",
    title: "Spatial Grounding",
    source: "Compositional spatial language on a single image",
    slides: [
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point to the top piece of paper on the white table.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_023_pointing_final.png`, alt: "Top piece of paper point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "3D Trajectory",
          stripeTone: "3d",
          question: "Pick up the brown small bottle on the table, and move it to the left of the white mouse.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/3d/trace_087_traj_final.png`, alt: "Bottle trajectory", tag: "A", label: "Answer", caption: "3D pick-and-place trajectory" },
          ],
        },
      ],
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the white object that is the second closest to the wooden shelf.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_029_pointing_final.png`, alt: "White object point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "3D Trajectory",
          stripeTone: "3d",
          question: "Pick up the gray toy on the left, and move it so spacing matches the other toys.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/3d/trace_009_traj_final.png`, alt: "Gray toy trajectory", tag: "A", label: "Answer", caption: "3D pick-and-place trajectory" },
          ],
        },
      ],
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point to the left pillow on the sofa.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_034_pointing_final.png`, alt: "Left pillow point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "3D Trajectory",
          stripeTone: "3d",
          question: "Pick up the red object on the rightmost table, and move it onto the center cabinet.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/3d/trace_046_traj_final.png`, alt: "Red object trajectory", tag: "A", label: "Answer", caption: "3D pick-and-place trajectory" },
          ],
        },
      ],
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the free space between the cat tree and litter box.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_037_pointing_final.png`, alt: "Cat tree free space point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "3D Trajectory",
          stripeTone: "3d",
          question: "Pick up the calculator on the right table, and move it to the left of the phone on the left table.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/3d/trace_092_traj_final.png`, alt: "Calculator trajectory", tag: "A", label: "Answer", caption: "3D pick-and-place trajectory" },
          ],
        },
      ],
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the free space on the table between the speaker to the right of the monitor and the mouse.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_039_pointing_final.png`, alt: "Desk free space point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the object on the windowsill farthest from the viewer.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_040_pointing_final.png`, alt: "Windowsill point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
      ],
      [
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the free space between the black water bottle, the pot lid, and the scissors.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_042_pointing_final.png`, alt: "Kitchen free space point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
        {
          stripe: "2D Pointing",
          stripeTone: "2d",
          question: "Please point out the free space between the black water bottle and the pot lid.",
          medias: [
            { kind: "image", src: `${ASSET_BASE}/demo/spatial/2d/ref_048_pointing_final.png`, alt: "Bottle and lid free space point", tag: "A", label: "Answer", caption: "2D pixel-coordinate point" },
          ],
        },
      ],
    ],
  },
];

const references = [
  {
    title: "LLaVA-OneVision: Easy Visual Task Transfer",
    authors: "Bo Li, Yuanhan Zhang, Dong Guo, Renrui Zhang, Feng Li, Hao Zhang, Kaichen Zhang, Peiyuan Zhang, Yanwei Li, Ziwei Liu, and Chunyuan Li",
    venue: "TMLR",
    year: "2024",
    href: "https://arxiv.org/abs/2408.03326",
    linkLabel: "arXiv:2408.03326",
  },
  {
    title: "LLaVA-OneVision-1.5: Fully Open Framework for Democratized Multimodal Training",
    authors: "Xiang An, Yin Xie, Kaicheng Yang, Wenkang Zhang, Xiuwei Zhao, Zheng Cheng, Yirui Wang, Songcen Xu, Changrui Chen, Didi Zhu, Chunsheng Wu, Huajie Tan, Chunyuan Li, Jing Yang, Jie Yu, Xiyao Wang, Bin Qin, Yumeng Wang, Zizhen Yan, Ziyong Feng, Ziwei Liu, Bo Li, and Jiankang Deng",
    venue: "arXiv",
    year: "2025",
    href: "https://arxiv.org/abs/2509.23661",
    linkLabel: "arXiv:2509.23661",
  },
  {
    title: "OneVision-Encoder: Codec-Aligned Sparsity as a Foundational Principle for Multimodal Intelligence",
    authors: "Feilong Tang, Xiang An, Yunyao Yan, Yin Xie, Bin Qin, Kaicheng Yang, Yifei Shen, Yuanhan Zhang, Chunyuan Li, Shikun Feng, Changrui Chen, Huajie Tan, Ming Hu, Manyuan Zhang, Bo Li, Ziyong Feng, Ziwei Liu, Zongyuan Ge, and Jiankang Deng",
    venue: "arXiv",
    year: "2026",
    href: "https://arxiv.org/abs/2602.08683",
    linkLabel: "arXiv:2602.08683",
  },
  {
    title: "Visual Instruction Tuning",
    authors: "Haotian Liu, Chunyuan Li, Qingyang Wu, and Yong Jae Lee",
    venue: "NeurIPS",
    year: "2023",
    href: "https://arxiv.org/abs/2304.08485",
    linkLabel: "arXiv:2304.08485",
  },
  {
    title: "Qwen3-VL Technical Report",
    authors: "Qwen Team",
    venue: "Tech Report",
    year: "2025",
    href: "https://github.com/QwenLM/Qwen3-VL",
    linkLabel: "github.com/QwenLM/Qwen3-VL",
  },
  {
    title: "InternVL3.5: Advancing Open-Source Multimodal Models in Versatility, Reasoning, and Efficiency",
    authors: "Weiyun Wang, Zhangwei Gao, Lixin Gu, Hengjun Pu, Long Cui, Xingguang Wei, Zhaoyang Liu, Linglin Jing, Shenglong Ye, Jie Shao, Zhaokai Wang, Zhe Chen, Hongjie Zhang, Ganlin Yang, Haomin Wang, Qi Wei, Jinhui Yin, Wenhao Li, Erfei Cui, et al.",
    venue: "Tech Report",
    year: "2025",
    href: "https://arxiv.org/abs/2508.18265",
    linkLabel: "arXiv:2508.18265",
  },
  {
    title: "PerceptionLM: Open-Access Data and Models for Detailed Visual Understanding",
    authors: "Jang Hyun Cho, Andrea Madotto, Effrosyni Mavroudi, Triantafyllos Afouras, Tushar Nagarajan, Muhammad Maaz, Yale Song, Tengyu Ma, Shuming Hu, Suyog Jain, Miguel Martin, Huiyu Wang, Hanoona Rasheed, Peize Sun, Po-Yao Huang, Daniel Bolya, Nikhila Ravi, Shashank Jain, Tammy Stark, Shane Moon, Babak Damavandi, Vivian Lee, Andrew Westbury, Salman Khan, Philipp Krähenbühl, Piotr Dollár, Lorenzo Torresani, Kristen Grauman, and Christoph Feichtenhofer",
    venue: "arXiv",
    year: "2025",
    href: "https://arxiv.org/abs/2504.13180",
    linkLabel: "arXiv:2504.13180",
  },
  {
    title: "Kwai Keye-VL 1.5 Technical Report",
    authors: "Biao Yang, Bin Wen, Boyang Ding, Changyi Liu, Chenglong Chu, Chengru Song, Chongling Rao, Chuan Yi, Da Li, Dunju Zang, Fan Yang, Guorui Zhou, Guowang Zhang, Han Shen, Hao Peng, Haojie Ding, Hao Wang, Haonan Fan, Hengrui Ju, et al.",
    venue: "arXiv",
    year: "2025",
    href: "https://arxiv.org/abs/2509.01563",
    linkLabel: "arXiv:2509.01563",
  },
];

const bibtex = `@article{llava_onevision_2_2026,
  title   = {LLaVA-OneVision-2: Open Multimodal Training at Scale},
  author  = {Xiang An and Yin Xie and Kaicheng Yang and Wenkang Zhang and Xiuwei Zhao and Zheng Cheng and Yirui Wang and Songcen Xu and Changrui Chen and Didi Zhu and Chunsheng Wu and Huajie Tan and Chunyuan Li and Jing Yang and Jie Yu and Xiyao Wang and Bin Qin and Yumeng Wang and Zizhen Yan and Ziyong Feng and Ziwei Liu and Bo Li and Jiankang Deng},
  journal = {arXiv preprint arXiv:TBD},
  year    = {2026}
}`;

function formatDate(dateValue?: string) {
  if (!dateValue) {
    return "Apr 2026";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Apr 2026";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderMedia(media: DemoMedia) {
  if (media.kind === "video") {
    return (
      <video className="demo-media" muted loop playsInline autoPlay preload="metadata">
        <source src={media.src} type="video/webm" />
      </video>
    );
  }

  return <img className="demo-media" src={media.src} alt={media.alt} loading="lazy" />;
}

function ResolutionScatter({ data, ariaLabel }: { data: ResolutionPoint[]; ariaLabel: string }) {
  if (!data || data.length === 0) return null;
  const totalAll = data.reduce((s, d) => s + d.count, 0);
  const minCount = Math.max(2, Math.ceil(totalAll * 0.01));
  let filtered = data.filter((d) => d.count >= minCount);
  if (filtered.length === 0) filtered = data;

  const W = 360;
  const H = 220;
  const pad = { l: 44, r: 14, t: 12, b: 34 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const maxW = Math.max(...filtered.map((d) => d.w));
  const maxH = Math.max(...filtered.map((d) => d.h));
  const maxC = Math.max(...filtered.map((d) => d.count));
  const xMax = Math.ceil(maxW / 100) * 100;
  const yMax = Math.ceil(maxH / 100) * 100;
  const sx = (x: number) => pad.l + (x / xMax) * plotW;
  const sy = (y: number) => pad.t + plotH - (y / yMax) * plotH;
  const ticks = 4;
  const rMin = 3;
  const rMax = 18;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label={ariaLabel}>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const gx = pad.l + (i / ticks) * plotW;
        const tickVal = Math.round((i / ticks) * xMax);
        return (
          <g key={`vx-${tickVal}-${gx}`}>
            <line x1={gx} y1={pad.t} x2={gx} y2={pad.t + plotH} className="chart-grid" />
            <text x={gx} y={pad.t + plotH + 14} className="chart-tick" textAnchor="middle">{tickVal}</text>
          </g>
        );
      })}
      {Array.from({ length: ticks + 1 }, (_, j) => {
        const gy = pad.t + (j / ticks) * plotH;
        const tickV = Math.round(((ticks - j) / ticks) * yMax);
        return (
          <g key={`vy-${tickV}-${gy}`}>
            <line x1={pad.l} y1={gy} x2={pad.l + plotW} y2={gy} className="chart-grid" />
            <text x={pad.l - 6} y={gy + 4} className="chart-tick" textAnchor="end">{tickV}</text>
          </g>
        );
      })}
      <text x={pad.l + plotW / 2} y={H - 4} className="chart-axis-label" textAnchor="middle">width (px)</text>
      <text x={10} y={pad.t + plotH / 2} className="chart-axis-label" textAnchor="middle" transform={`rotate(-90 10 ${pad.t + plotH / 2})`}>height (px)</text>
      {filtered.map((d) => {
        const r = rMin + Math.sqrt(d.count / maxC) * (rMax - rMin);
        return (
          <g key={`dot-${d.w}x${d.h}-${d.count}`} className="chart-dot">
            <circle cx={sx(d.w)} cy={sy(d.h)} r={r} className="chart-dot-circle" />
            <title>{`${d.w}×${d.h} — ${d.count} videos`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function DurationHistogram({ data, ariaLabel }: { data: DurationPayload | undefined; ariaLabel: string }) {
  if (!data || !data.bins || data.bins.length === 0) return null;
  const totalBins = data.bins.reduce((s, b) => s + b.count, 0);
  const minBin = Math.max(1, Math.ceil(totalBins * 0.01));
  let lo = 0;
  let hi = data.bins.length - 1;
  while (lo < hi && data.bins[lo].count < minBin) lo++;
  while (hi > lo && data.bins[hi].count < minBin) hi--;
  const bins = data.bins.slice(lo, hi + 1);
  const unit = data.unit || "s";
  const W = 360;
  const H = 220;
  const pad = { l: 36, r: 14, t: 12, b: 38 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const maxC = Math.max(1, ...bins.map((b) => b.count));
  const n = bins.length;
  const bw = (plotW / n) * 0.78;
  const bgap = (plotW / n) * 0.22;
  const ticks = 4;
  const total = bins.reduce((s, b) => s + b.count, 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label={ariaLabel}>
      {Array.from({ length: ticks + 1 }, (_, j) => {
        const gy = pad.t + (j / ticks) * plotH;
        const tickV = Math.round(((ticks - j) / ticks) * maxC);
        return (
          <g key={`hy-${tickV}-${gy}`}>
            <line x1={pad.l} y1={gy} x2={pad.l + plotW} y2={gy} className="chart-grid" />
            <text x={pad.l - 6} y={gy + 4} className="chart-tick" textAnchor="end">{tickV}</text>
          </g>
        );
      })}
      {bins.map((b, i) => {
        const x = pad.l + i * (plotW / n) + bgap / 2;
        const hRatio = b.count / maxC;
        const bh = hRatio * plotH;
        const y = pad.t + plotH - bh;
        const pct = total > 0 ? ((b.count / total) * 100).toFixed(1) : "0";
        const label = `${b.lo}–${b.hi}`;
        return (
          <g key={`bar-${b.lo}-${b.hi}`} className="chart-bar">
            <rect x={x} y={y} width={bw} height={bh} rx={2} ry={2} className="chart-bar-rect" />
            {b.count > 0 && (
              <text x={x + bw / 2} y={y - 3} className="chart-bar-value" textAnchor="middle">{b.count}</text>
            )}
            <text x={x + bw / 2} y={pad.t + plotH + 14} className="chart-tick" textAnchor="middle">{label}</text>
            <title>{`${b.lo}–${b.hi}${unit} — ${b.count} videos (${pct}%)`}</title>
          </g>
        );
      })}
      <text x={pad.l + plotW / 2} y={H - 4} className="chart-axis-label" textAnchor="middle">{`duration (${unit})`}</text>
    </svg>
  );
}

export default function LlavaOV2Page({ post }: { post: PostMeta }) {
  const { title, date, mainTags } = post;
  const displayTitle = title ?? "LLaVA-OneVision-2: Towards Next-Generation Perceptual Intelligence";
  const [activeCodecMode, setActiveCodecMode] = useState<keyof typeof spotlightModes>("codec");
  const [openBenchmark, setOpenBenchmark] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<string>(codeTabs[0].id);
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>(() =>
    Object.fromEntries(taskDemoSections.map((section) => [section.id, 0])) as Record<string, number>,
  );
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("en");
  const [stars, setStars] = useState<number>(988);

  useEffect(() => {
    setTheme(localStorage.getItem("lov2-theme") || "light");
    setLang(localStorage.getItem("lov2-lang") || "en");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.github.com/repos/EvolvingLMMs-Lab/LLaVA-OneVision-2", {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        /* keep fallback star count on any failure */
      });
    return () => controller.abort();
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("lov2-theme", next);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("lov2-lang", next);
  };

  const activeMode = spotlightModes[activeCodecMode];

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedBlock(key);
      window.setTimeout(() => {
        setCopiedBlock((current) => (current === key ? null : current));
      }, 1600);
    } catch {
      setCopiedBlock(null);
    }
  };

  const toggleBenchmark = (id: string) => {
    setOpenBenchmark((current) => (current === id ? null : id));
  };

  const moveCarousel = (sectionId: string, direction: -1 | 1, length: number) => {
    setCarouselIndex((current) => {
      const next = (current[sectionId] + direction + length) % length;
      return { ...current, [sectionId]: next };
    });
  };

  const jumpCarousel = (sectionId: string, index: number) => {
    setCarouselIndex((current) => ({ ...current, [sectionId]: index }));
  };

  const benchmarkGroups = [videoBenchmarks, spatialBenchmarks, imageBenchmarks, trackingBenchmarks];

  return (
    <div id="lov2-page" data-theme={theme} className={lang === "zh" ? "lang-zh" : ""} style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--text-primary)" }}>
      <nav className="site-navbar" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ marginRight: "auto" }}></div>
        <fieldset className="theme-switcher" aria-label="Theme" data-active={theme}>
          <span className="theme-thumb" aria-hidden="true"></span>
          <button type="button" onClick={toggleTheme} data-theme="blue" className={`theme-seg ${theme === 'light' ? 'active' : ''}`} aria-label="Light theme" aria-pressed={theme === 'light'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
          <button type="button" onClick={toggleTheme} data-theme="dark" className={`theme-seg ${theme === 'dark' ? 'active' : ''}`} aria-label="Dark theme" aria-pressed={theme === 'dark'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
          </button>
        </fieldset>
        <button className="nav-item" type="button" onClick={toggleLang}>
          {lang === "en" ? "中文" : "EN"}
        </button>
      </nav>

      <div className="grid-overlay" aria-hidden="true" />
      <div className="page-layout">
        <aside className="toc-sidebar">
          <nav className="toc-nav">
            <div className="toc-nav-title">
              <span className="i18n" data-lang="en">On this page</span>
              <span className="i18n" data-lang="zh">页面导航</span>
            </div>
            
            <ul className="toc-list">
              {tocGroups.map((group) => (
                <li key={group.label} className="toc-group">
                  <span className="toc-group-label">
                    {group.icon}
                    <span className="i18n" data-lang="en">{group.label}</span>
                    <span className="i18n" data-lang="zh">{group.labelZh}</span>
                  </span>
                  {group.label === "Method" ? (
                    <>
                      <ul className="toc-sublist">
                        <li><a href="#training-pipeline"><span className="i18n" data-lang="en">Training Pipeline</span><span className="i18n" data-lang="zh">训练流程</span></a></li>
                      </ul>
                      <ul className="toc-stage-list" aria-label="Training stages">
                        <li><a href="#stage-s1">Stage 1</a></li>
                        <li><a href="#stage-s2">Stage 2</a></li>
                        <li><a href="#stage-s3">Stage 3</a></li>
                        <li><a href="#stage-s4">Stage 4</a></li>
                      </ul>
                      <ul className="toc-sublist">
                        <li><a href="#visual-encoder"><span className="i18n" data-lang="en">Visual Encoder</span><span className="i18n" data-lang="zh">视觉编码器</span></a></li>
                      </ul>
                    </>
                  ) : (
                    <ul className="toc-sublist">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <a href={`#${item.id}`}>
                            <span className="i18n" data-lang="en">{item.label}</span>
                            <span className="i18n" data-lang="zh">{item.labelZh}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="page">
          <header className="header section" id="top">
            <div className="eyebrow">Open Multimodal Training</div>
            <h1>{displayTitle}</h1>

            <div className="meta-row">
              <span className="updated-stamp">Updated Apr 2026</span>
              <span className="meta-sep">/</span>
              <span>{formatDate(date)}</span>
              {Array.isArray(mainTags) && mainTags.length > 0 && (
                <>
                  <span className="meta-sep">/</span>
                  <span className="tag-row">
                    {mainTags.map((tag: string) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>

            <div className="authors">LLaVA-OneVision Contributors</div>

            <p className="lede">
              The next generation of fully-open multimodal training — pushing the boundary of recipe transparency,
              native-resolution understanding, and end-to-end reproducibility.
            </p>

            <div className="link-row">
              <a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
                <span className="i18n" data-lang="en">Code</span><span className="i18n" data-lang="zh">代码</span>
                <span className="gh-stars" role="img" aria-label={`${stars.toLocaleString("en-US")} GitHub stars`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.77l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"></path></svg>
                  {stars.toLocaleString("en-US")}
                </span>
              </a>
              <a href={`${ASSET_BASE}/LLaVA_OneVision_2.pdf`} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span className="i18n" data-lang="en">Technical Report</span><span className="i18n" data-lang="zh">技术报告</span>
              </a>
              <a href="https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span className="i18n" data-lang="en">Models</span><span className="i18n" data-lang="zh">模型</span>
              </a>
              <a href="https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3"></ellipse><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"></path><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"></path></svg>
                <span className="i18n" data-lang="en">Datasets</span><span className="i18n" data-lang="zh">数据集</span>
              </a>
              <a href="https://discord.gg/PmdGHMFNP" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                Discord
              </a>
              <a href={`${ASSET_BASE}/wechat.png`} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8.7 5.2C4.9 5.2 2 7.6 2 10.7c0 1.8 1 3.4 2.6 4.4l-.7 2.1 2.5-1.2c.7.2 1.5.3 2.3.3h.4c-.2-.6-.3-1.2-.3-1.8 0-3.1 3-5.6 6.7-5.6h.3c-.9-2.2-3.6-3.7-7.1-3.7zm-2.3 3.1c.5 0 .9.4.9.8s-.4.8-.9.8-.9-.4-.9-.8.4-.8.9-.8zm4.7 0c.5 0 .9.4.9.8s-.4.8-.9.8-.9-.4-.9-.8.4-.8.9-.8zM15.3 10c-3.1 0-5.7 2-5.7 4.5s2.6 4.5 5.7 4.5c.6 0 1.2-.1 1.8-.2l2 1-.5-1.7c1.4-.8 2.3-2.1 2.3-3.6 0-2.5-2.5-4.5-5.6-4.5zm-1.9 2.5c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm3.8 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"/>
                </svg>
                <span className="i18n" data-lang="en">WeChat Group</span><span className="i18n" data-lang="zh">微信群</span>
              </a>
            </div>
          </header>

          <section className="section codec-demo-spotlight" id="codec-demo-spotlight">
            <div className="codec-demo-spotlight-copy">
              <div className="codec-demo-kicker">
                <span className="i18n" data-lang="en">Qualitative highlight</span>
                <span className="i18n" data-lang="zh">可视化亮点</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', marginTop: '12px', marginBottom: '16px' }}>
                <span className="i18n" data-lang="en">Codec evidence keeps motion dense where uniform frames go sparse.</span>
                <span className="i18n" data-lang="zh">Codec 证据在动作密集处保留更多视觉信息，而均匀抽帧容易变稀疏。</span>
              </h2>
              <p>
                <span className="i18n" data-lang="en">The same jump-rope clip is rendered side-by-side on a shared source-video timeline: uniform sampling sees only 128 evenly spaced frames, while codec-selected patches follow the retained temporal evidence.</span>
                <span className="i18n" data-lang="zh">同一段跳绳视频在共享原视频时间轴上并排渲染：均匀采样只看到 128 个等距帧，而 codec-selected patches 会跟随被保留下来的时序证据。</span>
              </p>
            </div>
            
            <figure className="codec-demo-figure">
              <div className="codec-demo-header">
                <div>
                  <div className="codec-demo-kicker">
                    <span className="i18n" data-lang="en">Qualitative example</span>
                    <span className="i18n" data-lang="zh">定性示例</span>
                  </div>
                  <h4>
                    <span className="i18n" data-lang="en">Same timeline, different temporal evidence</span>
                    <span className="i18n" data-lang="zh">同一时间轴，不同的视频证据密度</span>
                  </h4>
                </div>
              </div>
              <div className="codec-demo-video-shell">
                <div className="video-mode-badges" aria-hidden="true">
                  <span className="mode-badge frame">
                    <span className="mode-swatch"></span>
                    <span className="i18n" data-lang="en">Left: Uniform 128 Frames</span>
                    <span className="i18n" data-lang="zh">左侧：Uniform 128 Frames</span>
                  </span>
                  <span className="mode-badge codec">
                    <span className="mode-swatch"></span>
                    <span className="i18n" data-lang="en">Right: Codec-Selected Patches</span>
                    <span className="i18n" data-lang="zh">右侧：Codec-Selected Patches</span>
                  </span>
                </div>

                <video autoPlay muted loop playsInline preload="metadata">
                  <source src="https://cdn.jsdelivr.net/gh/anxiangsir/ov2_asset@main/demo/codec/codec-frame-jumprope-sample-01.webm" type="video/webm" />
                </video>

                <fieldset className="video-event-legend" aria-label="Video annotation legend">
                  <span className="event-badge pred">
                    <span className="event-dot"></span>
                    <span className="i18n" data-lang="en">Pred event (red flash)</span>
                    <span className="i18n" data-lang="zh">预测事件（红色闪烁）</span>
                  </span>
                  <span className="event-badge gt">
                    <span className="event-dot"></span>
                    <span className="i18n" data-lang="en">GT event (green box)</span>
                    <span className="i18n" data-lang="zh">GT 事件（绿色框）</span>
                  </span>
                </fieldset>
              </div>
              
              <fieldset className="codec-demo-analysis" aria-label="Jump rope sample metrics and event timeline">
                <div className="codec-demo-timeline-intro">
                  <span className="i18n" data-lang="en">GT events stay green; predictions light up at their video time.</span>
                  <span className="i18n" data-lang="zh">GT 事件保持绿色；预测在对应时间点亮起。</span>
                </div>
              </fieldset>
            </figure>
          </section>

          <section className="section" id="overview">
            <h3 className="toc-heading" id="overview-heading">
              <span className="i18n" data-lang="en">Highlights</span>
              <span className="i18n" data-lang="zh">核心要点</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              <span className="i18n" data-lang="en">
                LLaVA-OneVision-2 is a fully-open recipe for training competitive 8B-class vision-language models — every stage, every dataset, every weight is reproducible. Below: what makes it different at a glance.
              </span>
              <span className="i18n" data-lang="zh">
                LLaVA-OneVision-2 是一套完全开放的 8B 级视觉语言模型训练配方——每个阶段、每个数据集、每份权重都可复现。下方为其核心特性概览。
              </span>
            </p>

            <div className="highlights-manifesto">
              {overviewCards.map((item) => (
                <div key={item.number} className="manifesto-item">
                  <div className="manifesto-num">{item.number}</div>
                  <div className="manifesto-icon">{item.icon}</div>
                  <h4 className="manifesto-title">
                    <span className="i18n" data-lang="en">{item.title}</span>
                    <span className="i18n" data-lang="zh">{item.titleZh}</span>
                  </h4>
                  <div className="manifesto-body">
                    <span className="i18n" data-lang="en">{item.body}</span>
                    <span className="i18n" data-lang="zh">{item.bodyZh}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section section-alt" id="roadmap">
            <h3 className="toc-heading" id="roadmap-heading">
              <span className="i18n" data-lang="en">Roadmap</span>
              <span className="i18n" data-lang="zh">路线图</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              The OV2 roadmap traces the evolution from early frame and clip sampling to heuristic token compression, learned token selection, and the 2026 codec-aligned paradigm.
            </p>

            <figure className="figure image-figure">
              <img src="/posts/llava_onevision_2/roadmap.png" alt="LLaVA-OneVision-2 roadmap" className="full-image" />
              <figcaption className="figure-caption">
                <strong>Figure 2.</strong> Roadmap of video understanding from token compression to codec-aligned perceptual intelligence.
              </figcaption>
            </figure>
          </section>

          <section className="section" id="method-figures">
          <h3 className="toc-heading" id="method-figures-heading">
            <span className="i18n" data-lang="en">How It Works</span><span className="i18n" data-lang="zh">方法图解</span>
          </h3>
          <p className="i18n" data-lang="en" style={{ marginTop: "-2px", color: "#475569" }}>
            Two design choices behind LLaVA-OneVision-2&apos;s long-video and unified-modality capability, illustrated.
          </p>
          <p className="i18n" data-lang="zh" style={{ marginTop: "-2px", color: "#475569" }}>
            LLaVA-OneVision-2 长视频与多模态统一能力背后的两个核心设计，图示如下。
          </p>

          <figure className="figure method-figure">
            <div className="method-figure-svg"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 480" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
  <defs>
    <style>{`
      .fig-label   { font-size: 11px; font-weight: 600; fill: #64748b; }
      .fig-title   { font-size: 17px; font-weight: 700; fill: #0f172a; }
      .fig-sub     { font-size: 12px; font-weight: 400; fill: #475569; }
      .panel-title { font-size: 13px; font-weight: 600; fill: #0f172a; }
      .panel-sub   { font-size: 11px; font-weight: 400; fill: #64748b; }
      .stat-num    { font-size: 18px; font-weight: 700; fill: #0f172a; }
      .stat-num-a  { font-size: 18px; font-weight: 700; fill: #2563eb; }
      .stat-label  { font-size: 9px;  font-weight: 500; fill: #64748b; letter-spacing: 0.04em; }
      .frame-label { font-size: 9px;  font-weight: 600; fill: #475569; text-anchor: middle; }
      .legend-text { font-size: 10px; font-weight: 500; fill: #334155; }
      .divider     { stroke: #e2e8f0; stroke-width: 1; }
      .frame-border  { fill: none; stroke: #cbd5e1; stroke-width: 1.2; }
      .iframe-border { fill: none; stroke: #2563eb; stroke-width: 1.5; }
      .pframe-border { fill: none; stroke: #94a3b8; stroke-width: 0.9; stroke-dasharray: 2.5 2; }
    `}</style>
  </defs>

  <rect width="1080" height="480" fill="#ffffff"/>

  
  <text x="60" y="44" className="fig-label">Figure 3</text>
  <text x="60" y="72" className="fig-title">Codec-aligned patch selection</text>
  <text x="60" y="94" className="fig-sub">Same 54-token budget. Codec-aligned selection covers 3&#215; the temporal range by keeping I-frames dense and P-frames sparse.</text>
  <line x1="60" y1="114" x2="1020" y2="114" className="divider"/>

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  <g transform="translate(60, 0)">
    <text x="0" y="146" className="panel-title">Uniform sampling</text>
    <text x="0" y="164" className="panel-sub">6 frames, every patch kept</text>

    
    
    <g transform="translate(67, 200)">
      
      <g transform="translate(0,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8321;</text>
      </g>
      <g transform="translate(54,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8322;</text>
      </g>
      <g transform="translate(108,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8323;</text>
      </g>
      <g transform="translate(162,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8324;</text>
      </g>
      <g transform="translate(216,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8325;</text>
      </g>
      <g transform="translate(270,0)">
        <rect width="36" height="36" className="frame-border" rx="2"/>
        <g fill="#3b82f6" opacity="0.85">
          <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
          <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
          <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
        </g>
        <text x="18" y="52" className="frame-label">f&#8326;</text>
      </g>
    </g>

    
    <line x1="67" y1="332" x2="373" y2="332" stroke="#94a3b8" strokeWidth="1.2"/>
    <polygon points="373,332 367,328.5 367,335.5" fill="#94a3b8"/>
    <text x="220" y="350" className="frame-label" fill="#64748b">time &#183; 6 frames</text>

    
    
    <text x="67"  y="396" className="stat-num">54</text>
    <text x="67"  y="414" className="stat-label">tokens</text>
    <text x="167" y="396" className="stat-num">6</text>
    <text x="167" y="414" className="stat-label">frames</text>
    <text x="247" y="396" className="stat-num">9</text>
    <text x="247" y="414" className="stat-label">patches / frame</text>
  </g>

  
  <line x1="540" y1="146" x2="540" y2="430" className="divider"/>

  
  <g transform="translate(580, 0)">
    <text x="0" y="146" className="panel-title">Codec-aligned selection</text>
    <text x="0" y="164" className="panel-sub">3 GOPs &#183; I-frames dense, P-frames keep motion patches only</text>

    
    <g transform="translate(68, 200)">
      
      <g transform="translate(0,0)">
        <g transform="translate(0,0)">
          <rect width="36" height="36" className="iframe-border" rx="2"/>
          <g fill="#2563eb" opacity="0.9">
            <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
            <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
            <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
          </g>
          <text x="18" y="52" className="frame-label" fill="#2563eb">I</text>
        </g>
        <g transform="translate(39,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="2"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(50,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="9"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(61,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="15" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><rect x="1" y="22" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(72,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="22" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(83,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="28" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        
        <line x1="0" y1="72" x2="91" y2="72" stroke="#cbd5e1" strokeWidth="1"/>
        <text x="45.5" y="88" className="frame-label" fill="#64748b">GOP&#8321;</text>
      </g>

      
      <g transform="translate(107,0)">
        <g transform="translate(0,0)">
          <rect width="36" height="36" className="iframe-border" rx="2"/>
          <g fill="#2563eb" opacity="0.9">
            <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
            <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
            <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
          </g>
          <text x="18" y="52" className="frame-label" fill="#2563eb">I</text>
        </g>
        <g transform="translate(39,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="5"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(50,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="12" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(61,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="18" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><rect x="1" y="25" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(72,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="25" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(83,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="2"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <line x1="0" y1="72" x2="91" y2="72" stroke="#cbd5e1" strokeWidth="1"/>
        <text x="45.5" y="88" className="frame-label" fill="#64748b">GOP&#8322;</text>
      </g>

      
      <g transform="translate(214,0)">
        <g transform="translate(0,0)">
          <rect width="36" height="36" className="iframe-border" rx="2"/>
          <g fill="#2563eb" opacity="0.9">
            <rect x="2"  y="2"  width="10" height="10" rx="1"/><rect x="13" y="2"  width="10" height="10" rx="1"/><rect x="24" y="2"  width="10" height="10" rx="1"/>
            <rect x="2"  y="13" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><rect x="24" y="13" width="10" height="10" rx="1"/>
            <rect x="2"  y="24" width="10" height="10" rx="1"/><rect x="13" y="24" width="10" height="10" rx="1"/><rect x="24" y="24" width="10" height="10" rx="1"/>
          </g>
          <text x="18" y="52" className="frame-label" fill="#2563eb">I</text>
        </g>
        <g transform="translate(39,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="9"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(50,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="15" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><rect x="1" y="22" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(61,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="22" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(72,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="28" width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <g transform="translate(83,0)"><rect width="8" height="36" className="pframe-border" rx="1.5"/><rect x="1" y="2"  width="6" height="6" rx="0.5" fill="#f59e0b" opacity="0.95"/><text x="4" y="52" className="frame-label">P</text></g>
        <line x1="0" y1="72" x2="91" y2="72" stroke="#cbd5e1" strokeWidth="1"/>
        <text x="45.5" y="88" className="frame-label" fill="#64748b">GOP&#8323;</text>
      </g>
    </g>

    
    <line x1="68" y1="332" x2="373" y2="332" stroke="#94a3b8" strokeWidth="1.2"/>
    <polygon points="373,332 367,328.5 367,335.5" fill="#94a3b8"/>
    <text x="220" y="350" className="frame-label" fill="#64748b">time &#183; 18 frames (3&#215; longer)</text>

    
    <text x="68"  y="396" className="stat-num">54</text>
    <text x="68"  y="414" className="stat-label">tokens</text>
    <text x="168" y="396" className="stat-num-a">18</text>
    <text x="168" y="414" className="stat-label">frames</text>
    <text x="248" y="396" className="stat-num-a">3&#215;</text>
    <text x="248" y="414" className="stat-label">temporal range</text>
  </g>

  
  <g transform="translate(60, 460)">
    
    <rect x="0"   y="-9" width="12" height="12" rx="1.5" fill="#3b82f6" opacity="0.85"/>
    <text x="18"  y="0"  className="legend-text">Uniform-frame patch</text>

    <rect x="240" y="-9" width="12" height="12" rx="1.5" fill="#2563eb" opacity="0.9"/>
    <text x="258" y="0"  className="legend-text">I-frame patch (dense)</text>

    <rect x="480" y="-9" width="12" height="12" rx="1.5" fill="#f59e0b" opacity="0.95"/>
    <text x="498" y="0"  className="legend-text">P-frame motion patch</text>

    <rect x="720" y="-9" width="12" height="12" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2.5 2"/>
    <text x="738" y="0"  className="legend-text">P-frame (mostly skipped)</text>
  </g>
</svg></div>
            <figcaption className="figure-caption">
              <span className="i18n" data-lang="en"><strong>Figure 3.</strong> Codec-style patch selection. Same 54-token budget as uniform sampling, but spans 3× the temporal range by keeping I-frames dense and skimming only motion-rich patches from P-frames.</span>
              <span className="i18n" data-lang="zh"><strong>图 3.</strong> Codec 风格的 patch 选择。与均匀采样使用同样的 54 token 预算，但通过保留 I 帧密集采样、仅从 P 帧抽取运动相关 patch，可覆盖 3 倍的时间范围。</span>
            </figcaption>
          </figure>

          <figure className="figure method-figure">
            <div className="method-figure-svg"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 530" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
  <defs>
    <style>{`
      .title { font-size: 17px; font-weight: 700; fill: #0f172a; }
      .subtitle { font-size: 11px; font-weight: 600; fill: #64748b; letter-spacing: 0.04em; text-transform: uppercase; }
      .panel-title { font-size: 13px; font-weight: 600; fill: #0f172a; }
      .panel-sub { font-size: 11px; font-weight: 400; fill: #64748b; }
      .stat-num { font-size: 18px; font-weight: 700; }
      .stat-label { font-size: 9px; font-weight: 500; fill: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
      .pos-label { font-size: 10px; font-weight: 700; font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; }
      .pos-num { font-size: 9px; font-weight: 500; font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; }
      .legend-text { font-size: 10px; font-weight: 500; fill: #334155; }
      .divider { stroke: #e2e8f0; stroke-width: 1; }

      @keyframes fig2-token-shimmer {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.25; transform: scale(0.7); }
      }
      @keyframes fig2-bar-pulse {
        0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
        50%      { opacity: 1;   transform: scaleY(1.15); }
      }
      @keyframes fig2-arrow-flow {
        0%   { opacity: 0.2; transform: translateY(-6px); }
        50%  { opacity: 1;   transform: translateY(2px); }
        100% { opacity: 0.2; transform: translateY(-6px); }
      }
      rect[fill="#f59e0b"][width="16"][height="16"] {
        transform-box: fill-box;
        transform-origin: center;
        animation: fig2-token-shimmer 1.8s ease-in-out infinite;
      }
      rect[fill="#2563eb"][width="16"][height="16"] {
        transform-box: fill-box;
        transform-origin: center;
        animation: fig2-token-shimmer 1.8s ease-in-out infinite;
        animation-delay: 0.9s;
      }
      rect[width="3"][height="94"][fill="#f59e0b"],
      rect[width="3"][height="94"][fill="#2563eb"],
      rect[width="3"][height="94"][fill="#0d9488"] {
        transform-box: fill-box;
        transform-origin: center;
        animation: fig2-bar-pulse 1.4s ease-in-out infinite;
      }
      rect[width="3"][height="94"][fill="#2563eb"] { animation-delay: 0.25s; }
      rect[width="3"][height="94"][fill="#0d9488"] { animation-delay: 0.5s; }
      polygon[points="536,112 544,112 540,118"] {
        transform-box: fill-box;
        transform-origin: center;
        animation: fig2-arrow-flow 1s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        rect[fill="#f59e0b"][width="16"][height="16"],
        rect[fill="#2563eb"][width="16"][height="16"],
        rect[width="3"][height="94"],
        polygon[points="536,112 544,112 540,118"] {
          animation: none !important;
        }
      }
    `}</style>
  </defs>
  <rect width="1080" height="466" fill="#ffffff"/>
  <text x="60" y="22" className="subtitle">Figure 4 · One Encoder, Every Modality</text>
  <text x="60" y="42" className="title">OneVision-Encoder · three input types, same token grid.</text>
  <text x="60" y="58" className="panel-sub">All three input types flow through the <tspan fontWeight="700" fill="#2563eb">same OneVision-Encoder</tspan> under shared <tspan fontWeight="700" fill="#0f172a" fontFamily="'SF Mono', 'Menlo', monospace">(t,&#8239;h,&#8239;w)</tspan> positions.</text>
  <line x1="60" y1="68" x2="1020" y2="68" className="divider"/>
  <rect x="60" y="76" width="960" height="26" rx="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.2"/>
  <text x="540" y="93.0" textAnchor="middle" className="panel-title">OneVision-Encoder · 24 Layers · shared <tspan fontFamily="'SF Mono', 'Menlo', monospace">(t,&#8239;h,&#8239;w)</tspan></text>
  <line x1="540" y1="106" x2="540" y2="112" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3"/>
  <polygon points="536,112 544,112 540,118" fill="#94a3b8"/>
  <g>
    <rect x="60" y="120" width="3" height="94" rx="1.5" fill="#f59e0b"/>
    <text x="471.5" y="134" textAnchor="middle" className="panel-title">Image</text>
    <text x="471.5" y="148" textAnchor="middle" className="panel-sub">1 frame · 9 patches · single time step</text>
    <text x="1020" y="136" textAnchor="end" className="stat-num" fill="#f59e0b">9</text>
    <text x="1020" y="148" textAnchor="end" className="stat-label">tokens</text>
    <rect x="138" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="159" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="180" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="201" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="222" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="243" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="264" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="285" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="306" y="158" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="327" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="348" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="369" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="390" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="411" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="432" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="453" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="474" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="495" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="516" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="537" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="558" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="579" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="600" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="621" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="642" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="663" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="684" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="705" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="726" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="747" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="768" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <rect x="789" y="158" width="16" height="16" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <text x="88" y="186" className="pos-label" fill="#9a3412">t:</text>
    <text x="146.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="167.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="188.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="209.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="230.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="251.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="272.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="293.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="314.0" y="186" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="88" y="198" className="pos-label" fill="#15803d">h:</text>
    <text x="146.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="167.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="188.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="209.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="230.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="251.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="272.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="293.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="314.0" y="198" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="88" y="210" className="pos-label" fill="#1d4ed8">w:</text>
    <text x="146.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="167.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="188.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="209.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="230.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="251.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="272.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="293.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="314.0" y="210" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
  </g>
  <g>
    <rect x="60" y="222" width="3" height="94" rx="1.5" fill="#2563eb"/>
    <text x="471.5" y="236" textAnchor="middle" className="panel-title">Uniform Frames</text>
    <text x="471.5" y="250" textAnchor="middle" className="panel-sub">8 frames sampled uniformly · 4 patches per frame</text>
    <text x="1020" y="238" textAnchor="end" className="stat-num" fill="#2563eb">32</text>
    <text x="1020" y="250" textAnchor="end" className="stat-label">tokens</text>
    <rect x="138" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="159" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="180" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="201" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="222" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="243" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="264" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="285" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="306" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="327" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="348" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="369" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="390" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="411" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="432" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="453" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="474" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="495" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="516" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="537" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="558" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="579" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="600" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="621" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="642" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="663" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="684" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="705" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="726" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="747" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="768" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <rect x="789" y="260" width="16" height="16" rx="1.5" fill="#2563eb" opacity="0.85"/>
    <text x="88" y="288" className="pos-label" fill="#9a3412">t:</text>
    <text x="146.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="167.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="188.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="209.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="230.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="251.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="272.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="293.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="314.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="335.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="356.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="377.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="398.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="419.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="440.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="461.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="482.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">4</text>
    <text x="503.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">4</text>
    <text x="524.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">4</text>
    <text x="545.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">4</text>
    <text x="566.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">5</text>
    <text x="587.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">5</text>
    <text x="608.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">5</text>
    <text x="629.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">5</text>
    <text x="650.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">6</text>
    <text x="671.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">6</text>
    <text x="692.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">6</text>
    <text x="713.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">6</text>
    <text x="734.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">7</text>
    <text x="755.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">7</text>
    <text x="776.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">7</text>
    <text x="797.0" y="288" textAnchor="middle" className="pos-num" fill="#9a3412">7</text>
    <text x="88" y="300" className="pos-label" fill="#15803d">h:</text>
    <text x="146.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="167.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="188.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="209.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="230.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="251.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="272.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="293.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="314.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="335.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="356.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="377.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="398.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="419.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="440.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="461.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="482.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="503.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="524.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="545.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="566.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="587.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="608.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="629.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="650.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="671.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="692.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="713.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="734.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="755.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="776.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="797.0" y="300" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="88" y="312" className="pos-label" fill="#1d4ed8">w:</text>
    <text x="146.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="167.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="188.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="209.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="230.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="251.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="272.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="293.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="314.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="335.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="356.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="377.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="398.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="419.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="440.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="461.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="482.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="503.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="524.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="545.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="566.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="587.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="608.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="629.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="650.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="671.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="692.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="713.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="734.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="755.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="776.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="797.0" y="312" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
  </g>
  <g>
    <rect x="60" y="324" width="3" height="94" rx="1.5" fill="#0d9488"/>
    <text x="471.5" y="338" textAnchor="middle" className="panel-title">Codec-Aligned</text>
    <text x="471.5" y="352" textAnchor="middle" className="panel-sub">24 frames · I-frame patches + P-frame motion patches</text>
    <text x="1020" y="340" textAnchor="end" className="stat-num" fill="#0d9488">32</text>
    <text x="1020" y="352" textAnchor="end" className="stat-label">tokens</text>
    <rect x="138" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="159" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="180" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="201" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="222" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="226.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="243" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="247.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="264" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="268.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="285" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="289.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="306" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="327" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="348" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="369" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="390" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="394.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="411" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="415.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="432" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="436.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="453" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="457.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="474" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="495" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="516" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="537" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="558" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="562.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="579" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="583.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="600" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="604.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="621" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="625.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="642" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="663" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="684" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="705" y="362" width="16" height="16" rx="1.5" fill="#f59e0b" opacity="0.9"/>
    <rect x="726" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="730.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="747" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="751.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="768" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="772.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <rect x="789" y="362" width="16" height="16" rx="1.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="793.5" y="366.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <text x="88" y="390" className="pos-label" fill="#9a3412">t:</text>
    <text x="146.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="167.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="188.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="209.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="230.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="251.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="272.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="293.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">0</text>
    <text x="314.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="335.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="356.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="377.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="398.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="419.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="440.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="461.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">1</text>
    <text x="482.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="503.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="524.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="545.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="566.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="587.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="608.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="629.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">2</text>
    <text x="650.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="671.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="692.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="713.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="734.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="755.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="776.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="797.0" y="390" textAnchor="middle" className="pos-num" fill="#9a3412">3</text>
    <text x="88" y="402" className="pos-label" fill="#15803d">h:</text>
    <text x="146.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="167.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="188.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="209.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="230.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="251.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="272.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="293.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="314.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="335.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="356.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="377.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="398.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="419.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="440.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="461.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="482.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="503.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="524.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="545.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="566.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="587.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="608.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="629.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="650.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="671.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">0</text>
    <text x="692.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="713.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="734.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="755.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="776.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">1</text>
    <text x="797.0" y="402" textAnchor="middle" className="pos-num" fill="#15803d">2</text>
    <text x="88" y="414" className="pos-label" fill="#1d4ed8">w:</text>
    <text x="146.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="167.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="188.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="209.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="230.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="251.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="272.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="293.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="314.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="335.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="356.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="377.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="398.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="419.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="440.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="461.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="482.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="503.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="524.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="545.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="566.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="587.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="608.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="629.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="650.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="671.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="692.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="713.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">1</text>
    <text x="734.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="755.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
    <text x="776.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">2</text>
    <text x="797.0" y="414" textAnchor="middle" className="pos-num" fill="#1d4ed8">0</text>
  </g>
  <line x1="60" y1="428" x2="1020" y2="428" className="divider"/>
  <g transform="translate(60, 446)">
    <rect x="0" y="-9" width="12" height="12" rx="2" fill="#f59e0b" opacity="0.9"/>
    <text x="18" y="0" className="legend-text">Image / I-frame patch</text>
    <rect x="180" y="-9" width="12" height="12" rx="2" fill="#2563eb" opacity="0.85"/>
    <text x="198" y="0" className="legend-text">Uniform frame patch</text>
    <rect x="360" y="-9" width="12" height="12" rx="2" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeDasharray="2 2"/>
    <rect x="362.5" y="-6.5" width="7" height="7" rx="1" fill="#f59e0b" opacity="0.9"/>
    <text x="378" y="0" className="legend-text">P-frame motion patch</text>
    <rect x="540" y="-9" width="12" height="12" rx="2" fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="1.5 1.5"/>
    <text x="558" y="0" className="legend-text">Empty slot</text>
  </g>
</svg></div>
            <figcaption className="figure-caption">
              <span className="i18n" data-lang="en"><strong>Figure 4.</strong> One encoder, three input modalities. Image, uniform-frame video, and codec-aligned video all flow through the same OneVision-Encoder under shared <code>(t, h, w)</code> positions.</span>
              <span className="i18n" data-lang="zh"><strong>图 4.</strong> 单一编码器统一处理三种模态输入。图像、均匀帧视频与 codec 对齐视频均通过同一 OneVision-Encoder，并共享 <code>(t, h, w)</code> 位置编码。</span>
            </figcaption>
          </figure>
        </section>


          <section className="section section-alt" id="benchmarks">
            <h3 className="toc-heading" id="benchmarks-heading">
              <span className="i18n" data-lang="en">Benchmarks</span>
              <span className="i18n" data-lang="zh">基准测试</span>
            </h3>

            <div className="bench-shell">
              {benchmarkGroups.map((group) => (
                  <div key={group.id} className="bench-card">
                    <div className="bench-caption">
                      <span className="bench-caption-bar" aria-hidden="true" />
                      <span className="bench-caption-label">
                        <span className="i18n" data-lang="en">{group.title}</span>
                        <span className="i18n" data-lang="zh">{group.title}</span>
                      </span>
                      <span className="bench-tag">Results</span>
                      <span className="bench-caption-note">
                        <span className="i18n" data-lang="en">{group.note}</span>
                        <span className="i18n" data-lang="zh">{group.note}</span>
                      </span>
                    </div>

                    <div className="bench-table-scroll">
                      <table className="bench-table">
                        <colgroup>
                          <col className="bench-col-name" />
                          {MODEL_COLUMNS.map((column, index) => (
                            <col key={column} className={index === 0 ? "bench-col-spa" : "bench-col-other"} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Benchmark</th>
                            {MODEL_COLUMNS.map((column, index) => {
                              const match = column.match(/^(.*?)\s+([^ ]+)$/);
                              const name = match ? match[1] : column;
                              const size = match ? match[2] : "";
                              return (
                                <th key={column} className={index === 0 ? "bench-col-hi" : undefined}>
                                  <div className="bench-th-name">{name}</div>
                                  {size && <div className="bench-th-size">{size}</div>}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => {
                            const isOpen = openBenchmark === row.id;

                            const numericScores = row.scores.map((s) => {
                              const n = parseFloat(s);
                              return Number.isFinite(n) ? n : null;
                            });
                            const validScores = numericScores.filter((n): n is number => n !== null);
                            const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
                            const sortedDesc = [...validScores].sort((a, b) => b - a);
                            const secondMaxScore = sortedDesc.find((v) => v < maxScore);

                            return (
                              <Fragment key={row.id}>
                                <tr className={row.isAverage ? "bench-avg" : "benchmark-row"}>
                                  <td>
                                    {row.summary ? (
                                      <button
                                        type="button"
                                        className={`bench-expand ${isOpen ? "expanded" : ""}`}
                                        aria-expanded={isOpen}
                                        onClick={() => toggleBenchmark(row.id)}
                                      >
                                        <span className="bench-expand-name">{row.name}</span>
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden="true"
                                          className="bench-expand-chevron"
                                        >
                                          <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                      </button>
                                    ) : (
                                      <span className="bench-name-plain">{row.name}</span>
                                    )}
                                  </td>
                                  {row.scores.map((score, index) => {
                                    const numeric = numericScores[index];
                                    const isMaxScore =
                                      numeric !== null && numeric === maxScore && validScores.length > 1;
                                    const isSecondScore =
                                      !isMaxScore &&
                                      secondMaxScore !== undefined &&
                                      numeric !== null &&
                                      numeric === secondMaxScore;
                                    const classes = [
                                      index === 0 ? "bench-col-hi bench-bold" : "",
                                      isMaxScore ? "bench-score-max" : "",
                                      isSecondScore ? "bench-score-second" : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ");
                                    const showChip = isMaxScore || isSecondScore;
                                    return (
                                      <td key={`${row.id}-${index}`} className={classes || undefined}>
                                        {showChip ? <span className="bench-score-chip">{score}</span> : score}
                                      </td>
                                    );
                                  })}
                                </tr>

                                {row.summary && isOpen && (
                                  <tr className="benchmark-detail-row">
                                    <td colSpan={7}>
                                      <div className="bench-detail-panel">
                                        <div className="bench-detail-charts">
                                          {(() => {
                                            const cd = BENCHMARK_CHARTS[row.id];
                                            if (!cd) return null;
                                            const hasRes = cd.resolution && cd.resolution.length > 0;
                                            const hasDur = cd.duration && cd.duration.bins && cd.duration.bins.length > 0;
                                            if (!hasRes && !hasDur) return null;
                                            return (
                                              <>
                                                {hasRes && (
                                                  <div className="bench-chart">
                                                    <div className="bench-chart-title">
                                                      <span className="i18n" data-lang="en">Resolution Distribution</span>
                                                      <span className="i18n" data-lang="zh">分辨率分布</span>
                                                    </div>
                                                    <div className="bench-chart-svg">
                                                      <ResolutionScatter
                                                        data={cd.resolution as ResolutionPoint[]}
                                                        ariaLabel={`Resolution distribution for ${row.name}`}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                                {hasDur && (
                                                  <div className="bench-chart">
                                                    <div className="bench-chart-title">
                                                      <span className="i18n" data-lang="en">{`Duration Distribution (${cd.duration?.unit ?? "s"})`}</span>
                                                      <span className="i18n" data-lang="zh">{`时长分布 (${cd.duration?.unit === "min" ? "分钟" : "秒"})`}</span>
                                                    </div>
                                                    <div className="bench-chart-svg">
                                                      <DurationHistogram
                                                        data={cd.duration}
                                                        ariaLabel={`Duration distribution for ${row.name}`}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                              </>
                                            );
                                          })()}
                                        </div>

                                        <div className="bench-detail-meta">
                                          <p className="bench-detail-summary">{row.summary}</p>
                                          {row.badges && row.badges.length > 0 && (
                                            <div className="bench-detail-badges">
                                              {row.badges.map((badge) => (
                                                <span key={badge} className="bench-tag">{badge}</span>
                                              ))}
                                            </div>
                                          )}
                                          {row.example && (
                                            <div className="bench-detail-example">
                                              <div className="bench-detail-example-label">{row.example.label}</div>
                                              <div className="bench-detail-example-qa">
                                                <strong>Q:</strong> {row.example.question}
                                              </div>
                                              <div className="bench-detail-example-qa bench-detail-example-answer">
                                                <strong>A:</strong> {row.example.answer}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="section" id="codec-vs-frame">
            <h3 className="toc-heading" id="codec-vs-frame-heading">
              <span className="i18n" data-lang="en">Codec vs Frame Sampling</span>
              <span className="i18n" data-lang="zh">编解码采样 vs 均匀帧采样</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              At equal token budgets, codec-stream input consistently wins under tight frame budgets — exactly the regime where uniform sampling fails the model.
            </p>

            <figure className="figure chart-figure">
              <div className="cvf-figure">
                <div className="cvf-figure-head">
                  <span className="cvf-figure-eyebrow">Figure · Codec vs Frame</span>
                  <span className="cvf-figure-title">Codec sampling unlocks low-frame regimes.</span>
                </div>
                <div className="cvf-grid-wrap">
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>QVHighlights: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">QVHighlights</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 4 frames: <tspan fontWeight={700} fill="#0d9488">+15.4</tspan>  ·  @ 64 frames: <tspan fontWeight={700} fill="#0d9488">+1.8</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">10</text><line x1="0" y1="153" x2="276" y2="153" className="cvf-grid" /><text x="-6" y="156" className="cvf-axis-label" textAnchor="end">20</text><line x1="0" y1="123" x2="276" y2="123" className="cvf-grid" /><text x="-6" y="126" className="cvf-axis-label" textAnchor="end">30</text><line x1="0" y1="93" x2="276" y2="93" className="cvf-grid" /><text x="-6" y="96" className="cvf-axis-label" textAnchor="end">40</text><line x1="0" y1="63" x2="276" y2="63" className="cvf-grid" /><text x="-6" y="66" className="cvf-axis-label" textAnchor="end">50</text><line x1="0" y1="33" x2="276" y2="33" className="cvf-grid" /><text x="-6" y="36" className="cvf-axis-label" textAnchor="end">60</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">70</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">4</text><line x1="69" y1="0" x2="69" y2="180" className="cvf-grid" /><text x="69" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="138" y1="0" x2="138" y2="180" className="cvf-grid" /><text x="138" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="207" y1="0" x2="207" y2="180" className="cvf-grid" /><text x="207" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">64</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,173.1 69,140.1 138,135.3 207,50.4 276,24.9 276,19.5 207,32.4 138,55.5 69,88.8 0,126.9" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,173.1 69,140.1 138,135.3 207,50.4 276,24.9" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,126.9 69,88.8 138,55.5 207,32.4 276,19.5" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="173.1" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="69" cy="140.1" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="138" cy="135.3" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="207" cy="50.4" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="24.9" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="126.9" r={4} fill="#2563eb" /><circle cx="69" cy="88.8" r={4} fill="#2563eb" /><circle cx="138" cy="55.5" r={4} fill="#2563eb" /><circle cx="207" cy="32.4" r={4} fill="#2563eb" /><circle cx="276" cy="19.5" r={4} fill="#2563eb" />
                      <text x="6" y="120.9" className="cvf-data-label" fill="#2563eb" textAnchor="start">27.7</text><text x="6" y="167.1" className="cvf-data-label" fill="#64748b" textAnchor="start">12.3</text><text x="270" y="13.5" className="cvf-data-label" fill="#2563eb" textAnchor="end">63.5</text><text x="270" y="18.9" className="cvf-data-label" fill="#64748b" textAnchor="end">61.7</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>Charades-STA: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">Charades-STA</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 4 frames: <tspan fontWeight={700} fill="#0d9488">+25.0</tspan>  ·  @ 64 frames: <tspan fontWeight={700} fill="#dc2626">-3.4</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">15</text><line x1="0" y1="138" x2="276" y2="138" className="cvf-grid" /><text x="-6" y="141" className="cvf-axis-label" textAnchor="end">25</text><line x1="0" y1="93" x2="276" y2="93" className="cvf-grid" /><text x="-6" y="96" className="cvf-axis-label" textAnchor="end">35</text><line x1="0" y1="48" x2="276" y2="48" className="cvf-grid" /><text x="-6" y="51" className="cvf-axis-label" textAnchor="end">45</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">55</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">4</text><line x1="69" y1="0" x2="69" y2="180" className="cvf-grid" /><text x="69" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="138" y1="0" x2="138" y2="180" className="cvf-grid" /><text x="138" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="207" y1="0" x2="207" y2="180" className="cvf-grid" /><text x="207" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">64</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,169.2 69,80.55 138,31.05 207,8.55 276,6.75 276,22.05 207,22.95 138,18 69,30.6 0,56.7" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,169.2 69,80.55 138,31.05 207,8.55 276,6.75" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,56.7 69,30.6 138,18 207,22.95 276,22.05" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="169.2" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="69" cy="80.55" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="138" cy="31.05" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="207" cy="8.55" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="6.75" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="56.7" r={4} fill="#2563eb" /><circle cx="69" cy="30.6" r={4} fill="#2563eb" /><circle cx="138" cy="18" r={4} fill="#2563eb" /><circle cx="207" cy="22.95" r={4} fill="#2563eb" /><circle cx="276" cy="22.05" r={4} fill="#2563eb" />
                      <text x="6" y="50.7" className="cvf-data-label" fill="#2563eb" textAnchor="start">42.4</text><text x="6" y="163.2" className="cvf-data-label" fill="#64748b" textAnchor="start">17.4</text><text x="270" y="16.05" className="cvf-data-label" fill="#2563eb" textAnchor="end">50.1</text><text x="270" y="0.75" className="cvf-data-label" fill="#64748b" textAnchor="end">53.5</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>ActivityNet: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">ActivityNet</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 4 frames: <tspan fontWeight={700} fill="#0d9488">+11.1</tspan>  ·  @ 64 frames: <tspan fontWeight={700} fill="#0d9488">+2.3</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">10</text><line x1="0" y1="147" x2="276" y2="147" className="cvf-grid" /><text x="-6" y="150" className="cvf-axis-label" textAnchor="end">20</text><line x1="0" y1="111" x2="276" y2="111" className="cvf-grid" /><text x="-6" y="114" className="cvf-axis-label" textAnchor="end">30</text><line x1="0" y1="75" x2="276" y2="75" className="cvf-grid" /><text x="-6" y="78" className="cvf-axis-label" textAnchor="end">40</text><line x1="0" y1="39" x2="276" y2="39" className="cvf-grid" /><text x="-6" y="42" className="cvf-axis-label" textAnchor="end">50</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">60</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">4</text><line x1="69" y1="0" x2="69" y2="180" className="cvf-grid" /><text x="69" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="138" y1="0" x2="138" y2="180" className="cvf-grid" /><text x="138" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="207" y1="0" x2="207" y2="180" className="cvf-grid" /><text x="207" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">64</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,172 69,146 138,107.6 207,60.4 276,24.4 276,15.2 207,30 138,57.6 69,92.8 0,127.6" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,172 69,146 138,107.6 207,60.4 276,24.4" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,127.6 69,92.8 138,57.6 207,30 276,15.2" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="172" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="69" cy="146" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="138" cy="107.6" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="207" cy="60.4" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="24.4" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="127.6" r={4} fill="#2563eb" /><circle cx="69" cy="92.8" r={4} fill="#2563eb" /><circle cx="138" cy="57.6" r={4} fill="#2563eb" /><circle cx="207" cy="30" r={4} fill="#2563eb" /><circle cx="276" cy="15.2" r={4} fill="#2563eb" />
                      <text x="6" y="121.6" className="cvf-data-label" fill="#2563eb" textAnchor="start">23.1</text><text x="6" y="166" className="cvf-data-label" fill="#64748b" textAnchor="start">12.0</text><text x="270" y="9.2" className="cvf-data-label" fill="#2563eb" textAnchor="end">51.2</text><text x="270" y="18.4" className="cvf-data-label" fill="#64748b" textAnchor="end">48.9</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>LVBench: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">LVBench</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 16 frames: <tspan fontWeight={700} fill="#0d9488">+2.0</tspan>  ·  @ 128 frames: <tspan fontWeight={700} fill="#0d9488">+1.8</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">36</text><line x1="0" y1="138" x2="276" y2="138" className="cvf-grid" /><text x="-6" y="141" className="cvf-axis-label" textAnchor="end">40</text><line x1="0" y1="93" x2="276" y2="93" className="cvf-grid" /><text x="-6" y="96" className="cvf-axis-label" textAnchor="end">44</text><line x1="0" y1="48" x2="276" y2="48" className="cvf-grid" /><text x="-6" y="51" className="cvf-axis-label" textAnchor="end">48</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">52</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="92" y1="0" x2="92" y2="180" className="cvf-grid" /><text x="92" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="184" y1="0" x2="184" y2="180" className="cvf-grid" /><text x="184" y="194" className="cvf-axis-label" textAnchor="middle">64</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">128</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,147.375 92,117 184,72 276,48.375 276,28.125 184,55.125 92,102.375 0,124.875" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,147.375 92,117 184,72 276,48.375" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,124.875 92,102.375 184,55.125 276,28.125" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="147.375" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="92" cy="117" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="184" cy="72" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="48.375" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="124.875" r={4} fill="#2563eb" /><circle cx="92" cy="102.375" r={4} fill="#2563eb" /><circle cx="184" cy="55.125" r={4} fill="#2563eb" /><circle cx="276" cy="28.125" r={4} fill="#2563eb" />
                      <text x="6" y="118.875" className="cvf-data-label" fill="#2563eb" textAnchor="start">40.9</text><text x="6" y="141.375" className="cvf-data-label" fill="#64748b" textAnchor="start">38.9</text><text x="270" y="22.125" className="cvf-data-label" fill="#2563eb" textAnchor="end">49.5</text><text x="270" y="42.375" className="cvf-data-label" fill="#64748b" textAnchor="end">47.7</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>VideoMME-long (w/ sub): codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">VideoMME-long (w/ sub)</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 8 frames: <tspan fontWeight={700} fill="#0d9488">+1.5</tspan>  ·  @ 128 frames: <tspan fontWeight={700} fill="#dc2626">-0.1</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">50</text><line x1="0" y1="147" x2="276" y2="147" className="cvf-grid" /><text x="-6" y="150" className="cvf-axis-label" textAnchor="end">54</text><line x1="0" y1="111" x2="276" y2="111" className="cvf-grid" /><text x="-6" y="114" className="cvf-axis-label" textAnchor="end">58</text><line x1="0" y1="75" x2="276" y2="75" className="cvf-grid" /><text x="-6" y="78" className="cvf-axis-label" textAnchor="end">62</text><line x1="0" y1="39" x2="276" y2="39" className="cvf-grid" /><text x="-6" y="42" className="cvf-axis-label" textAnchor="end">66</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">70</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="69" y1="0" x2="69" y2="180" className="cvf-grid" /><text x="69" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="138" y1="0" x2="138" y2="180" className="cvf-grid" /><text x="138" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="207" y1="0" x2="207" y2="180" className="cvf-grid" /><text x="207" y="194" className="cvf-axis-label" textAnchor="middle">64</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">128</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,134.1 69,110.7 138,72 207,46.8 276,26.1 276,27 207,23.4 138,77.4 69,87.3 0,120.6" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,134.1 69,110.7 138,72 207,46.8 276,26.1" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,120.6 69,87.3 138,77.4 207,23.4 276,27" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="134.1" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="69" cy="110.7" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="138" cy="72" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="207" cy="46.8" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="26.1" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="120.6" r={4} fill="#2563eb" /><circle cx="69" cy="87.3" r={4} fill="#2563eb" /><circle cx="138" cy="77.4" r={4} fill="#2563eb" /><circle cx="207" cy="23.4" r={4} fill="#2563eb" /><circle cx="276" cy="27" r={4} fill="#2563eb" />
                      <text x="6" y="114.6" className="cvf-data-label" fill="#2563eb" textAnchor="start">56.6</text><text x="6" y="128.1" className="cvf-data-label" fill="#64748b" textAnchor="start">55.1</text><text x="270" y="21" className="cvf-data-label" fill="#2563eb" textAnchor="end">67.0</text><text x="270" y="20.1" className="cvf-data-label" fill="#64748b" textAnchor="end">67.1</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>VideoEval-Pro: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">VideoEval-Pro</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 8 frames: <tspan fontWeight={700} fill="#0d9488">+3.3</tspan>  ·  @ 128 frames: <tspan fontWeight={700} fill="#0d9488">+1.8</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">42</text><line x1="0" y1="138" x2="276" y2="138" className="cvf-grid" /><text x="-6" y="141" className="cvf-axis-label" textAnchor="end">46</text><line x1="0" y1="93" x2="276" y2="93" className="cvf-grid" /><text x="-6" y="96" className="cvf-axis-label" textAnchor="end">50</text><line x1="0" y1="48" x2="276" y2="48" className="cvf-grid" /><text x="-6" y="51" className="cvf-axis-label" textAnchor="end">54</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">58</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="69" y1="0" x2="69" y2="180" className="cvf-grid" /><text x="69" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="138" y1="0" x2="138" y2="180" className="cvf-grid" /><text x="138" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="207" y1="0" x2="207" y2="180" className="cvf-grid" /><text x="207" y="194" className="cvf-axis-label" textAnchor="middle">64</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">128</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,167.625 69,148.5 138,105.75 207,64.125 276,45 276,24.75 207,46.125 138,72 69,109.125 0,130.5" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,167.625 69,148.5 138,105.75 207,64.125 276,45" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,130.5 69,109.125 138,72 207,46.125 276,24.75" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="167.625" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="69" cy="148.5" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="138" cy="105.75" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="207" cy="64.125" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="45" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="130.5" r={4} fill="#2563eb" /><circle cx="69" cy="109.125" r={4} fill="#2563eb" /><circle cx="138" cy="72" r={4} fill="#2563eb" /><circle cx="207" cy="46.125" r={4} fill="#2563eb" /><circle cx="276" cy="24.75" r={4} fill="#2563eb" />
                      <text x="6" y="124.5" className="cvf-data-label" fill="#2563eb" textAnchor="start">46.4</text><text x="6" y="161.625" className="cvf-data-label" fill="#64748b" textAnchor="start">43.1</text><text x="270" y="18.75" className="cvf-data-label" fill="#2563eb" textAnchor="end">55.8</text><text x="270" y="39" className="cvf-data-label" fill="#64748b" textAnchor="end">54.0</text>
                    </g>
                  </svg>
                </div>
                <div className="cvf-cell">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 278" fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif">
                    <title>JumpScore: codec vs uniform sampling</title>
                    <text x="159" y="16" className="cvf-panel-title" textAnchor="middle">JumpScore</text>
                    <text x="159" y="32" className="cvf-panel-sub" textAnchor="middle">@ 4 frames: <tspan fontWeight={700} fill="#0d9488">+6.9</tspan>  ·  @ 128 frames: <tspan fontWeight={700} fill="#0d9488">+29.5</tspan></text>
                    <g transform="translate(36,52)">
                      <line x1="0" y1="183" x2="276" y2="183" className="cvf-grid" /><text x="-6" y="186" className="cvf-axis-label" textAnchor="end">30</text><line x1="0" y1="147" x2="276" y2="147" className="cvf-grid" /><text x="-6" y="150" className="cvf-axis-label" textAnchor="end">40</text><line x1="0" y1="111" x2="276" y2="111" className="cvf-grid" /><text x="-6" y="114" className="cvf-axis-label" textAnchor="end">50</text><line x1="0" y1="75" x2="276" y2="75" className="cvf-grid" /><text x="-6" y="78" className="cvf-axis-label" textAnchor="end">60</text><line x1="0" y1="39" x2="276" y2="39" className="cvf-grid" /><text x="-6" y="42" className="cvf-axis-label" textAnchor="end">70</text><line x1="0" y1="3" x2="276" y2="3" className="cvf-grid" /><text x="-6" y="6" className="cvf-axis-label" textAnchor="end">80</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-grid" /><text x="0" y="194" className="cvf-axis-label" textAnchor="middle">4</text><line x1="55.2" y1="0" x2="55.2" y2="180" className="cvf-grid" /><text x="55.2" y="194" className="cvf-axis-label" textAnchor="middle">8</text><line x1="110.4" y1="0" x2="110.4" y2="180" className="cvf-grid" /><text x="110.4" y="194" className="cvf-axis-label" textAnchor="middle">16</text><line x1="165.6" y1="0" x2="165.6" y2="180" className="cvf-grid" /><text x="165.6" y="194" className="cvf-axis-label" textAnchor="middle">32</text><line x1="220.8" y1="0" x2="220.8" y2="180" className="cvf-grid" /><text x="220.8" y="194" className="cvf-axis-label" textAnchor="middle">64</text><line x1="276" y1="0" x2="276" y2="180" className="cvf-grid" /><text x="276" y="194" className="cvf-axis-label" textAnchor="middle">128</text>
                      <line x1="0" y1="0" x2="0" y2="180" className="cvf-axis" />
                      <line x1="0" y1="180" x2="276" y2="180" className="cvf-axis" />
                      <text x="138" y="212" className="cvf-axis-title" textAnchor="middle">frame budget (log scale)</text>
                      <text transform="translate(-28,90) rotate(-90)" className="cvf-axis-title" textAnchor="middle">metric</text>
                      <polygon points="0,171 55.2,161.28 110.4,155.88 165.6,152.64 220.8,144.36 276,124.56 276,18.36 220.8,31.32 165.6,78.12 110.4,119.16 55.2,143.28 0,146.16" fill="#2563eb" opacity="0.08" />
                      <polyline points="0,171 55.2,161.28 110.4,155.88 165.6,152.64 220.8,144.36 276,124.56" fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
                      <polyline points="0,146.16 55.2,143.28 110.4,119.16 165.6,78.12 220.8,31.32 276,18.36" fill="none" stroke="#2563eb" strokeWidth={2.2} />
                      <circle cx="0" cy="171" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="55.2" cy="161.28" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="110.4" cy="155.88" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="165.6" cy="152.64" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="220.8" cy="144.36" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /><circle cx="276" cy="124.56" r={3.5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} />
                      <circle cx="0" cy="146.16" r={4} fill="#2563eb" /><circle cx="55.2" cy="143.28" r={4} fill="#2563eb" /><circle cx="110.4" cy="119.16" r={4} fill="#2563eb" /><circle cx="165.6" cy="78.12" r={4} fill="#2563eb" /><circle cx="220.8" cy="31.32" r={4} fill="#2563eb" /><circle cx="276" cy="18.36" r={4} fill="#2563eb" />
                      <text x="6" y="140.16" className="cvf-data-label" fill="#2563eb" textAnchor="start">39.4</text><text x="6" y="165" className="cvf-data-label" fill="#64748b" textAnchor="start">32.5</text><text x="270" y="12.36" className="cvf-data-label" fill="#2563eb" textAnchor="end">74.9</text><text x="270" y="118.56" className="cvf-data-label" fill="#64748b" textAnchor="end">45.4</text>
                    </g>
                  </svg>
                </div>
                </div>
                <div className="cvf-legend-row" aria-hidden="true">
                  <span className="cvf-legend-item">
                    <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"><title>codec</title><line x1="2" y1="5" x2="24" y2="5" stroke="#2563eb" strokeWidth={2.2} /><circle cx="13" cy="5" r={3.5} fill="#2563eb" /></svg>
                    <span className="cvf-legend-label">Codec</span>
                  </span>
                  <span className="cvf-legend-item">
                    <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"><title>uniform</title><line x1="2" y1="5" x2="24" y2="5" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" /><circle cx="13" cy="5" r={3} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.6} /></svg>
                    <span className="cvf-legend-label">Uniform</span>
                  </span>
                  <span className="cvf-legend-item">
                    <span className="cvf-legend-swatch cvf-legend-swatch-adv" />
                    <span className="cvf-legend-label">Advantage</span>
                  </span>
                </div>
              </div>
              <figcaption className="figure-caption">
                <strong>Figure.</strong> Codec-stream input vs uniform frame sampling across seven video and temporal grounding benchmarks. At equal token budgets, codec sampling wins under tight frame budgets — the largest gains appear at the lowest frame counts.
              </figcaption>
            </figure>
          </section>

          <section className="section section-alt" id="video-caption-dataset">
            <h3 className="toc-heading" id="video-caption-dataset-heading">
              <span className="i18n" data-lang="en">Video Caption Dataset</span>
              <span className="i18n" data-lang="zh">视频描述数据集</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              A length-stratified video caption corpus spanning 30 seconds to 15 minutes, totaling roughly 8M captioned clips, 95.1B image tokens, and 9.9B caption tokens.
            </p>

            <div className="table-scroll">
              <table className="dataset-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Samples</th>
                    <th>Storage</th>
                    <th>Image Tokens</th>
                    <th>Caption Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bucket-col">30s caption</td>
                    <td className="bar-cell" style={{ "--bar-width": "100%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">4.2M</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "44.615%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">29 TB</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "77.673%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">24.7B</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "75%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">3.0B</span></td>
                  </tr>
                  <tr>
                    <td className="bucket-col">30–60s video caption</td>
                    <td className="bar-cell" style={{ "--bar-width": "64.286%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">2.7M</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "49.231%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">32 TB</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "100%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">31.8B</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "57.5%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">2.3B</span></td>
                  </tr>
                  <tr>
                    <td className="bucket-col">60–180s video caption</td>
                    <td className="bar-cell" style={{ "--bar-width": "16.667%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">700K</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "20%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">13 TB</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "38.679%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">12.3B</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "17.5%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">0.7B</span></td>
                  </tr>
                  <tr>
                    <td className="bucket-col">10–15min caption</td>
                    <td className="bar-cell" style={{ "--bar-width": "8.333%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">350K</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "100%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">65 TB</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "82.704%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">26.3B</span></td>
                    <td className="bar-cell" style={{ "--bar-width": "100%" } as React.CSSProperties}><span className="bar-bg"></span><span className="val">4.0B</span></td>
                  </tr>
                  <tr className="dataset-total">
                    <td className="bucket-col">Total</td>
                    <td>~8M</td>
                    <td>~139 TB</td>
                    <td>95.1B</td>
                    <td>9.9B</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="data-note">
              Image tokens are computed at 392×392 input, ViT patch size 14, and vision merge size 2×2 for 196 visual tokens per frame. Caption tokens are measured with the Qwen3 tokenizer over 1,500 sampled clips per bucket, then scaled by row count.
            </p>
          </section>

          <section className="section" id="training-pipeline">
            <h3 className="toc-heading" id="training-pipeline-heading">
              <span className="i18n" data-lang="en">Training Pipeline</span>
              <span className="i18n" data-lang="zh">训练流程</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              The full LLaVA-OneVision-2 recipe runs in four stages — each stage upgrades a different capability of the model. No instruction data is synthesized; the only synthesized data are video captions.
            </p>

            <div className="stage-grid">
              {stageCards.map((stage, stageIdx) => (
                <article key={stage.id} className="stage-card" id={stage.id}>
                  <div className="stage-rail">
                    <span className="stage-pill">{stage.pill}</span>
                    {stageIdx < stageCards.length - 1 && <span className="stage-connector" aria-hidden="true" />}
                  </div>
                  <div className="stage-body">
                    <h3 className="stage-title">{stage.title}</h3>
                    <p className="stage-subtitle">{stage.subtitle}</p>
                    <ul className="stage-list">
                      {stage.lines.map((line) => {
                        const isNew = /\(new\)\s*$/.test(line);
                        const clean = line.replace(/\s*\(new\)\s*$/, "");
                        const idxMatch = clean.match(/^\(([a-z])\)\s*/i);
                        const idx = idxMatch ? idxMatch[1] : "";
                        const rest = idxMatch ? clean.slice(idxMatch[0].length) : clean;
                        const dashIdx = rest.indexOf(" — ");
                        const name = dashIdx >= 0 ? rest.slice(0, dashIdx) : rest;
                        const desc = dashIdx >= 0 ? rest.slice(dashIdx + 3) : "";
                        return (
                          <li key={line} className={`stage-item${isNew ? " is-new" : ""}`}>
                            {idx && <span className="stage-item-idx">{idx}</span>}
                            <span className="stage-item-text">
                              <span className="stage-item-name">{name}</span>
                              {desc && <span className="stage-item-desc"> — {desc}</span>}
                            </span>
                            {isNew && <span className="stage-item-badge">NEW</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section section-alt" id="visual-encoder">
            <h3 className="toc-heading" id="visual-encoder-heading">
              <span className="i18n" data-lang="en">Visual Encoder Pretraining (OneVision-Encoder)</span>
              <span className="i18n" data-lang="zh">视觉编码器预训练（OneVision-Encoder）</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              OneVision-Encoder extends native-resolution training to longer aspect ratios and pushes context capacity for high-density documents and frame-rich video.
            </p>

            <figure className="figure image-figure">
              <img src="/posts/llava_onevision_2/arch.png" alt="OneVision-Encoder architecture overview" className="full-image" />
              <figcaption className="figure-caption">Figure 6. OneVision-Encoder architecture overview.</figcaption>
            </figure>
          </section>

          <section className="section" id="open-source-resources">
            <h3 className="toc-heading" id="open-source-resources-heading">
              <span className="i18n" data-lang="en">Open-Source Resources</span>
              <span className="i18n" data-lang="zh">开源资源</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              The OV2 site ships a small but complete release stack: training code, a public demo surface, the 8B instruct checkpoint, and the full training dataset collection.
            </p>

            <div className="resource-grid">
              {resources.map((group) => (
                <div key={group.title} className="resource-group">
                  <h3>{group.title}</h3>
                  <div className="resource-items">
                    {group.items.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={`resource-item resource-item-${item.icon}`}>
                        <span className="resource-icon" aria-hidden="true">{resourceIcons[item.icon]}</span>
                        <div className="resource-content">
                          <div className="resource-top">
                            <strong>{item.label}</strong>
                            <span className="resource-badge">{item.badge}</span>
                          </div>
                          <p className="resource-meta">{item.meta}</p>
                          <span className="resource-host">{item.host}</span>
                        </div>
                        <span className="resource-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 17 17 7M9 7h8v8" />
                          </svg>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section section-alt" id="code-demos">
            <h3 className="toc-heading" id="code-demos-heading">
              <span className="i18n" data-lang="en">Code Demos</span>
              <span className="i18n" data-lang="zh">代码示例</span>
            </h3>
            <p className="section-copy" style={{ marginTop: "-2px" }}>
              <span className="i18n" data-lang="en">
                Run <code className="inline-code">LLaVA-OneVision-2-8B-Instruct</code> from a HuggingFace <code className="inline-code">transformers</code> checkpoint
                (<code className="inline-code">trust_remote_code=True</code>). Two video backends are available: uniform frame sampling, and a codec-aware
                canvas-packing backend recommended for long videos.
              </span>
              <span className="i18n" data-lang="zh">
                以 HuggingFace <code className="inline-code">transformers</code> 权重运行 <code className="inline-code">LLaVA-OneVision-2-8B-Instruct</code>
                （需 <code className="inline-code">trust_remote_code=True</code>）。提供两种视频后端：均匀抽帧，以及面向长视频推荐的 codec 画布打包后端。
              </span>
            </p>

            <div className="code-panel">
              <div className="code-panel-tabs" role="tablist" aria-label="Code examples">
                {codeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCodeTab === tab.id}
                    className={`code-panel-tab${activeCodeTab === tab.id ? " active" : ""}`}
                    onClick={() => setActiveCodeTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {codeTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`code-demo${activeCodeTab === tab.id ? " active" : ""}`}
                  role="tabpanel"
                  hidden={activeCodeTab !== tab.id}
                >
                  <div className="code-toolbar">
                    <div className="code-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="code-title">{tab.file}</div>
                    <div className="code-actions">
                      <span className="code-lang">{tab.lang}</span>
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => handleCopy(`code-${tab.id}`, tab.code)}
                      >
                        {copiedBlock === `code-${tab.id}` ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="11" height="11" rx="2" />
                              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="code-body">
                    <pre>
                      <code>{tab.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="task-demos">
            <h3 className="toc-heading" id="task-demos-heading" style={{ marginTop: "2.4rem" }}>
              <span className="i18n" data-lang="en">Task Demos</span>
              <span className="i18n" data-lang="zh">任务演示</span>
            </h3>
            <p className="demo-pane-intro">
              Qualitative results across four downstream capabilities: temporal grounding, referring video segmentation and tracking, spatial grounding, and real-world video manipulation.
            </p>

            <div className="demo-gallery">
              <div className="demo-sections">
                {taskDemoSections.map((section) => {
                  const currentIndex = carouselIndex[section.id] ?? 0;
                  const total = section.slides.length;
                  const hasMultipleSlides = total > 1;

                  return (
                    <div key={section.id} className="demo-section">
                      <div className="demo-section-header">
                        <span className="demo-section-bar" />
                        <span className="demo-section-cap">{section.title}</span>
                        <span className="demo-section-source">{section.source}</span>
                      </div>

                      <div className="demo-carousel">
                        {hasMultipleSlides && (
                          <>
                            <button
                              type="button"
                              className="demo-carousel-arrow demo-carousel-arrow-prev"
                              onClick={() => moveCarousel(section.id, -1, total)}
                              disabled={currentIndex === 0}
                              aria-label="Previous page"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="demo-carousel-arrow demo-carousel-arrow-next"
                              onClick={() => moveCarousel(section.id, 1, total)}
                              disabled={currentIndex === total - 1}
                              aria-label="Next page"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </>
                        )}

                        <div className="demo-carousel-viewport">
                          <div className="demo-carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                            {section.slides.map((slide, slideIndex) => (
                              <article key={`${section.id}-slide-${slideIndex}`} className="demo-slide">
                                {slide.map((card) => (
                                  <div key={card.question} className="demo-grid-cell">
                                    {card.stripe && (
                                      <div className={`demo-grid-subtype-stripe spatial-${card.stripeTone ?? "2d"}`}>{card.stripe}</div>
                                    )}
                                    <div className="demo-grid-row" style={{ paddingBottom: ".75rem" }}>
                                      <div className="demo-grid-tag demo-grid-tag-q">Q</div>
                                      <p className="demo-grid-q-body">{card.question}</p>
                                    </div>

                                    <div className={`demo-grid-medias${card.medias.length === 1 ? " single" : ""}`}>
                                      {card.medias.map((media) => (
                                        <div key={`${card.question}-${media.src}`} className="demo-grid-media-block">
                                          <div className="demo-grid-media-head">
                                            <span className={`demo-grid-tag demo-grid-tag-${media.tag.toLowerCase() === "a" ? "a" : "i"}`}>{media.tag}</span>
                                            <span className="demo-grid-media-head-label">{media.label}</span>
                                          </div>
                                          <div className="demo-grid-a-media">{renderMedia(media)}</div>
                                          <p className="demo-grid-a-caption">{media.caption}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </article>
                            ))}
                          </div>
                        </div>

                        {hasMultipleSlides && (
                          <div className="demo-carousel-nav">
                            <div className="demo-carousel-dots">
                              {section.slides.map((_, index) => (
                                <button
                                  key={`${section.id}-${index}`}
                                  type="button"
                                  className={`demo-carousel-dot${index === currentIndex ? " active" : ""}`}
                                  onClick={() => jumpCarousel(section.id, index)}
                                  aria-label={`Go to page ${index + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="section section-alt" id="citation">
            <h3 className="toc-heading" id="citation-heading">
              <span className="i18n" data-lang="en">Citation</span>
              <span className="i18n" data-lang="zh">引用</span>
            </h3>

            <div className="code-demo citation-block">
              <div className="code-toolbar">
                <div className="code-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="code-title">citation.bib</div>
                <div className="code-actions">
                  <span className="code-lang">bibtex</span>
                  <button type="button" className="copy-button" onClick={() => handleCopy("citation", bibtex)}>
                    {copiedBlock === "citation" ? "Copied" : "Copy BibTeX"}
                  </button>
                </div>
              </div>
              <div className="code-body">
                <pre>
                  <code>{bibtex}</code>
                </pre>
              </div>
            </div>
          </section>

          <section className="section" id="references">
            <h3 className="toc-heading" id="references-heading">
              <span className="i18n" data-lang="en">References</span>
              <span className="i18n" data-lang="zh">参考文献</span>
            </h3>

            <ol className="reference-list">
              {references.map((reference, index) => (
                <li key={reference.title} className="reference-item">
                  <span className="reference-index" aria-hidden="true">{index + 1}</span>
                  <div className="reference-body">
                    <span className="reference-title">{reference.title}</span>
                    <span className="reference-authors">{reference.authors}</span>
                    <div className="reference-foot">
                      <span className="reference-venue">
                        {reference.venue} · {reference.year}
                      </span>
                      <a href={reference.href} target="_blank" rel="noopener noreferrer" className="reference-link">
                        <span>{reference.linkLabel}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
