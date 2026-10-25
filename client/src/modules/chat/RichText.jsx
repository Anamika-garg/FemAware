import { Fragment } from 'react';

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

const renderInline = (text, keyPrefix) => {
  const parts = String(text).split(INLINE_RE).filter((part) => part !== '');

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-rose-mist px-1 py-0.5 text-[0.9em] text-deep-rose">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
};

const isBullet = (line) => /^\s*[-*]\s+/.test(line);
const isNumbered = (line) => /^\s*\d+\.\s+/.test(line);
const isHeading = (line) => /^\s*#{1,4}\s+/.test(line);
const isQuote = (line) => /^\s*>\s?/.test(line);

/**
 * A deliberately small markdown renderer for model answers. It supports the
 * subset the prompt asks for — headings, bullets, numbered lists, bold, italic,
 * inline code and blockquotes — without dangerouslySetInnerHTML.
 */
const RichText = ({ text = '', className = '' }) => {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-line" />);
      index += 1;
      continue;
    }

    if (isHeading(line)) {
      const content = line.replace(/^\s*#{1,4}\s+/, '');
      blocks.push(
        <h4 key={`h-${index}`} className="mt-4 font-semibold text-ink first:mt-0">
          {renderInline(content, `h-${index}`)}
        </h4>
      );
      index += 1;
      continue;
    }

    if (isBullet(line)) {
      const items = [];
      while (index < lines.length && isBullet(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`} className="my-2 list-disc space-y-1.5 pl-5 marker:text-deep-rose">
          {items.map((item, itemIndex) => (
            <li key={`ul-${index}-${itemIndex}`}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (isNumbered(line)) {
      const items = [];
      while (index < lines.length && isNumbered(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`} className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-deep-rose">
          {items.map((item, itemIndex) => (
            <li key={`ol-${index}-${itemIndex}`}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (isQuote(line)) {
      const items = [];
      while (index < lines.length && isQuote(lines[index])) {
        items.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="my-3 rounded-lg border-l-4 border-blush-pink bg-rose-mist/60 px-4 py-2.5 text-sm text-muted"
        >
          {items.map((item, itemIndex) => (
            <p key={`quote-${index}-${itemIndex}`}>{renderInline(item, `quote-${index}-${itemIndex}`)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // A normal paragraph. Keep consecutive text lines together so soft line
    // breaks from the model do not create a wall of tiny paragraphs.
    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBullet(lines[index]) &&
      !isNumbered(lines[index]) &&
      !isHeading(lines[index]) &&
      !isQuote(lines[index]) &&
      !/^\s*---+\s*$/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }

    blocks.push(
      <p key={`p-${index}`} className="my-2 first:mt-0 last:mb-0">
        {renderInline(paragraph.join(' '), `p-${index}`)}
      </p>
    );
  }

  return <div className={className}>{blocks}</div>;
};

export default RichText;
