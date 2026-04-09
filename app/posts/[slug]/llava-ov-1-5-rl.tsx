"use client";

import { useState } from "react";
import { RLDonutCharts } from "@/components/mdx/RLDonutCharts";
import "./llava-ov-1-5.css";

export default function LlavaOV15RLPage({ post }: { post: any }) {
  const { title, date, mainTags } = post;
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const bibtex1 = `@inproceedings{LLaVA-OneVision-1.5,
  title={LLaVA-OneVision-1.5: Fully Open Framework for Democratized Multimodal Training},
  author={An, Xiang and Xie, Yin and Yang, Kaicheng and Zhang, Wenkang and Zhao, Xiuwei and Cheng, Zheng and Wang, Yirui and Xu, Songcen and Chen, Changrui and Wu, Chunsheng and Tan, Huajie and Li, Chunyuan and Yang, Jing and Yu, Jie and Wang, Xiyao and Qin, Bin and Wang, Yumeng and Yan, Zizhen and Feng, Ziyong and Liu, Ziwei and Li, Bo and Deng, Jiankang},
  booktitle={arXiv},
  year={2025}
}`;

  const bibtex2 = `@inproceedings{xie2025region,
  title={Region-based Cluster Discrimination for Visual Representation Learning},
  author={Xie, Yin and Yang, Kaicheng and An, Xiang and Wu, Kun and Zhao, Yongle and Deng, Weimo and Ran, Zimin and Wang, Yumeng and Feng, Ziyong and Miles, Roy and Elezi, Ismail and Deng, Jiankang},
  booktitle={ICCV},
  year={2025}
}`;

  const bibtex3 = `@article{lillava,
  title={LLaVA-OneVision: Easy Visual Task Transfer},
  author={Li, Bo and Zhang, Yuanhan and Guo, Dong and Zhang, Renrui and Li, Feng and Zhang, Hao and Zhang, Kaichen and Zhang, Peiyuan and Li, Yanwei and Liu, Ziwei and Li, Chunyuan},
  journal={Transactions on Machine Learning Research},
  year={2024}
}`;

  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

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

  return (
    <div className="lov15-container">
      <div className="lov15-wrapper">
        <header className="lov15-header">
          <h1 className="lov15-title">{title}</h1>

          <div className="lov15-meta">
            <span>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {mainTags && mainTags.length > 0 && (
              <>
                <span>/</span>
                {mainTags.map((tag: string) => (
                  <span key={tag} className="lov15-tag">{tag}</span>
                ))}
              </>
            )}
          </div>

          <style>{`
            .lov15-authors a {
              color: var(--foreground, #fed7aa); text-decoration: none; border-bottom: 1px dashed rgba(254,215,170,0.3);
              transition: border-color 0.2s, opacity 0.2s;
            }
            .lov15-authors a:hover { border-bottom-color: rgba(254,215,170,0.7); opacity: 1; }
          `}</style>
          <div className="lov15-authors">
            <a href="https://github.com/didizhu-judy" target="_blank" rel="noopener noreferrer">Didi Zhu</a>*,{" "}
            <a href="https://scholar.google.com/citations?user=HDcnqg0AAAAJ" target="_blank" rel="noopener noreferrer">Zhiyu Qu</a>*,{" "}
            <a href="https://zerchen.github.io/" target="_blank" rel="noopener noreferrer">Zerui Chen</a>,{" "}
            <a href="https://github.com/gkagkos" target="_blank" rel="noopener noreferrer">Polydefkis Gkagkos</a>,{" "}
            <a href="https://anxiangsir.github.io/" target="_blank" rel="noopener noreferrer">Xiang An</a>,{" "}
            <a href="https://brianboli.com/" target="_blank" rel="noopener noreferrer">Bo Li</a>,{" "}
            <a href="https://www.geoch.top/" target="_blank" rel="noopener noreferrer">Changrui Chen</a>,{" "}
            <a href="https://jiankangdeng.github.io/" target="_blank" rel="noopener noreferrer">Jiankang Deng</a>
          </div>

          <p style={{ fontSize: "0.85rem", opacity: 0.6, textAlign: "center", margin: "0.5rem 0 0" }}>
            Project led by <a href="https://www.geoch.top/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>Changrui Chen</a> and <a href="https://jiankangdeng.github.io/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>Jiankang Deng</a>
          </p>

          <style>{`
            .rl-hero-cards {
              display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;
              margin-top: 1.5rem; margin-bottom: 2rem;
            }
            .rl-hero-card {
              display: flex; align-items: center; gap: 0.5rem;
              padding: 0.6rem 1.1rem; border-radius: 8px;
              background: rgba(254,215,170,0.06);
              border: 1px solid rgba(254,215,170,0.18);
              color: var(--foreground, #fed7aa);
              font-family: var(--font-mono); font-size: 0.82rem; font-weight: 600;
              text-decoration: none; letter-spacing: 0.02em;
              transition: background 0.2s, border-color 0.2s, transform 0.15s;
            }
            .rl-hero-card:hover {
              background: rgba(254,215,170,0.12);
              border-color: rgba(254,215,170,0.35);
              transform: translateY(-1px);
            }
            .rl-hero-card svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.7; }
          `}</style>
          <div className="rl-hero-cards">
            <a className="rl-hero-card" href="https://arxiv.org/abs/2509.23661" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M2.1 4.5L6.6 12l-4.5 7.5h3.3L9.9 12 5.4 4.5H2.1zm6 0L12.6 12l-4.5 7.5h3.3L15.9 12l-4.5-7.5H8.1zm6 0L18.6 12l-4.5 7.5h3.3L21.9 12l-4.5-7.5H14.1z"/></svg>
              Technical Report
            </a>
            <a className="rl-hero-card" href="https://github.com/EvolvingLMMs-Lab/-LLaVA-OneVision-1.5-RL" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Code
            </a>
            <a className="rl-hero-card" href="https://huggingface.co/mvp-lab/LLAVA-OV-1.5-8B-RL" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5.5 9C3 9 1 11 1 13.5V15a1 1 0 001 1h3.07a5.98 5.98 0 01-.07-.93V15c0-1.94.93-3.66 2.36-4.75A4.47 4.47 0 005.5 9zm13 0c-.64 0-1.24.13-1.86.25A5.97 5.97 0 0119 15v.07c0 .31-.02.62-.07.93H22a1 1 0 001-1v-1.5C23 11 21 9 18.5 9zM12 9a4 4 0 100-8 4 4 0 000 8zm0 1c-3.33 0-6 2.67-6 6v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-3.33-2.67-6-6-6z"/></svg>
              Models
            </a>
            <a className="rl-hero-card" href="https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-1.5-RL-Data" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm13 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5.5 9C3 9 1 11 1 13.5V15a1 1 0 001 1h3.07a5.98 5.98 0 01-.07-.93V15c0-1.94.93-3.66 2.36-4.75A4.47 4.47 0 005.5 9zm13 0c-.64 0-1.24.13-1.86.25A5.97 5.97 0 0119 15v.07c0 .31-.02.62-.07.93H22a1 1 0 001-1v-1.5C23 11 21 9 18.5 9zM12 9a4 4 0 100-8 4 4 0 000 8zm0 1c-3.33 0-6 2.67-6 6v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-3.33-2.67-6-6-6z"/></svg>
              Datasets
            </a>
            <a className="rl-hero-card" href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
              Base Model
            </a>
          </div>
        </header>

        <main className="lov15-content">
          {/* Hero Image */}
          <div style={{ margin: "0 auto 2rem", maxWidth: "100%", borderRadius: 8, overflow: "hidden", maxHeight: 320 }}>
            <img
              src="/images/blog_thumbnails/llava_onevision_1.5_rl.gif"
              alt="LLaVA-OneVision-1.5-RL"
              style={{ width: "100%", height: 320, objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
          </div>

          <p><strong>Unlocking multimodal reasoning via lightweight reinforcement learning!</strong></p>

          <h2>Overview</h2>

          <p>
            <strong>LLaVA-OneVision-1.5-RL</strong> presents an RL post-training stage utilizing 67K curated examples with discrepancy-based selection to generate explicit chain-of-thought reasoning, achieving significant performance gains on STEM, coding, and reasoning benchmarks while maintaining visual understanding capabilities.
          </p>

          <p>Our contributions are threefold:</p>

          <p>
            <strong>(1) Discrepancy-Driven Data Curation.</strong>{" "}
            We identify tasks where model performance gap exists between Pass@N and Pass@1 metrics, targeting &ldquo;latent capability&rdquo; rather than knowledge injection.
          </p>

          <p>
            <strong>(2) Rule-Based Reward System.</strong>{" "}
            We employ domain-specific verification rules rather than learned preference models, enabling precise feedback across STEM, grounding, spatial reasoning, counting, coding, OCR, and diagram tasks.
          </p>

          <p>
            <strong>(3) Two-Stage Curriculum Training.</strong>{" "}
            We design a training curriculum that first stabilizes concise task performance with answer-only RL, then unlocks deeper reasoning through chain-of-thought RL.
          </p>

          {/* Donut Charts */}
          <RLDonutCharts caption="Distribution of task categories in the RL training data. (a) Total RL corpus (67K instances). (b) Stage 1: Answer-only training. (c) Stage 2: Chain-of-thought training." />

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          <h2>RL Data Strategy</h2>

          <h3>Discrepancy-Driven Selection</h3>

          <p>
            If a model can solve a task given enough attempts (high Pass@N) but rarely gets it right on the first try (low Pass@1), it already has the latent capability — it just needs to learn to use it reliably. We select tasks with this gap for RL training, filtering out tasks that are too easy (high Pass@1, nothing to learn) or too hard (low Pass@N, beyond current capability).
          </p>

          <div style={{ background: "rgba(0,0,0,0.22)", borderRadius: "10px", padding: "1.5rem 1.8rem", margin: "1.5rem 0", border: "1px solid rgba(254,215,170,0.08)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(254,215,170,0.45)", marginBottom: "1.2rem", borderBottom: "1px solid rgba(254,215,170,0.06)", paddingBottom: "0.5rem" }}>Task Selection by Capability Gap</div>
            <style>{`
              .disc-bars { display: flex; align-items: flex-end; gap: 2.5rem; justify-content: center; height: 210px; margin-bottom: 1.5rem; padding-top: 1rem; }
              .disc-bar-group { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; position: relative; padding: 0.5rem; border-radius: 8px; transition: opacity 0.2s; }
              .disc-bar-group.disc-selected-group { background: rgba(120,220,120,0.05); border: 1px solid rgba(120,220,120,0.18); padding: 0.8rem 1.2rem; margin: -0.3rem -0.7rem; }
              .disc-bar-wrap { display: flex; align-items: flex-end; height: 165px; gap: 8px; position: relative; }
              .disc-bar {
                width: 52px; border-radius: 5px 5px 0 0; position: relative;
                font-family: var(--font-mono); font-size: 0.75rem; text-align: center; font-weight: 700;
                display: flex; align-items: flex-start; justify-content: center; padding-top: 6px;
              }
              .disc-bar-p1 { background: rgba(254,215,170,0.2); border: 1px solid rgba(254,215,170,0.35); color: rgba(254,215,170,0.95); border-bottom: none; }
              .disc-bar-pn { background: rgba(100,180,255,0.25); border: 1px solid rgba(100,180,255,0.5); color: rgba(200,230,255,1); border-bottom: none; }
              
              .disc-gap-indicator {
                position: absolute; left: calc(100% + 10px); display: flex; align-items: center; gap: 6px;
              }
              .disc-gap-line {
                width: 0; border-left: 2px dashed rgba(120,220,120,0.55);
              }
              .disc-gap-label {
                font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,220,120,0.85);
                white-space: nowrap; writing-mode: vertical-rl; text-orientation: mixed; font-weight: 600;
              }
              
              .disc-task-label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--foreground); margin-top: 6px; letter-spacing: 0.02em; }
              .disc-select { font-weight: 700; color: rgba(120,220,120,0.95); }
              .disc-reject { opacity: 0.4; font-weight: 500; }
              
              .disc-legend { display: flex; justify-content: center; gap: 2rem; font-family: var(--font-mono); font-size: 0.68rem; color: var(--foreground); margin-top: 1.2rem; opacity: 0.75; padding-top: 0.8rem; border-top: 1px solid rgba(254,215,170,0.06); }
              .disc-legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }
              .disc-dot-p1 { background: rgba(254,215,170,0.5); }
              .disc-dot-pn { background: rgba(100,180,255,0.7); }
              .disc-dot-gap { background: rgba(120,220,120,0.8); }
              
              @media (prefers-reduced-motion: no-preference) {
                .disc-bar { animation: disc-grow 0.6s ease-out both; }
                .disc-bar:nth-child(2) { animation-delay: 0.15s; }
              }
              @keyframes disc-grow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
            `}</style>
            <div className="disc-bars">
              <div className="disc-bar-group disc-selected-group">
                <div className="disc-bar-wrap">
                  <div className="disc-bar disc-bar-p1" style={{ height: "55px" }}>32%</div>
                  <div className="disc-bar disc-bar-pn" style={{ height: "132px", position: "relative" }}>
                    78%
                    <div className="disc-gap-indicator" style={{ top: "0", height: "77px" }}>
                      <div className="disc-gap-line" style={{ height: "100%" }}></div>
                      <div className="disc-gap-label">gap</div>
                    </div>
                  </div>
                </div>
                <div className="disc-task-label disc-select">Selected</div>
              </div>

              <div className="disc-bar-group">
                <div className="disc-bar-wrap">
                  <div className="disc-bar disc-bar-p1" style={{ height: "125px" }}>85%</div>
                  <div className="disc-bar disc-bar-pn" style={{ height: "140px" }}>91%</div>
                </div>
                <div className="disc-task-label disc-reject">Too Easy</div>
              </div>

              <div className="disc-bar-group">
                <div className="disc-bar-wrap">
                  <div className="disc-bar disc-bar-p1" style={{ height: "18px" }}>5%</div>
                  <div className="disc-bar disc-bar-pn" style={{ height: "22px" }}>8%</div>
                </div>
                <div className="disc-task-label disc-reject">Too Hard</div>
              </div>
            </div>
            <div className="disc-legend">
              <span><span className="disc-legend-dot disc-dot-p1"></span>Pass@1</span>
              <span><span className="disc-legend-dot disc-dot-pn"></span>Pass@N</span>
              <span><span className="disc-legend-dot disc-dot-gap"></span>Latent capability gap</span>
            </div>
          </div>

          <h3>Reward-Based Sampling</h3>

          <p>
            Multiple candidate responses are filtered by average reward scores to exclude trivial and unsolvable cases, focusing on medium-difficulty instances that provide optimal learning signals.
          </p>

          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "1.5rem", margin: "1.5rem 0", border: "1px solid rgba(254,215,170,0.1)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(254,215,170,0.5)", marginBottom: "1.2rem", borderBottom: "1px solid rgba(254,215,170,0.08)", paddingBottom: "0.5rem" }}>Reward-Based Sampling Filter</div>
            <style>{`
              .reward-filter { display: flex; align-items: stretch; justify-content: center; gap: 0.8rem; font-family: var(--font-mono); font-size: 0.7rem; color: var(--foreground); margin-bottom: 1.5rem; }
              .reward-zone {
                padding: 1rem 1.2rem; border-radius: 6px; text-align: center;
                display: flex; flex-direction: column; gap: 4px; min-width: 120px; flex: 1;
                justify-content: center;
              }
              .reward-zone-title { font-weight: 700; font-size: 0.8rem; letter-spacing: 0.03em; }
              .reward-zone-desc { opacity: 0.7; font-size: 0.65rem; }
              
              .reward-zone-reject {
                background: rgba(240,120,120,0.06); border: 1px dashed rgba(240,120,120,0.25);
                color: rgba(240,120,120,0.7);
              }
              
              .reward-zone-select {
                background: rgba(120,220,120,0.08); border: 2px solid rgba(120,220,120,0.4);
                color: rgba(120,220,120,1); padding: 1.2rem 1.5rem; flex: 1.3;
              }
              
              .reward-arrow {
                display: flex; align-items: center; font-size: 1.1rem; opacity: 0.4; color: var(--foreground);
              }
              
              .reward-bar-container { position: relative; max-width: 500px; margin: 0 auto; }
              .reward-bar-track {
                height: 12px; background: rgba(0,0,0,0.3); border-radius: 6px;
                display: flex; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);
              }
              .reward-bar-seg { height: 100%; }
              .reward-bar-lo { width: 20%; background: rgba(240,120,120,0.3); }
              .reward-bar-mid { width: 55%; background: rgba(120,220,120,0.45); }
              .reward-bar-hi { width: 25%; background: rgba(240,120,120,0.3); }
              
              .reward-axis { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.6rem; color: rgba(254,215,170,0.4); margin-top: 4px; padding: 0 2px; }
              
              .reward-bar-labels {
                display: flex; margin: 4px auto 0;
                font-family: var(--font-mono); font-size: 0.6rem; color: var(--foreground); opacity: 0.6;
              }
              .reward-bar-labels span:nth-child(1) { width: 20%; text-align: center; }
              .reward-bar-labels span:nth-child(2) { width: 55%; text-align: center; color: rgba(120,220,120,0.9); opacity: 1; }
              .reward-bar-labels span:nth-child(3) { width: 25%; text-align: center; }
            `}</style>
            <div className="reward-filter">
              <div className="reward-zone reward-zone-reject">
                <div className="reward-zone-title">✗ Trivial</div>
                <div className="reward-zone-desc">reward ≈ 1.0</div>
              </div>
              
              <div className="reward-arrow">→</div>
              
              <div className="reward-zone reward-zone-select">
                <div className="reward-zone-title">✓ Selected</div>
                <div className="reward-zone-desc">medium difficulty</div>
              </div>
              
              <div className="reward-arrow">←</div>
              
              <div className="reward-zone reward-zone-reject">
                <div className="reward-zone-title">✗ Unsolvable</div>
                <div className="reward-zone-desc">reward ≈ 0.0</div>
              </div>
            </div>
            
            <div className="reward-bar-container">
              <div className="reward-bar-track">
                <div className="reward-bar-seg reward-bar-lo"></div>
                <div className="reward-bar-seg reward-bar-mid"></div>
                <div className="reward-bar-seg reward-bar-hi"></div>
              </div>
              <div className="reward-axis">
                <span>0.0</span>
                <span>1.0</span>
              </div>
              <div className="reward-bar-labels">
                <span>excluded</span>
                <span>optimal signal</span>
                <span>excluded</span>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          <h2>Reward System Architecture</h2>

          <p>Our RL setup employs a rule-based reward paradigm, where rewards are derived directly from task outcomes rather than learned preference models. Since different answer types require distinct verification strategies, we design <strong>answer-type-specific scoring rules</strong> via the <a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5-RL/tree/main/reward" target="_blank" rel="noopener noreferrer"><code>reward/</code></a> module.</p>

          <div style={{ border: "1px solid rgba(254, 215, 170, 0.15)", borderRadius: 14, padding: "2rem 2.25rem 2.25rem", background: "rgba(3, 99, 154, 0.18)", maxWidth: 960 }}>
            <style>{`
              .rl-reward-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
              .rl-reward-table thead th { text-align: left; font-weight: 700; padding: 0.6rem 1rem; border-bottom: 2px solid rgba(254,215,170,0.2); color: var(--foreground); }
              .rl-reward-table tbody td { padding: 0.6rem 1rem; border-bottom: 1px solid rgba(254,215,170,0.08); vertical-align: middle; }
              .rl-reward-table tbody tr:last-child td { border-bottom: none; }
              .rl-reward-table th:nth-child(1), .rl-reward-table td:nth-child(1) { width: 18%; }
              .rl-reward-table th:nth-child(2), .rl-reward-table td:nth-child(2) { width: 22%; }
              .rl-reward-table th:nth-child(3), .rl-reward-table td:nth-child(3) { width: 60%; }
              .rl-badge { display: inline-block; padding: 1px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; }
              .rl-badge-stem { background: rgba(244,197,126,0.25); color: #F4C57E; }
              .rl-badge-grounding { background: rgba(168,200,232,0.2); color: #A8C8E8; }
              .rl-badge-coding { background: rgba(184,216,168,0.2); color: #B8D8A8; }
              .rl-reward-details { margin-top: 0.5rem; }
              .rl-reward-details summary { cursor: pointer; color: var(--foreground); opacity: 0.65; font-size: 0.82rem; margin-bottom: 0.4rem; }
              .rl-reward-details summary:hover { opacity: 1; }
            `}</style>

            <table className="rl-reward-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Reward Design Details</th>
                </tr>
              </thead>
              <tbody>
                {/* STEM */}
                <tr>
                  <td><span className="rl-badge rl-badge-stem">STEM</span></td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>ViRL39K</td>
                  <td>
                    Choice accuracy &amp; math expression equivalence
                    <details className="rl-reward-details">
                      <summary>View reward logic</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/math.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def math_reward_fn(completions, answer):
    model_answer = extract_answer(completion, format_strict=True)
    gold_parsed = parse(gt_answer, extraction_config=[
        StringExtractionConfig(), LatexExtractionConfig(), ExprExtractionConfig(),
    ])
    correct = verify(answer_parsed, gold_parsed)
    if not correct:
        correct = is_equal(gt_answer, model_answer)  # SymPy fallback
    return 1.0 if correct else 0.0`}</code></pre>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                {/* Grounding */}
                <tr>
                  <td><span className="rl-badge rl-badge-grounding">Grounding</span></td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>Ref-L4, VigoRL-SA</td>
                  <td>
                    IoU between predicted/ref boxes; choice accuracy
                    <details className="rl-reward-details">
                      <summary>View reward logic</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/bbox.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def bbox_reward_fn(completions, answer):
    xA = max(predicted[0], gt[0]); yA = max(predicted[1], gt[1])
    xB = min(predicted[2], gt[2]); yB = min(predicted[3], gt[3])
    inter = max(0, xB-xA) * max(0, yB-yA)
    iou = inter / float(areaA + areaB - inter)
    return iou  # ∈ [0, 1]`}</code></pre>
                        </div>
                      </div>
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", opacity: 0.6 }}>
                        <strong>IoU</strong> = Intersection / (Area₁ + Area₂ − Intersection)
                      </p>
                    </details>
                  </td>
                </tr>
                {/* Spatial */}
                <tr>
                  <td>Spatial</td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>VigoRL-SAT</td>
                  <td>
                    Choice accuracy
                    <details className="rl-reward-details">
                      <summary>View reward logic</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/multiple_choice.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def multiplechoice_reward_fn(completions, answer):
    predicted = extract_boxed_content(completions)[-1]
    predicted = predicted.strip().strip('.()')
    predicted = predicted[0].upper() if predicted else ""
    return 1 if predicted == answer.upper() else 0`}</code></pre>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                {/* Counting */}
                <tr>
                  <td>Counting</td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>PixmoCount</td>
                  <td>
                    Numeric token equivalence
                    <details className="rl-reward-details">
                      <summary>View reward logic</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/number.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def number_reward_fn(completions, answer):
    answer_str = extract_boxed_content(completions)[-1]
    match = re.findall(r"([0-9\\\\.]+)", answer_str)
    count = match[-1] if match else ""
    return float(count.strip() == answer.strip())`}</code></pre>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                {/* Coding */}
                <tr>
                  <td><span className="rl-badge rl-badge-coding">Coding</span></td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>WebCode2M, UniSVG</td>
                  <td>
                    Token/tag overlap; SVG rendering similarity [0,1]
                    <details className="rl-reward-details">
                      <summary>View reward logic — HTML</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/htmlcode.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def html_reward_fn(completions, answer):
    token_score = calculate_token_overlap(gen, ref)
    structure_score = calculate_tag_structure_similarity(gen, ref)
    reward = 0.6 * token_score + 0.4 * structure_score
    return max(0.0, min(1.0, reward))`}</code></pre>
                        </div>
                      </div>
                    </details>
                    <details className="rl-reward-details">
                      <summary>View reward logic — SVG</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/svgcode.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def svg_reward_fn(completions, answer):
    token_score = calculate_token_overlap(gen, ref)
    structure_score = calculate_structure_similarity(gen, ref)
    image_score = calculate_image_similarity(gen_png, ref_png)  # SSIM
    reward = 0.5 * image_score + 0.25 * (token_score + structure_score)
    return reward  # ∈ [0, 1]`}</code></pre>
                        </div>
                      </div>
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", opacity: 0.6 }}>
                        <strong>HTML</strong>: 0.6 × TokenJaccard + 0.4 × TagJaccard &nbsp;|&nbsp; <strong>SVG</strong>: 0.5 × SSIM + 0.25 × (Token + Tag)
                      </p>
                    </details>
                  </td>
                </tr>
                {/* OCR */}
                <tr>
                  <td>OCR</td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>InfoVQA</td>
                  <td>
                    Text similarity
                    <details className="rl-reward-details">
                      <summary>View reward logic</summary>
                      <div className="lov15-code-demo" style={{ marginTop: "0.5rem" }}>
                        <div className="lov15-code-toolbar">
                          <div className="lov15-code-dots"><span /><span /><span /></div>
                          <div className="lov15-code-title">reward/ocr.py</div>
                          <div className="lov15-code-toolbar-actions"><div className="lov15-code-lang">python</div></div>
                        </div>
                        <div className="lov15-code-body">
                          <pre style={{ margin: 0 }}><code>{`def ocr_reward_fn(completions, answer):
    dist = levenshtein_distance(gt, det)
    length = max(len(target), len(det))
    reward = 1 - min(values)
    return reward if reward >= 0.5 else 0  # threshold`}</code></pre>
                        </div>
                      </div>
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", opacity: 0.6 }}>
                        <strong>Similarity</strong> = 1 − (Levenshtein / max(len₁, len₂)), clipped at 0.5
                      </p>
                    </details>
                  </td>
                </tr>
                {/* Diagram */}
                <tr>
                  <td>Diagram</td>
                  <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", opacity: 0.7 }}>AI2D</td>
                  <td>Choice accuracy</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed rgba(254,215,170,0.15)", fontSize: "0.85rem", opacity: 0.6 }}>
              <strong>Format Reward</strong> (cross-cutting): requires exactly one <code>&lt;think&gt;</code> block, at least one <code>\boxed{"{}"}</code>, and boxed content ≤ 20% of total length.
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          <h2>Two-Stage Training Procedure</h2>

          <p style={{ opacity: 0.8, marginBottom: "1.5rem" }}>
            Interactive Training Pipeline: We utilize Group Relative Policy Optimization (GRPO) within the asynchronous AReaL framework. Click each stage to view the full hyperparameters and configuration.
          </p>

          <div style={{
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
            animation: "fadeIn 0.8s ease-out forwards"
          }}>
            <style>{`
              @keyframes slideDownFade {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes slideRight {
                from { opacity: 0; transform: translateX(-15px); }
                to { opacity: 1; transform: translateX(0); }
              }
              @keyframes particleFlow {
                0% { transform: translateX(0); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translateX(100px); opacity: 0; }
              }
              @keyframes pulseHighlight {
                0% { box-shadow: 0 0 0 0 rgba(254, 215, 170, 0.2); border-color: rgba(254, 215, 170, 0.5); }
                50% { box-shadow: 0 0 15px 0 rgba(254, 215, 170, 0.4); border-color: rgba(254, 215, 170, 0.8); }
                100% { box-shadow: 0 0 0 0 rgba(254, 215, 170, 0.2); border-color: rgba(254, 215, 170, 0.5); }
              }
              .pipeline-card {
                background: rgba(3, 99, 154, 0.3);
                border: 1px solid rgba(254, 215, 170, 0.15);
                border-radius: 8px;
                padding: 1.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
              }
              .pipeline-card:hover {
                background: rgba(3, 99, 154, 0.5);
                border-color: rgba(254, 215, 170, 0.4);
                transform: translateY(-2px);
              }
              .pipeline-card.active {
                background: rgba(3, 99, 154, 0.6);
                border-color: rgba(254, 215, 170, 0.6);
              }
              .stage-2-pulse {
                animation: pulseHighlight 3s infinite ease-in-out;
              }
              .config-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.75rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px dashed rgba(254, 215, 170, 0.2);
              }
              .config-item {
                display: flex;
                flex-direction: column;
                font-family: var(--font-mono, monospace);
                font-size: 0.8rem;
              }
              .config-label {
                color: rgba(254, 215, 170, 0.6);
                text-transform: uppercase;
                font-size: 0.7rem;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
              }
              .config-val {
                color: #fed7aa;
                font-weight: 500;
              }
              .particle-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 24px;
                position: relative;
              }
              .particle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: #fed7aa;
                border-radius: 50%;
                filter: blur(1px);
                animation: particleFlow 1.5s infinite linear;
              }
              .grpo-formula-row {
                padding: 0.6rem 0.75rem;
                margin-bottom: 0.5rem;
                background: rgba(0, 0, 0, 0.15);
                border-radius: 4px;
                display: grid;
                grid-template-columns: 80px 1fr;
                align-items: center;
                gap: 1rem;
              }
              .grpo-formula-label {
                font-variant: small-caps;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0.7;
                font-size: 0.7rem;
              }
              .grpo-formula-content {
                font-family: var(--font-mono);
                color: var(--foreground);
                font-size: 0.95rem;
              }
              .grpo-formula-row-objective { border-left: 3px solid rgba(254, 215, 170, 0.7); }
              .grpo-formula-row-objective .grpo-formula-content { font-size: 1rem; }
              .grpo-formula-row-ratio { border-left: 3px solid rgba(254, 215, 170, 0.5); }
              .grpo-formula-row-behav { border-left: 3px solid rgba(254, 215, 170, 0.8); background: rgba(254,215,170,0.07); }
              .grpo-formula-row-advantage { border-left: 3px solid rgba(254, 215, 170, 0.5); }
              .grpo-formula-row-reward { border-left: 3px solid rgba(254, 215, 170, 0.5); }
              .grpo-formula-footer {
                font-family: var(--font-mono);
                font-size: 0.75rem;
                opacity: 0.6;
                margin-top: 0.5rem;
              }
              .areal-def-card {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                padding: 0.75rem 1rem;
                margin-bottom: 0.5rem;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
              }
              .areal-def-decoupled { border-left: 3px solid rgba(254, 215, 170, 0.6); }
              .areal-def-staleness { border-left: 3px solid rgba(254, 215, 170, 0.4); }
              .areal-def-behavior { border-left: 3px solid rgba(254, 215, 170, 0.4); }
              .areal-def-title {
                font-weight: 700;
                font-size: 0.85rem;
                color: var(--foreground);
              }
              .areal-def-body {
                font-size: 0.85rem;
                opacity: 0.85;
                font-weight: 400;
                line-height: 1.4;
              }
              .areal-def-code {
                background: rgba(0, 0, 0, 0.3);
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 0.8rem;
                font-family: var(--font-mono);
              }
            `}</style>

            <div 
              className="pipeline-card"
              style={{ animation: "slideRight 0.6s ease-out 0.1s both", opacity: 0 }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontFamily: "var(--font-mono, monospace)" }}>Stage 1</span>
                <h3 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.25rem", color: "var(--foreground)" }}>Answer-only RL</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.85 }}>Stabilizes task performance with concise answers (19.9K samples, ./data/stage1-normal)</p>
              </div>

              <div className="config-grid">
                <div className="config-item"><span className="config-label">Model Base</span><span className="config-val">LLaVA-OneVision-1.5-8B-Instruct</span></div>
                <div className="config-item"><span className="config-label">Data</span><span className="config-val">./data/stage1-normal (19.9K)</span></div>
                <div className="config-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="config-label">Prompt Template</span>
                  <pre style={{ margin: "0.25rem 0 0", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: 4, whiteSpace: "pre-wrap" }}>
                    Put ONLY your final answer within &lt;answer&gt;&lt;/answer&gt;.
                  </pre>
                </div>
              </div>
            </div>

            <div 
              className="pipeline-card"
              style={{ animation: "slideRight 0.6s ease-out 0.5s both", opacity: 0 }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, opacity: 0.7, fontFamily: "var(--font-mono, monospace)" }}>Stage 2</span>
                <h3 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.25rem", color: "var(--foreground)" }}>Chain-of-Thought RL ✨</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.85 }}>Unlocks deeper reasoning via explicit thinking prompts (49.2K samples, ./data/stage2-long)</p>
              </div>

              <div className="config-grid">
                <div className="config-item"><span className="config-label">Model Init</span><span className="config-val">Stage 1 Checkpoint</span></div>
                <div className="config-item"><span className="config-label">Data</span><span className="config-val">./data/stage2-long (49.2K)</span></div>
                <div className="config-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="config-label">Prompt Template</span>
                  <pre style={{ margin: "0.25rem 0 0", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: 4, whiteSpace: "pre-wrap" }}>
                    Think and solve the following question step by step. Please put your thinking and analysis procedure within &lt;think&gt;&lt;/think&gt;. Put ONLY your final answer within &lt;answer&gt;&lt;/answer&gt;.
                  </pre>
                </div>
              </div>
            </div>

            <div 
              style={{ marginTop: "0.5rem", textAlign: "center", animation: "fadeIn 0.8s ease-out 0.8s both", opacity: 0 }}
            >
              <button 
                type="button"
                onClick={() => setExpandedStage(expandedStage === 3 ? null : 3)}
                style={{ 
                  background: "transparent", 
                  border: "1px dashed rgba(254, 215, 170, 0.4)", 
                  color: "var(--foreground)", 
                  padding: "0.5rem 1rem", 
                  borderRadius: 20, 
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-mono, monospace)",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(254, 215, 170, 0.1)"; }}
                onFocus={(e) => { e.currentTarget.style.background = "rgba(254, 215, 170, 0.1)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                onBlur={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {expandedStage === 3 ? "Hide Global Hyperparameters" : "View Global Hyperparameters (Both Stages)"}
              </button>

              {expandedStage === 3 && (
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "1.25rem", 
                  background: "rgba(0,0,0,0.15)", 
                  border: "1px solid rgba(254, 215, 170, 0.1)", 
                  borderRadius: 8,
                  textAlign: "left",
                  animation: "slideDownFade 0.3s ease-out"
                }}>
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", opacity: 0.9 }}>Shared GRPO Configuration</h4>
                  <div className="config-grid" style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
                    <div className="config-item"><span className="config-label">Algorithm</span><span className="config-val">GRPO (AReaL Framework)</span></div>
                    <div className="config-item"><span className="config-label">Infrastructure</span><span className="config-val">8× GPUs, FSDP, SGLang</span></div>
                    <div className="config-item"><span className="config-label">Optimizer</span><span className="config-val">Adam (lr=2e-6, wd=0.01)</span></div>
                    <div className="config-item"><span className="config-label">LR Schedule</span><span className="config-val">Constant w/ 0.1% warmup</span></div>
                    <div className="config-item"><span className="config-label">Batch Params</span><span className="config-val">BS=32, 16 samples/group</span></div>
                    <div className="config-item"><span className="config-label">Max Tokens</span><span className="config-val">4096 (temp=1.0)</span></div>
                    <div className="config-item"><span className="config-label">PPO Clip</span><span className="config-val">ε=0.2, ε_high=0.28</span></div>
                    <div className="config-item"><span className="config-label">Reward</span><span className="config-val">Scale=10.0, Bias=-0.5</span></div>
                    <div className="config-item"><span className="config-label">KL Penalty</span><span className="config-val">0.0 (No constraint)</span></div>
                    <div className="config-item"><span className="config-label">Epochs / Dtype</span><span className="config-val">30 / bfloat16</span></div>
                  </div>
                  <div style={{ marginTop: "1rem", borderTop: "1px dashed rgba(254, 215, 170, 0.2)", paddingTop: "1rem" }}>
                    <span className="config-label" style={{ display: "block", marginBottom: "0.5rem" }}>Reward Modules</span>
                    <span style={{ fontSize: "0.8rem", color: "#fed7aa", opacity: 0.8, fontFamily: "var(--font-mono, monospace)" }}>
                      bbox.py, bool.py, critic.py, format.py, generalcode.py, htmlcode.py, math.py, multiple_choice.py, number.py, ocr.py, svgcode.py, string_matching.py
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          <h2>Extended Capability Analysis</h2>

          {/* Figure 5 — Bar Chart */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: 700, maxWidth: 960, margin: "0 auto" }}>
              {/* Section titles */}
              <div style={{ display: "flex", fontWeight: "bold", fontSize: 15, marginBottom: 8, paddingLeft: 50, color: "var(--foreground, #fed7aa)" }}>
                <div style={{ width: "67%", textAlign: "center" }}>Spatial Reasoning &amp; Grounding</div>
                <div style={{ flex: 1, textAlign: "center" }}>Coding</div>
              </div>

              <div style={{ position: "relative", paddingLeft: 50 }}>
                {/* Y-axis label */}
                <div style={{ position: "absolute", left: -10, top: "50%", transform: "rotate(-90deg) translateX(50%)", transformOrigin: "center", fontSize: 13, fontWeight: "bold", color: "#f0a0a0", whiteSpace: "nowrap" }}>
                  Score / Accuracy (%)
                </div>

                {/* Chart area */}
                <div style={{ position: "relative", height: 360, borderLeft: "1.5px solid rgba(254,215,170,0.5)", borderBottom: "1.5px solid rgba(254,215,170,0.5)" }}>
                  {/* Gridlines + Y-ticks: scale 30–100, height 360 => 1% ≈ 5.14px */}
                  {[100, 90, 80, 70, 60, 50, 40].map((v) => {
                    const top = ((100 - v) / 70) * 360;
                    return (
                      <div key={v}>
                        <div style={{ position: "absolute", left: -32, top: top - 7, fontSize: 11, color: "rgba(254,215,170,0.6)" }}>{v}</div>
                        <div style={{ position: "absolute", left: 0, right: 0, top, borderTop: "1px solid rgba(254,215,170,0.1)" }} />
                      </div>
                    );
                  })}

                  {/* Dashed section divider at ~67% */}
                  <div style={{ position: "absolute", top: 0, bottom: -24, left: "67%", borderLeft: "2px dashed rgba(254,215,170,0.25)", zIndex: 5 }} />

                  {/* Bars */}
                  <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "flex-end", position: "relative" }}>
                    {[
                      { bars: [{ v: 50.6, c: "base" }, { v: 52.2, c: "thinking" }, { v: 53.2, c: "fast" }, { v: 55.9, c: "qwen" }] },
                      { bars: [{ v: 61.7, c: "base" }, { v: 63.6, c: "thinking" }, { v: 62.6, c: "fast" }, { v: 60.0, c: "qwen" }] },
                      { bars: [{ v: 41.5, c: "base" }, { v: 41.7, c: "thinking" }, { v: 41.2, c: "fast" }, { v: 38.5, c: "qwen" }] },
                      { bars: [{ v: 50.3, c: "base" }, { v: 57.1, c: "thinking" }, { v: 61.6, c: "fast" }] },
                      { bars: [{ v: 87.0, c: "base" }, { v: 81.4, c: "thinking" }, { v: 88.4, c: "fast" }] },
                      { bars: [{ v: 64.0, c: "base" }, { v: 57.2, c: "thinking" }, { v: 68.8, c: "fast" }] },
                      { bars: [{ v: 94.4, c: "base" }, { v: 92.4, c: "thinking" }, { v: 94.6, c: "fast" }, { v: 89.3, c: "qwen" }] },
                      { bars: [{ v: 55.6, c: "base" }, { v: 58.3, c: "thinking" }, { v: 55.7, c: "fast" }, { v: 55.8, c: "qwen" }] },
                      { bars: [{ v: 60.1, c: "base" }, { v: 63.9, c: "thinking" }, { v: 60.5, c: "fast" }, { v: 60.6, c: "qwen" }] },
                      { bars: [{ v: 50.4, c: "base" }, { v: 57.5, c: "thinking" }, { v: 53.8, c: "fast" }, { v: 50.4, c: "qwen" }] },
                    ].map((group) => (
                      <div key={group.bars.map((b) => b.v).join("-")} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, flex: "1 1 0", padding: "0 3px" }}>
                        {group.bars.map((bar) => {
                          const h = ((bar.v - 30) / 70) * 360;
                          const colors: Record<string, string> = {
                            base: "#f0c89a",
                            thinking: "repeating-linear-gradient(-45deg, #d48a3c, #d48a3c 3px, #e6a55a 3px, #e6a55a 6px)",
                            fast: "#c05a1a",
                            qwen: "#a8c8e8",
                          };
                          const bg = colors[bar.c] ?? "#999";
                          const isGradient = bar.c === "thinking";
                          return (
                            <div key={`${bar.c}-${bar.v}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(254,215,170,0.8)", marginBottom: 2, whiteSpace: "nowrap" }}>{bar.v.toFixed(1)}</div>
                              <div style={{
                                width: 18,
                                height: Math.max(h, 2),
                                borderRadius: "1px 1px 0 0",
                                ...(isGradient ? { backgroundImage: bg } : { backgroundColor: bg }),
                              }} />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div style={{ display: "flex", width: "100%", marginTop: 6 }}>
                  {["SAT\ntest", "SAT\nval", "Tree-\nBench", "Ref-L4\n(iou)", "Ref-L4\n(acc)", "RefCOCO\n(iou)", "RefCOCO\n(acc)", "WebCode\n(short)", "Design-\n2Code", "UniSVG"].map((label) => (
                    <div key={label} style={{ flex: "1 1 0", textAlign: "center", fontSize: 11, lineHeight: 1.3, color: "rgba(254,215,170,0.7)" }}>
                      {label.split("\n").map((line) => (
                        <span key={line}>{line !== label.split("\n")[0] && <br />}{line}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, fontSize: 12, color: "rgba(254,215,170,0.75)", flexWrap: "wrap" }}>
                {[
                  { label: "LLaVA-OV-1.5 8B", bg: "#f0c89a" },
                  { label: "LLaVA-OV-1.5 RL (Thinking)", bg: "repeating-linear-gradient(-45deg, #d48a3c, #d48a3c 3px, #e6a55a 3px, #e6a55a 6px)", isGradient: true },
                  { label: "LLaVA-OV-1.5 RL (Fast)", bg: "#c05a1a" },
                  { label: "Qwen 2.5-VL", bg: "#a8c8e8" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 16,
                      height: 11,
                      borderRadius: 2,
                      ...(item.isGradient ? { backgroundImage: item.bg } : { backgroundColor: item.bg }),
                    }} />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Caption */}
              <p style={{ marginTop: 20, fontSize: 13, lineHeight: 1.5, opacity: 0.75 }}>
                <strong>Figure 5</strong>&nbsp; Performance comparison of LLaVA-OV-1.5 and corresponding RL version on Spatial Reasoning &amp; Grounding and Coding tasks.
              </p>
            </div>
          </div>

          <p>
            <strong>Spatial &amp; Grounding:</strong> RL &ldquo;fast mode&rdquo; significantly enhances fine-grained perception on SAT and Ref-L4 benchmarks.
          </p>

          <p>
            <strong>Coding:</strong> &ldquo;Thinking&rdquo; mode achieves highest scores on Design2Code and UniSVG, demonstrating chain-of-thought benefits for structural code generation.
          </p>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          <h2>Performance Results</h2>

          <div className="lov15-paper-breakout lov15-paper-breakout-primary rl-table1-wrap">
            <style>{`
              .rl-table1-wrap .lov15-paper-table td.lov15-paper-num { text-align: center !important; white-space: nowrap; }
              .rl-table1-wrap .lov15-paper-table td.lov15-paper-benchmark { text-align: left !important; padding-left: 0.85rem; }
              .rl-table1-wrap .lov15-paper-table th { white-space: nowrap; text-align: center !important; }
              .rl-table1-wrap .lov15-paper-table th.lov15-paper-bench-head { text-align: left !important; padding-left: 0.85rem; }
              .rl-table1-wrap .t1-val { display: inline-block; text-align: right; min-width: 32px; }
              .rl-table1-wrap .t1-sup { display: inline-block; text-align: left; min-width: 32px; }
              .rl-table1-wrap .t1-sup sup { font-size: 13px; color: #f87171; font-weight: 700; vertical-align: super; line-height: 0; }
            `}</style>
            <div className="lov15-paper-shell lov15-paper-shell-primary">
              <div className="lov15-paper-caption lov15-paper-caption-primary">
                <span className="lov15-paper-caption-label">Table 1</span>
                Performance comparison across vision-language models on various benchmarks grouped by task type. All scores are reported as accuracy percentages unless otherwise specified.
              </div>

              <div className="lov15-paper-table-scroll">
                <table className="lov15-paper-table lov15-paper-table-primary" style={{ minWidth: 560 }}>
                  <thead>
                    <tr className="lov15-paper-head-row">
                      <th className="lov15-paper-bench-head" rowSpan={3}>Task</th>
                      <th className="lov15-paper-bench-head" rowSpan={3}>Benchmark</th>
                      <th>LLaVA-OV-1.5</th>
                      <th className="lov15-paper-col-hi" colSpan={2}>LLaVA-OV-1.5 RL</th>
                    </tr>
                    <tr className="lov15-paper-head-row">
                      <th>8B</th>
                      <th className="lov15-paper-col-hi" colSpan={2}>8B</th>
                    </tr>
                    <tr className="lov15-paper-head-row">
                      <th>-</th>
                      <th className="lov15-paper-col-hi">thinking</th>
                      <th className="lov15-paper-col-hi">fast</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* ── General VQA ── */}
                    <tr className="lov15-paper-section-top">
                      <td className="lov15-paper-benchmark" rowSpan={10} style={{ fontWeight: "bold", verticalAlign: "middle" }}>General VQA</td>
                      <td className="lov15-paper-benchmark">MMStar</td>
                      <td className="lov15-paper-num">67.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">68.2</span><span className="t1-sup"><sup>↑0.5</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">68.3</span><span className="t1-sup"><sup>↑0.6</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MMBench<sub>en</sub></td>
                      <td className="lov15-paper-num">84.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">85.7</span><span className="t1-sup"><sup>↑1.6</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">85.7</span><span className="t1-sup"><sup>↑1.6</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MMBench<sub>cn</sub></td>
                      <td className="lov15-paper-num">81.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">84.2</span><span className="t1-sup"><sup>↑3.2</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">81.5</span><span className="t1-sup"><sup>↑0.5</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MME-RealWorld<sub>en</sub></td>
                      <td className="lov15-paper-num">61.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">63.4</span><span className="t1-sup"><sup>↑1.7</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">63.3</span><span className="t1-sup"><sup>↑1.6</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MME-RealWorld<sub>cn</sub></td>
                      <td className="lov15-paper-num">56.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">56.1</span><span className="t1-sup"><sup>↑0.0</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">56.3</span><span className="t1-sup"><sup>↑0.2</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">SeedBench<sub>image</sub></td>
                      <td className="lov15-paper-num">77.3</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">76.7</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">77.6</span><span className="t1-sup"><sup>↑0.3</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">CV-Bench</td>
                      <td className="lov15-paper-num">80.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">82.9</span><span className="t1-sup"><sup>↑2.2</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">81.1</span><span className="t1-sup"><sup>↑0.4</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">SEED-Bench-2-Plus</td>
                      <td className="lov15-paper-num">69.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">69.5</span><span className="t1-sup"><sup>↑0.3</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">69.2</span><span className="t1-sup"><sup>↑0.0</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">RealWorldQA</td>
                      <td className="lov15-paper-num">68.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">68.4</span><span className="t1-sup"><sup>↑0.3</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">70.6</span><span className="t1-sup"><sup>↑2.5</sup></span></td>
                    </tr>
                    <tr className="lov15-paper-avg">
                      <td className="lov15-paper-benchmark">Avg.</td>
                      <td className="lov15-paper-num">71.8</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">72.8</span><span className="t1-sup"><sup>↑1.0</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">72.6</span><span className="t1-sup"><sup>↑0.8</sup></span></td>
                    </tr>

                    {/* ── Reasoning ── */}
                    <tr className="lov15-paper-section-top">
                      <td className="lov15-paper-benchmark" rowSpan={7} style={{ fontWeight: "bold", verticalAlign: "middle" }}>Reasoning</td>
                      <td className="lov15-paper-benchmark">MathVista<sub>mini</sub></td>
                      <td className="lov15-paper-num">69.6</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">72.3</span><span className="t1-sup"><sup>↑2.7</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">71.8</span><span className="t1-sup"><sup>↑2.2</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">WeMath</td>
                      <td className="lov15-paper-num">61.5</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">69.4</span><span className="t1-sup"><sup>↑7.9</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">60.8</span><span className="t1-sup"></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MathVision</td>
                      <td className="lov15-paper-num">25.6</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">34.4</span><span className="t1-sup"><sup>↑8.8</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">26.2</span><span className="t1-sup"><sup>↑0.6</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MMMU<sub>val</sub></td>
                      <td className="lov15-paper-num">55.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">58.8</span><span className="t1-sup"><sup>↑3.4</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">54.9</span><span className="t1-sup"></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MMMU-Pro<sub>standard</sub></td>
                      <td className="lov15-paper-num">37.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">39.9</span><span className="t1-sup"><sup>↑2.5</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">38.0</span><span className="t1-sup"><sup>↑0.6</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">MMMU-Pro<sub>vision</sub></td>
                      <td className="lov15-paper-num">25.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">35.7</span><span className="t1-sup"><sup>↑10.5</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">29.0</span><span className="t1-sup"><sup>↑3.8</sup></span></td>
                    </tr>
                    <tr className="lov15-paper-avg">
                      <td className="lov15-paper-benchmark">Avg.</td>
                      <td className="lov15-paper-num">45.8</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">51.8</span><span className="t1-sup"><sup>↑6.0</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">46.8</span><span className="t1-sup"><sup>↑1.0</sup></span></td>
                    </tr>

                    {/* ── OCR & Chart ── */}
                    <tr className="lov15-paper-section-top">
                      <td className="lov15-paper-benchmark" rowSpan={8} style={{ fontWeight: "bold", verticalAlign: "middle" }}>OCR &amp; Chart</td>
                      <td className="lov15-paper-benchmark">ChartQA</td>
                      <td className="lov15-paper-num">86.5</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">87.4</span><span className="t1-sup"><sup>↑0.9</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">87.0</span><span className="t1-sup"><sup>↑0.5</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">CharXiv<sub>DQ</sub></td>
                      <td className="lov15-paper-num">70.9</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">68.4</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">71.2</span><span className="t1-sup"><sup>↑0.3</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">DocVQA</td>
                      <td className="lov15-paper-num">95.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">91.9</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">95.0</span><span className="t1-sup"><sup>↑0.0</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">OCRBench</td>
                      <td className="lov15-paper-num">82.9</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">81.7</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">82.3</span><span className="t1-sup"></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">AI2D<sub>w M</sub></td>
                      <td className="lov15-paper-num">84.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">83.7</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">84.3</span><span className="t1-sup"><sup>↑0.1</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">AI2D<sub>w/o M</sub></td>
                      <td className="lov15-paper-num lov15-paper-bold">94.1</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">93.7</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">93.9</span><span className="t1-sup"></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">InfoVQA</td>
                      <td className="lov15-paper-num">78.4</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">76.6</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">78.7</span><span className="t1-sup"><sup>↑0.3</sup></span></td>
                    </tr>
                    <tr className="lov15-paper-avg">
                      <td className="lov15-paper-benchmark">Avg.</td>
                      <td className="lov15-paper-num">84.6</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">83.3</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">84.6</span><span className="t1-sup"><sup>↑0.0</sup></span></td>
                    </tr>

                    {/* ── Others ── */}
                    <tr className="lov15-paper-section-top">
                      <td className="lov15-paper-benchmark" rowSpan={5} style={{ fontWeight: "bold", verticalAlign: "middle" }}>Others</td>
                      <td className="lov15-paper-benchmark">PixmoCount</td>
                      <td className="lov15-paper-num">62.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">65.7</span><span className="t1-sup"><sup>↑3.5</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">71.1</span><span className="t1-sup"><sup>↑8.9</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">CountBench</td>
                      <td className="lov15-paper-num">88.2</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">86.8</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">88.6</span><span className="t1-sup"><sup>↑0.4</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">VL-RewardBench</td>
                      <td className="lov15-paper-num">47.7</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">44.0</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">49.7</span><span className="t1-sup"><sup>↑2.0</sup></span></td>
                    </tr>
                    <tr>
                      <td className="lov15-paper-benchmark">V*</td>
                      <td className="lov15-paper-num">78.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">79.1</span><span className="t1-sup"><sup>↑1.1</sup></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">78.0</span><span className="t1-sup"><sup>↑0.0</sup></span></td>
                    </tr>
                    <tr className="lov15-paper-avg lov15-paper-last-row">
                      <td className="lov15-paper-benchmark">Avg.</td>
                      <td className="lov15-paper-num">69.0</td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val">66.0</span><span className="t1-sup"></span></td>
                      <td className="lov15-paper-num lov15-paper-col-hi"><span className="t1-val lov15-paper-bold">71.6</span><span className="t1-sup"><sup>↑2.6</sup></span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />

          {/* ═══════════════════════════════════════════════════════════ */}
          {/*  GRPO Algorithm & AReaL Framework Deep Dive               */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <h2>GRPO Algorithm &amp; AReaL Async Framework</h2>

          <h3>GRPO</h3>
          <p>
            GRPO eliminates the critic by sampling <i>G&nbsp;=&nbsp;16</i> completions per prompt and using group-normalized rewards as the baseline.
          </p>

          <div style={{ background: "rgba(3, 99, 154, 0.3)", border: "1px solid rgba(254, 215, 170, 0.15)", borderRadius: "8px", padding: "1.5rem", margin: "1.5rem 0", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
            <div className="grpo-formula-row grpo-formula-row-objective">
              <div className="grpo-formula-label">Objective</div>
              <div className="grpo-formula-content">J(θ) = 𝔼 [ min( r<sub>t</sub> · Â<sub>t</sub> , clip(r<sub>t</sub>, 1−ε, 1+ε′) · Â<sub>t</sub> ) · <span style={{color:"rgba(254,215,170,1)", fontWeight:700}}>w<sub>t</sub></span> ]</div>
            </div>
            <div className="grpo-formula-row grpo-formula-row-ratio">
              <div className="grpo-formula-label">Ratio</div>
              <div className="grpo-formula-content">r<sub>t</sub> = π<sub>θ</sub>(y<sub>t</sub>|y<sub>&lt;t</sub>,x) / π<sub>prox</sub>(y<sub>t</sub>|y<sub>&lt;t</sub>,x)</div>
            </div>
            <div className="grpo-formula-row grpo-formula-row-behav">
              <div className="grpo-formula-label">BehavWeight</div>
              <div className="grpo-formula-content">w<sub>t</sub> = exp( log π<sub>prox</sub> − log π<sub>behave</sub> ), cap = 5.0</div>
            </div>
            <div className="grpo-formula-row grpo-formula-row-advantage">
              <div className="grpo-formula-label">Advantage</div>
              <div className="grpo-formula-content">Â(x, y<sub>i</sub>) = ( r<sub>i</sub> − μ<sub>group</sub> ) / ( σ<sub>group</sub> + ε )</div>
            </div>
            <div className="grpo-formula-row grpo-formula-row-reward">
              <div className="grpo-formula-label">Reward</div>
              <div className="grpo-formula-content">r′ = (r<sub>task</sub> − 0.5) × 10.0</div>
            </div>
            <div className="grpo-formula-footer">
              ε = 0.2, ε′ = 0.28 (asymmetric clipping) · G = 16 · kl_ctl = 0 · w_t = behav_imp_weight (AReaL off-policy correction)
            </div>
          </div>

          <details style={{ margin: "1.5rem 0", cursor: "pointer" }}>
            <summary style={{ fontWeight: 600, opacity: 0.9, marginBottom: "0.5rem" }}>Show GRPO Loss Implementation (<a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5-RL/blob/9f9ce7d/utils/functional.py#L98-L187" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>utils/functional.py</a>)</summary>
            <div className="lov15-code-demo" style={{ margin: "0.5rem 0", cursor: "text" }}>
              <div className="lov15-code-toolbar">
                <div className="lov15-code-dots"><span /><span /><span /></div>
                <div className="lov15-code-title">ppo_actor_loss_fn</div>
                <div className="lov15-code-toolbar-actions">
                  <div className="lov15-code-lang">python</div>
                </div>
              </div>
              <div className="lov15-code-body">
                <pre style={{ fontSize: "0.82rem" }}><code>{`# utils/functional.py — ppo_actor_loss_fn
ratio = torch.exp(logprobs - proximal_logprobs)
clipped_ratio = torch.clamp(ratio, 1.0 - eps_clip, 1.0 + eps_clip_higher)
pg_loss = torch.max(-advantages * ratio, -advantages * clipped_ratio)

# Behavior importance weight (off-policy correction)
behav_kl = proximal_logprobs - old_logprobs
behav_imp_weight = torch.clamp(behav_kl.exp(), max=behav_imp_weight_cap)
pg_loss = pg_loss * behav_imp_weight`}</code></pre>
              </div>
            </div>
          </details>

          <h3>AReaL Async Training</h3>
          <p>
            AReaL decouples rollout from gradient computation — <strong>2.77× throughput</strong> by eliminating GPU idle time.
          </p>

          <div style={{ background: "rgba(3, 99, 154, 0.3)", border: "1px solid rgba(254, 215, 170, 0.15)", borderRadius: "8px", padding: "1.5rem", margin: "1.5rem 0" }}>
            <style>
              {`
                .areal-anim-container {
                  font-family: var(--font-mono);
                  color: var(--foreground);
                  display: grid;
                  grid-template-columns: 45px 1fr;
                  gap: 0 1rem;
                  padding-right: 50px;
                  margin: 0 0 1.5rem 0;
                  position: relative;
                }
                .areal-anim-label {
                  text-align: right;
                  opacity: 0.8;
                  font-size: 0.75rem;
                }
                .areal-anim-block {
                  position: absolute;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.7rem;
                  box-sizing: border-box;
                  transition: filter 0.2s;
                  white-space: nowrap;
                  overflow: hidden;
                }
                .areal-anim-rollout {
                  background: rgba(254, 215, 170, 0.3);
                  border: 1px solid rgba(254, 215, 170, 0.5);
                  color: rgba(254, 215, 170, 1);
                }
                .areal-anim-train {
                  background: rgba(3, 99, 154, 0.6);
                  border: 1px solid rgba(3, 99, 154, 0.8);
                  color: rgba(254, 215, 170, 1);
                }
                .areal-anim-idle {
                  background: transparent;
                  border: 1px dashed rgba(254, 215, 170, 0.3);
                  color: rgba(254, 215, 170, 0.6);
                }
                .areal-anim-sync-badge {
                  background: rgba(3, 99, 154, 0.2);
                  border: 1px dashed rgba(3, 99, 154, 0.5);
                  color: rgba(254, 215, 170, 0.7);
                }
                .areal-anim-badge-277 {
                  position: absolute;
                  right: -55px;
                  top: 50%;
                  transform: translateY(-50%);
                  background: rgba(254, 215, 170, 0.15);
                  color: rgba(254, 215, 170, 1);
                  padding: 4px 6px;
                  border-radius: 4px;
                  font-size: 0.75rem;
                  border: 1px solid rgba(254, 215, 170, 0.3);
                  font-weight: bold;
                }
                .areal-anim-scanner {
                  position: absolute;
                  top: -10px;
                  bottom: -10px;
                  width: 2px;
                  background: rgba(254, 215, 170, 0.8);
                  box-shadow: 0 0 10px rgba(254, 215, 170, 0.8);
                  z-index: 10;
                  opacity: 0;
                }
                @media (prefers-reduced-motion: no-preference) {
                  .areal-anim-scanner { animation: areal-anim-scan 6s linear infinite; }
                  .areal-anim-sync-r1 { animation: areal-anim-sync-r1 6s linear infinite; }
                  .areal-anim-sync-t1 { animation: areal-anim-sync-t1 6s linear infinite; }
                  .areal-anim-sync-r2 { animation: areal-anim-sync-r2 6s linear infinite; }
                  .areal-anim-async-pulse { animation: areal-anim-async-pulse 1.5s ease-in-out infinite alternate; }
                }
                @keyframes areal-anim-scan {
                  0% { left: 0%; opacity: 0; }
                  5% { opacity: 1; }
                  95% { opacity: 1; }
                  100% { left: 100%; opacity: 0; }
                }
                @keyframes areal-anim-sync-r1 {
                  0%, 35% { filter: brightness(1.3); box-shadow: 0 0 10px rgba(254,215,170,0.3); }
                  36%, 100% { filter: brightness(1); box-shadow: none; }
                }
                @keyframes areal-anim-sync-t1 {
                  0%, 41% { filter: brightness(1); box-shadow: none; }
                  42%, 57% { filter: brightness(1.3); box-shadow: 0 0 10px rgba(3,99,154,0.6); z-index: 2; }
                  58%, 100% { filter: brightness(1); box-shadow: none; }
                }
                @keyframes areal-anim-sync-r2 {
                  0%, 58% { filter: brightness(1); box-shadow: none; }
                  59%, 94% { filter: brightness(1.3); box-shadow: 0 0 10px rgba(254,215,170,0.3); }
                  95%, 100% { filter: brightness(1); box-shadow: none; }
                }
                @keyframes areal-anim-async-pulse {
                  0% { filter: brightness(1); }
                  100% { filter: brightness(1.2); box-shadow: 0 0 8px rgba(254,215,170,0.15); }
                }
                @media (max-width: 600px) {
                  .areal-anim-block { font-size: 0.6rem; }
                  .areal-anim-badge-277 { right: -45px; font-size: 0.6rem; padding: 2px 4px; }
                  .areal-anim-container { padding-right: 45px; }
                }
                .areal-v3-container {
                  display: flex;
                  flex-direction: column;
                  gap: 2rem;
                  margin: 1.5rem 0;
                  font-family: var(--font-mono);
                  font-size: 0.75rem;
                  color: var(--foreground);
                }
                /* Component 1: Simplified Architecture */
                .areal-v3-arch {
                  display: flex;
                  justify-content: space-between;
                  align-items: stretch;
                  position: relative;
                  min-height: 100px;
                }
                .areal-v3-box {
                  width: 35%;
                  background: rgba(0,0,0,0.35);
                  border-radius: 8px;
                  padding: 1rem 1.2rem;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  position: relative;
                  z-index: 2;
                  border: 1px solid rgba(254,215,170,0.15);
                  box-shadow: 0 0 20px rgba(0,0,0,0.3);
                }
                .areal-v3-box-rollout { border-left: 3px solid rgba(254,215,170,0.8); }
                .areal-v3-box-actor { border-right: 3px solid rgba(100,180,255,1); }
                .areal-v3-title { font-weight: bold; font-size: 0.9rem; color: rgba(254,215,170,1); margin-bottom: 4px; letter-spacing: 0.02em; }
                .areal-v3-subtitle { opacity: 0.7; font-size: 0.7rem; }
                .areal-v3-status {
                  font-size: 0.6rem;
                  padding: 3px 8px;
                  border-radius: 4px;
                  background: rgba(120,220,120,0.25);
                  color: rgba(120,220,120,1);
                  display: inline-block;
                  margin-top: 0.5rem;
                  animation: areal-v3-status-color 12s infinite;
                  font-weight: 600;
                }
                .areal-v3-status::after {
                  content: "GENERATING";
                  animation: areal-v3-status-text 12s infinite;
                }
                
                .areal-v3-data-flow {
                  position: absolute;
                  left: 35%;
                  width: 30%;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  z-index: 1;
                }
                .areal-v3-track {
                  position: relative;
                  height: 2px;
                  width: 100%;
                  background: rgba(254,215,170,0.3);
                  display: flex;
                  align-items: center;
                  box-shadow: 0 0 6px rgba(254,215,170,0.15);
                }
                .areal-v3-track-label {
                  position: absolute;
                  top: -16px;
                  width: 100%;
                  text-align: center;
                  font-size: 0.65rem;
                  opacity: 0.85;
                  white-space: nowrap;
                  color: rgba(254,215,170,0.9);
                }
                .areal-v3-particle {
                  position: absolute;
                  width: 8px; height: 8px; border-radius: 50%;
                  background: rgba(254,215,170,1);
                  box-shadow: 0 0 12px rgba(254,215,170,0.9), 0 0 4px rgba(254,215,170,1);
                  opacity: 0;
                  animation: areal-v3-flow-right 12s infinite;
                }

                /* Component 2: Timeline Gantt */
                .areal-v3-timeline {
                  background: rgba(0,0,0,0.3);
                  border-radius: 8px;
                  padding: 1.2rem;
                  position: relative;
                  overflow: hidden;
                  border: 1px solid rgba(254,215,170,0.1);
                }
                .areal-v3-tl-row {
                  display: flex;
                  align-items: center;
                  margin-bottom: 0.5rem;
                  position: relative;
                  height: 28px;
                }
                .areal-v3-tl-label {
                  width: 60px;
                  font-size: 0.75rem;
                  opacity: 0.9;
                  font-weight: 600;
                }
                .areal-v3-tl-tracks {
                  flex-grow: 1;
                  position: relative;
                  height: 100%;
                  background: rgba(255,255,255,0.04);
                  border-radius: 4px;
                  display: flex;
                }
                .areal-v3-tl-block {
                  position: absolute;
                  height: 100%;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.7rem;
                  font-weight: 600;
                  transform-origin: left;
                  transform: scaleX(0);
                  opacity: 0;
                }
                .areal-v3-tl-r {
                  background: rgba(254,215,170,0.3);
                  border: 1px solid rgba(254,215,170,0.7);
                  color: rgba(254,215,170,1);
                  box-shadow: 0 0 8px rgba(254,215,170,0.15);
                }
                .areal-v3-tl-t {
                  background: rgba(60,150,255,0.35);
                  border: 1px solid rgba(100,180,255,0.8);
                  color: rgba(220,235,255,1);
                  box-shadow: 0 0 8px rgba(60,150,255,0.15);
                }
                .areal-v3-tl-r1 { left: 0%; width: 33%; animation: areal-v3-tl-r1 12s infinite; }
                .areal-v3-tl-t1 { left: 15%; width: 30%; animation: areal-v3-tl-t1 12s infinite; }
                .areal-v3-tl-r2 { left: 33%; width: 33%; animation: areal-v3-tl-r2 12s infinite; }
                .areal-v3-tl-t2 { left: 45%; width: 30%; animation: areal-v3-tl-t2 12s infinite; }
                .areal-v3-tl-r3 { left: 66%; width: 34%; animation: areal-v3-tl-r3 12s infinite; }
                .areal-v3-tl-t3 { left: 75%; width: 25%; animation: areal-v3-tl-t3 12s infinite; }
                
                .areal-v3-tl-markers {
                  display: flex;
                  padding-left: 60px;
                  justify-content: space-between;
                  font-size: 0.65rem;
                  opacity: 0.7;
                  margin-top: 4px;
                }
                .areal-v3-speedup {
                  position: absolute;
                  right: 1rem;
                  top: 1rem;
                  background: rgba(254,215,170,0.2);
                  color: rgba(254,215,170,1);
                  padding: 5px 10px;
                  border-radius: 4px;
                  border: 1px solid rgba(254,215,170,0.6);
                  font-weight: bold;
                  font-size: 0.85rem;
                  z-index: 10;
                  box-shadow: 0 0 12px rgba(254,215,170,0.2);
                }
                .areal-v3-tl-footer {
                  margin-top: 0.5rem;
                  font-size: 0.65rem;
                  text-align: center;
                  opacity: 0.8;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 1rem;
                }
                .areal-v3-idle-box {
                  display: inline-block;
                  width: 20px; height: 10px;
                  border: 1px dashed rgba(254,215,170,0.7);
                  vertical-align: middle;
                }

                /* Keyframes (12s Cycle) */
                @keyframes areal-v3-status-color {
                  0%, 74.9% { background: rgba(120,220,120,0.25); color: rgba(120,220,120,1); box-shadow: 0 0 8px rgba(120,220,120,0.2); }
                  75%, 91.6% { background: rgba(240,120,120,0.25); color: rgba(240,120,120,1); box-shadow: 0 0 8px rgba(240,120,120,0.2); }
                  91.7%, 100% { background: rgba(120,220,120,0.25); color: rgba(120,220,120,1); box-shadow: 0 0 8px rgba(120,220,120,0.2); }
                }
                @keyframes areal-v3-status-text {
                  0%, 74.9% { content: "GENERATING"; }
                  75%, 91.6% { content: "PAUSED"; }
                  91.7%, 100% { content: "GENERATING"; }
                }
                
                @keyframes areal-v3-flow-right {
                  0% { left: 0%; opacity: 0; }
                  5% { opacity: 1; }
                  20% { left: 100%; opacity: 0; }
                  100% { opacity: 0; }
                }
                
                @keyframes areal-v3-tl-r1 { 0%, 5% { transform: scaleX(0); opacity: 1; } 33%, 100% { transform: scaleX(1); opacity: 1; } }
                @keyframes areal-v3-tl-t1 { 0%, 12% { transform: scaleX(0); opacity: 1; } 45%, 100% { transform: scaleX(1); opacity: 1; } }
                @keyframes areal-v3-tl-r2 { 0%, 33% { transform: scaleX(0); opacity: 1; } 66%, 100% { transform: scaleX(1); opacity: 1; } }
                @keyframes areal-v3-tl-t2 { 0%, 45% { transform: scaleX(0); opacity: 1; } 75%, 100% { transform: scaleX(1); opacity: 1; } }
                @keyframes areal-v3-tl-r3 { 0%, 66% { transform: scaleX(0); opacity: 1; } 100% { transform: scaleX(1); opacity: 1; } }
                @keyframes areal-v3-tl-t3 { 0%, 75% { transform: scaleX(0); opacity: 1; } 100% { transform: scaleX(1); opacity: 1; } }

                @media (max-width: 768px) {
                  .areal-v3-arch { flex-direction: column; gap: 1.5rem; }
                  .areal-v3-box { width: 100%; }
                  .areal-v3-data-flow { position: relative; left: 0; width: 100%; height: 40px; flex-direction: row; align-items: center; justify-content: center; }
                  .areal-v3-track { width: 60%; height: 2px; }
                  .areal-v3-particle { animation: none; left: 50%; opacity: 1; }
                }
                @media (max-width: 600px) {
                  .areal-v3-container { font-size: 0.65rem; }
                  .areal-v3-title { font-size: 0.75rem; }
                  .areal-v3-speedup { font-size: 0.65rem; padding: 2px 4px; }
                }
                
                @media (prefers-reduced-motion: reduce) {
                  .areal-v3-status { animation: none; }
                  .areal-v3-status::after { animation: none; content: "GENERATING / PAUSED"; }
                  .areal-v3-particle { animation: none; opacity: 1; left: 50%; }
                  .areal-v3-tl-block { animation: none; transform: scaleX(1); opacity: 1; }
                }
              `}
            </style>
            <div className="areal-v3-container">
              {/* Architecture */}
              <div className="areal-v3-arch">
                <div className="areal-v3-box areal-v3-box-rollout">
                  <div className="areal-v3-title">Rollout Engine</div>
                  <div className="areal-v3-subtitle">SGLang · vLLM · 4×GPU</div>
                  <div className="areal-v3-status"></div>
                </div>

                <div className="areal-v3-data-flow">
                  <div className="areal-v3-track">
                    <div className="areal-v3-track-label">batch + logprobs →</div>
                    <div className="areal-v3-particle"></div>
                    <div className="areal-v3-particle" style={{ animationDelay: "0.5s" }}></div>
                  </div>
                </div>

                <div className="areal-v3-box areal-v3-box-actor">
                  <div className="areal-v3-title">Actor (FSDP)</div>
                  <div className="areal-v3-subtitle">4×GPU · gradient update</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="areal-v3-timeline">
                <div className="areal-v3-speedup">2.77×</div>
                <div className="areal-v3-tl-row">
                  <div className="areal-v3-tl-label">Rollout</div>
                  <div className="areal-v3-tl-tracks">
                    <div className="areal-v3-tl-block areal-v3-tl-r areal-v3-tl-r1">R1</div>
                    <div className="areal-v3-tl-block areal-v3-tl-r areal-v3-tl-r2">R2</div>
                    <div className="areal-v3-tl-block areal-v3-tl-r areal-v3-tl-r3">R3</div>
                  </div>
                </div>
                <div className="areal-v3-tl-row">
                  <div className="areal-v3-tl-label">Actor</div>
                  <div className="areal-v3-tl-tracks">
                    <div className="areal-v3-tl-block areal-v3-tl-t areal-v3-tl-t1">Train 1</div>
                    <div className="areal-v3-tl-block areal-v3-tl-t areal-v3-tl-t2">Train 2</div>
                    <div className="areal-v3-tl-block areal-v3-tl-t areal-v3-tl-t3">Train 3</div>
                  </div>
                </div>
                <div className="areal-v3-tl-markers">
                  <span>t₀</span><span>t₁</span><span>t₂</span><span>t₃</span>
                </div>
                <div className="areal-v3-tl-footer">
                  <div className="areal-v3-idle-box"></div> <span style={{marginLeft: "8px"}}>← sync (idle)</span>
                </div>
              </div>

            </div>
            <div>
              <div className="areal-def-card areal-def-decoupled">
                <div className="areal-def-title">Decoupled PPO</div>
                <div className="areal-def-body">Three policies: π<sub>behave</sub> (rollout), π<sub>prox</sub> (recomputed), π<sub>θ</sub> (current). Ratio uses π<sub>θ</sub>/π<sub>prox</sub>.</div>
              </div>
              <div className="areal-def-card areal-def-staleness">
                <div className="areal-def-title">Staleness Control</div>
                <div className="areal-def-body"><code className="areal-def-code">max_head_offpolicyness</code> η = 4. Rollout samples are restricted to ≤4 gradient steps behind the current policy.</div>
              </div>
              <div className="areal-def-card areal-def-behavior">
                <div className="areal-def-title">Behavior Weight</div>
                <div className="areal-def-body">w = exp(log π<sub>prox</sub> − log π<sub>behave</sub>), capped at 5.0 to prevent gradient explosion.</div>
              </div>
            </div>
          </div>

          <details style={{ margin: "1.5rem 0", cursor: "pointer" }}>
            <summary style={{ fontWeight: 600, opacity: 0.9, marginBottom: "0.5rem" }}>Show AReaL Training Loop (<a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5-RL/blob/9f9ce7d/trains/grpo.py#L186-L315" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>trains/grpo.py</a>)</summary>
            <div className="lov15-code-demo" style={{ margin: "0.5rem 0", cursor: "text" }}>
              <div className="lov15-code-toolbar">
                <div className="lov15-code-dots"><span /><span /><span /></div>
                <div className="lov15-code-title">async_training_loop</div>
                <div className="lov15-code-toolbar-actions">
                  <div className="lov15-code-lang">python</div>
                </div>
              </div>
              <div className="lov15-code-body">
                <pre style={{ fontSize: "0.82rem" }}><code>{`# trains/grpo.py — main training loop
for global_step in range(start_step, max_steps):
    batch = rollout.prepare_batch(train_dataloader, workflow=workflow)
    batch["prox_logp"] = actor.compute_logp(batch)
    actor.compute_advantages(batch)
    actor.ppo_update(batch)

    rollout.pause()
    actor.update_weights(weight_update_meta)
    rollout.set_version(global_step + 1)
    rollout.resume()`}</code></pre>
              </div>
            </div>
          </details>

          <h3>Training Configuration</h3>
          
          <div className="pipeline-card" style={{ margin: "1.5rem 0" }}>
            <div className="config-grid">
              <div className="config-item">
                <div className="config-label">eps_clip</div>
                <div className="config-val">0.2 / 0.28 (asymmetric)</div>
              </div>
              <div className="config-item">
                <div className="config-label">kl_ctl</div>
                <div className="config-val">0.0 (disabled)</div>
              </div>
              <div className="config-item">
                <div className="config-label">reward_scaling</div>
                <div className="config-val">10.0</div>
              </div>
              <div className="config-item">
                <div className="config-label">reward_bias</div>
                <div className="config-val">−0.5</div>
              </div>
              <div className="config-item">
                <div className="config-label">group_size</div>
                <div className="config-val">16</div>
              </div>
              <div className="config-item">
                <div className="config-label">max_new_tokens</div>
                <div className="config-val">4096</div>
              </div>
              <div className="config-item">
                <div className="config-label">temperature</div>
                <div className="config-val">1.0</div>
              </div>
              <div className="config-item">
                <div className="config-label">learning_rate</div>
                <div className="config-val">2e-6</div>
              </div>
              <div className="config-item">
                <div className="config-label">epochs</div>
                <div className="config-val">30</div>
              </div>
              <div className="config-item">
                <div className="config-label">batch_size</div>
                <div className="config-val">32</div>
              </div>
              <div className="config-item">
                <div className="config-label">offpolicyness (η)</div>
                <div className="config-val">4</div>
              </div>
              <div className="config-item">
                <div className="config-label">behav_weight_cap</div>
                <div className="config-val">5.0</div>
              </div>
              <div className="config-item">
                <div className="config-label">dtype</div>
                <div className="config-val">bfloat16</div>
              </div>
              <div className="config-item">
                <div className="config-label">allocation</div>
                <div className="config-val">d4p1t1 + d4p1t1</div>
              </div>
            </div>
            <div style={{ marginTop: "1.5rem", fontSize: "0.85rem", opacity: 0.8, textAlign: "right" }}>
              <a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5-RL/blob/9f9ce7d/configs/llavaov15-8b_stage1_grpo.yaml" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>View full config on GitHub →</a>
            </div>
          </div>

          <hr style={{ borderTop: "1px solid rgba(254, 215, 170, 0.2)", margin: "3rem 0" }} />
          <h2>Acknowledgements</h2>

          <p>We thank the following projects and frameworks:</p>

          <ul>
            <li><a href="https://github.com/inclusionAI/AReaL" target="_blank" rel="noopener noreferrer">AReaL</a>: Lightning-Fast RL for LLM Reasoning and Agents</li>
            <li><a href="https://github.com/sgl-project/sglang" target="_blank" rel="noopener noreferrer">sglang</a>: Fast serving framework for LLMs and vision language models</li>
            <li><a href="https://github.com/EvolvingLMMs-Lab/lmms-eval" target="_blank" rel="noopener noreferrer">lmms-eval</a>: Standardized evaluation framework</li>
            <li><a href="https://github.com/haotian-liu/LLaVA" target="_blank" rel="noopener noreferrer">LLaVA</a>: Large Language-and-Vision Assistant</li>
            <li><a href="https://github.com/LLaVA-VL/LLaVA-NeXT" target="_blank" rel="noopener noreferrer">LLaVA-NeXT</a>: Next-generation multi-modal assistant</li>
          </ul>

          {/* Resources Card */}
          <div className="lov15-resource-card">
            <div className="lov15-resource-header">
              <div className="lov15-resource-header-accent" />
              <h3>Open-Source Resources</h3>
              <p>Complete LLaVA-OneVision-1.5-RL resources for the community.</p>
            </div>

            <div className="lov15-resource-grid">
              <div className="lov15-resource-group">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x2318;</span>
                  <h4>Code &amp; Paper</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://arxiv.org/abs/2509.23661" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>Research Paper</strong>
                      <span className="lov15-resource-badge">arXiv</span>
                    </div>
                    <span>Read the full technical paper on arXiv</span>
                  </a>
                  <a href="https://github.com/EvolvingLMMs-Lab/-LLaVA-OneVision-1.5-RL" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>Training Code</strong>
                      <span className="lov15-resource-badge">GitHub</span>
                    </div>
                    <span>RL training code and reproduction scripts</span>
                  </a>
                </div>
              </div>

              <div className="lov15-resource-group">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x25C8;</span>
                  <h4>Model Checkpoints</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://huggingface.co/mvp-lab/LLAVA-OV-1.5-8B-RL" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>LLAVA-OV-1.5-8B-RL</strong>
                      <span className="lov15-resource-badge lov15-badge-accent">8B</span>
                    </div>
                    <span>Pre-trained model with RL optimization</span>
                  </a>
                </div>
              </div>

              <div className="lov15-resource-group lov15-resource-group-wide">
                <div className="lov15-resource-group-label">
                  <span className="lov15-resource-group-icon">&#x2592;</span>
                  <h4>Training Datasets &amp; Base Model</h4>
                </div>
                <div className="lov15-resource-items">
                  <a href="https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-1.5-RL-Data" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>LLaVA-OneVision-1.5-RL-Data</strong>
                      <span className="lov15-resource-badge lov15-badge-accent">67K samples</span>
                    </div>
                    <span>Curated RL training data with discrepancy-driven selection</span>
                  </a>
                  <a href="https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-1.5" target="_blank" rel="noopener noreferrer" className="lov15-resource-item">
                    <div className="lov15-resource-item-top">
                      <strong>LLaVA-OneVision-1.5</strong>
                      <span className="lov15-resource-badge">Base</span>
                    </div>
                    <span>LLaVA-OneVision-1.5 foundation model</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Citation */}
          <div className="lov15-citation">
            <div className="lov15-citation-head">
              <div>
                <h2>Citation</h2>
              </div>
            </div>
            <div className="lov15-code-demo">
              <div className="lov15-code-toolbar">
                <div className="lov15-code-dots">
                  <span /><span /><span />
                </div>
                <div className="lov15-code-title">citation.bib</div>
                <div className="lov15-code-toolbar-actions">
                  <div className="lov15-code-lang">bibtex</div>
                  <button type="button" className="lov15-copy-button" onClick={() => handleCopy("citation", `${bibtex1}\n\n${bibtex2}\n\n${bibtex3}`)}>
                    {copiedBlock === "citation" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="lov15-code-body">
                <pre><code>{bibtex1}
{"\n\n"}
{bibtex2}
{"\n\n"}
{bibtex3}</code></pre>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
