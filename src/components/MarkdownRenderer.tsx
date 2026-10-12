import React, { useMemo, isValidElement, ReactElement } from "react";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { TocItem } from "@/lib/toc";

interface MarkdownRendererProps {
  content: string;
  headings?: TocItem[];
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (isValidElement(node)) return getTextContent((node as ReactElement<{children?: React.ReactNode}>).props.children);
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
    <div className="markdown-content text-p3white text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1
              className="text-4xl md:text-5xl font-display font-bold italic text-p3cyan mb-6 mt-8 border-b-2 border-white/20 pb-4"
              {...props}
            />
          ),
          h2: ({ node: _node, children, ...props }) => {
            const id = findHeadingId(children);
            return (
              <div className="flex items-center space-x-4 mt-8 mb-4">
                <div className="w-2 h-8 shrink-0 bg-p3blue transform -skew-x-12" />
                <h2
                  id={id}
                  className="text-2xl font-bold text-white uppercase tracking-wider scroll-mt-24"
                  {...props}
                >{children}</h2>
              </div>
            );
          },
          h3: ({ node: _node, children, ...props }) => {
            const id = findHeadingId(children);
            return (
              <div className="flex items-center space-x-3 mt-6 mb-3">
                <div className="w-1 h-6 shrink-0 bg-p3mid transform -skew-x-12" />
                <h3
                  id={id}
                  className="text-xl font-bold text-white/90 uppercase tracking-wide scroll-mt-24"
                  {...props}
                >{children}</h3>
              </div>
            );
          },
          h4: ({ node: _node, ...props }) => <h4 className="mt-6 mb-3 text-lg font-bold text-white" {...props} />,
          h5: ({ node: _node, ...props }) => <h5 className="mt-5 mb-2 text-base font-bold text-white" {...props} />,
          h6: ({ node: _node, ...props }) => <h6 className="mt-4 mb-2 text-sm font-bold text-p3mid" {...props} />,
          strong: ({ node: _node, ...props }) => <strong className="font-semibold underline decoration-wavy decoration-p3cyan decoration-2 underline-offset-4" {...props} />,
          hr: ({ node: _node, ...props }) => <hr className="my-8 border-white/20" {...props} />,
          ol: ({ node: _node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 marker:text-p3cyan" {...props} />,
          p: ({ node: _node, ...props }) => (
            <p
              className="leading-loose mb-4"
              {...props}
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul
              className="list-disc list-outside ml-6 mb-6 space-y-2 marker:text-p3blue"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => <li className="pl-2" {...props} />,
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-4 border-p3blue bg-p3blue/10 p-4 my-6 text-p3mid text-sm"
              {...props}
            />
          ),
          a: ({ node: _node, href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-p3cyan font-semibold underline decoration-p3cyan/40 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-p3cyan"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ node: _node, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & ExtraProps) => {
            const match = /language-([\w-]+)/.exec(className || "");
            if (match) {
              return React.createElement(
                SyntaxHighlighter,
                {
                  language: match[1],
                  style: vscDarkPlus,
                  customStyle: {
                    background: "#0D1B2A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderLeft: "4px solid #0FB1F5",
                    margin: "1.5rem 0",
                    padding: "1rem",
                  },
                  ...props,
                } as React.ComponentProps<typeof SyntaxHighlighter>,
                String(children).replace(/\n$/, ""),
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
          pre: ({ children }: React.ComponentPropsWithoutRef<'pre'> & ExtraProps) => <>{children}</>,
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="w-full border-collapse border border-white/20 text-sm"
                {...props}
              />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead className="bg-p3blue/30" {...props} />
          ),
          th: ({ node: _node, ...props }) => (
            <th
              className="border border-white/20 px-4 py-2 text-left text-white font-bold uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node: _node, ...props }) => (
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
