import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ content }: { content: string }) {
  if (!content?.trim()) {
    return <p className="text-muted-foreground italic">No content</p>;
  }
  return (
    <div className="prose-reader">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
