import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check } from 'lucide-react';

type Props = {
  code: string;
  language: string;
};

export default function CodeBlockDemo({ code, language }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '20px',
        fontSize: '0.9rem',
        boxShadow: '0 0 0 1px #333',
      }}
    >
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#1e1e1e',
          color: '#fff',
          border: 'none',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 10,
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          background: '#1e1e1e',
        }}
        showLineNumbers
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
