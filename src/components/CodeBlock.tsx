import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
interface CodeBlockProps {
  language: string;
  value: string
}

export default function CodeBlock(props: CodeBlockProps) {
  return <SyntaxHighlighter
    showLineNumbers={true}
    startingLineNumber={1}
    language={props.language}
    style={oneDark}
    // style={atomOneDark}
    lineNumberStyle={{ color: '#aaa', fontSize: 15 }}
    wrapLines={true}
  >
    {props.value}
  </SyntaxHighlighter>
}