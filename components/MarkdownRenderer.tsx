import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TocItem } from "../lib/toc";

interface MarkdownRendererProps {
  content: string;
  headings?: TocItem[];
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (typeof node === 'object' && 'props' in node) return getTextContent((node as any).props.children);
  return '';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  headings,
}) => {
  const headingTextToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of headings ?? []) {
      if (!map.has(h.text)) map.set(h.text, h.id);
    }
    return map;
  }, [headings]);

  const findHeadingId = (children: React.ReactNode) => {
    const text = getTextContent(children).trim();
    return headingTextToId.get(text);
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-4xl md:text-5xl font-display font-bold italic text-p3cyan mb-6 mt-8 border-b-2 border-white/20 pb-4"
              {...props}
            />
          ),
          h2: ({ node, children, ...props }) => {
            const id = findHeadingId(children);
            return (
              <div className="flex items-center space-x-4 mt-8 mb-4">
                <div className="w-2 h-8 bg-p3blue transform -skew-x-12" />
                <h2
                  id={id}
                  className="text-2xl font-bold text-white uppercase tracking-wider scroll-mt-24"
                  {...props}
                >{children}</h2>
              </div>
            );
          },
          h3: ({ node, children, ...props }) => {
            const id = findHeadingId(children);
            return (
              <div className="flex items-center space-x-3 mt-6 mb-3">
                <div className="w-1 h-6 bg-p3mid transform -skew-x-12" />
                <h3
                  id={id}
                  className="text-xl font-bold text-white/90 uppercase tracking-wide scroll-mt-24"
                  {...props}
                >{children}</h3>
              </div>
            );
          },
          p: ({ node, ...props }) => (
            <p
              className="text-p3white leading-loose mb-4 text-base"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside ml-6 mb-6 space-y-2 text-p3white marker:text-p3blue"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-p3blue bg-p3blue/10 p-4 my-6 text-white/90"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-([\w-]+)/.exec(className || "");
            if (match) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus}
                  customStyle={{
                    background: "#0D1B2A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderLeft: "4px solid #51EEFC",
                    margin: "1.5rem 0",
                    padding: "1rem",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
            if (String(children).includes("\n")) {
              return (
                <pre className="bg-p3dark p-4 border-l-4 border-p3cyan border border-white/10 overflow-x-auto my-6 text-sm">
                  <code className="text-white" {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code
                className="bg-p3dark/60 text-p3cyan font-mono px-2 py-1 text-sm break-all"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => <>{children}</>,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="w-full border-collapse border border-white/20 text-sm"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-p3blue/30" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-white/20 px-4 py-2 text-left text-white font-bold uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-white/20 px-4 py-2 text-p3white"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
