import { MDXRemote } from "next-mdx-remote/rsc";
import { ResponsiveImage } from "./ResponsiveImage";
import { ResourceCard } from "./ResourceCard";
import { QuickLinks } from "./QuickLinks";
import { CodeDemo } from "./CodeDemo";
import { RLDonutCharts } from "./RLDonutCharts";
import { Collapsible } from "./Collapsible";
import {
  DitherPattern,
  PixelShape,
  PixelDivider,
  PixelRadar,
} from "@/components/decorative";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const components = {
  ResponsiveImage,
  ResourceCard,
  QuickLinks,
  CodeDemo,
  RLDonutCharts,
  Collapsible,
  DitherPattern,
  PixelShape,
  PixelDivider,
  PixelRadar,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      style={{
        maxWidth: "100%",
        height: "auto",
        boxShadow: "0 0 0 1px currentColor",
        margin: "var(--space-md) 0",
      }}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
    />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  ),
};

interface MDXRemoteWrapperProps {
  source: string;
}

export function MDXRemoteWrapper({ source }: MDXRemoteWrapperProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: "github-dark",
                keepBackground: false,
              },
            ],
            rehypeKatex,
            rehypeSlug,
          ],
        },
      }}
    />
  );
}
