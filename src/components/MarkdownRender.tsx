import ReactMarkdown from "react-markdown"
import CodeBlock from "./CodeBlock"
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
interface MarkdownRenderProps {
  value: string
}
export default function MarkdownRender(props: MarkdownRenderProps) {
  return <ReactMarkdown className="markdown-body" components={{
    code({ className, inline, children }) {
      if (inline) {
        return <span className="px-1 bg-gray-300 rounded">{String(children).replace(/\n$/, '')}</span>
      }
      const match = /language-(\w+)/.exec(className || '')
      let language = 'text'
      if (match !== null && match !== undefined) {
        language = match[1]
      }
      return <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />
    }
  }}
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}>{props.value}</ReactMarkdown>
}