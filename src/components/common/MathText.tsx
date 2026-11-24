import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

const TOKEN_CHAR_RE = /[A-Za-z0-9_°²³¹⁴⁵⁶⁷⁸⁹⁰'√Δαβγπ]/;
const TRIG_WORDS = ['Đối', 'Kề', 'Huyền'];
const VIET_ACCENT_RE =
  /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]/;
const UNARY_MINUS_PREV_RE = /[\s([=,;:≠<≤>≥➔⇔⇒+\-*×·]/;

/**
 * Repairs common JSON-escape corruption (\f -> formfeed in \frac, \t -> tab in \times/\text,
 * \b -> backspace in \beta/\begin, \r -> CR in \rightarrow) and standardizes Vietnamese TeX aliases.
 */
export function repairMathNotation(input: string): string {
  if (!input) return '';
  return input
    .replace(/\x0c(?=[a-zA-Z])/g, '\\f')
    .replace(/\x08(?=[a-zA-Z])/g, '\\b')
    .replace(/\r(?=[a-zA-Z])/g, '\\r')
    .replace(/\t(?=(?:imes|ext|an|heta|au|riangle|o(?![a-zA-Z])|op|frac|ilde|hick))/g, '\\t')
    .replace(/\\cotg(?![a-zA-Z])/g, '\\cot')
    .replace(/\\tg(?![a-zA-Z])/g, '\\tan')
    .replace(/\\degree(?![a-zA-Z])/g, '^\\circ')
    .replace(/\\widehat\s*([A-Z]{2,4})(?![a-zA-Z{])/g, '\\widehat{$1}')
    .replace(/\\vec\s*([A-Z]{1,3})(?![a-zA-Z{])/g, '\\vec{$1}')
    .replace(/\\overline\s*([A-Z]{1,4})(?![a-zA-Z{])/g, '\\overline{$1}');
}

function renderKatexHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return latex;
  }
}

interface FractionMatch {
  start: number;
  end: number;
  leadingSign: string;
  numerator: string;
  denominator: string;
}

function isMathTerm(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (TRIG_WORDS.includes(trimmed)) return true;
  const strippedTrig = trimmed
    .replace(/Đối/g, '')
    .replace(/Kề/g, '')
    .replace(/Huyền/g, '');
  if (VIET_ACCENT_RE.test(strippedTrig)) return false;
  return /[A-Za-z0-9Δαβγπ√]/.test(trimmed);
}

function findMatchingOpen(text: string, closeIdx: number): number {
  const closeChar = text[closeIdx];
  const openChar = closeChar === ')' ? '(' : '[';
  let depth = 0;
  for (let i = closeIdx; i >= 0; i--) {
    if (text[i] === closeChar) depth++;
    else if (text[i] === openChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findMatchingClose(text: string, openIdx: number): number {
  const openChar = text[openIdx];
  const closeChar = openChar === '(' ? ')' : ']';
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    else if (text[i] === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function matchFractionAt(line: string, slashIdx: number): FractionMatch | null {
  if (slashIdx <= 0 || slashIdx >= line.length - 1) return null;
  if (line[slashIdx - 1] === '/' || line[slashIdx + 1] === '/') return null;
  if (line.slice(Math.max(0, slashIdx - 6), slashIdx).includes(':')) return null;

  let leftEnd = slashIdx - 1;
  while (leftEnd >= 0 && line[leftEnd] === ' ') leftEnd--;
  if (leftEnd < 0) return null;

  let leftStart = -1;
  let rawNum = '';
  let leadingSign = '';

  const hasTrailingSup =
    leftEnd > 0 &&
    /[²³¹⁰⁴⁵⁶⁷⁸⁹]/.test(line[leftEnd]) &&
    (line[leftEnd - 1] === ')' || line[leftEnd - 1] === ']');
  const groupCloseIdx = hasTrailingSup ? leftEnd - 1 : leftEnd;

  if (line[groupCloseIdx] === ')' || line[groupCloseIdx] === ']') {
    const openIdx = findMatchingOpen(line, groupCloseIdx);
    if (openIdx === -1) return null;
    leftStart = openIdx;
    let prefixStart = openIdx;
    while (prefixStart > 0 && /[A-Za-z0-9_']/.test(line[prefixStart - 1])) {
      prefixStart--;
    }
    if (prefixStart < openIdx || hasTrailingSup) {
      leftStart = prefixStart;
      rawNum = line.slice(leftStart, leftEnd + 1);
    } else {
      rawNum = line.slice(openIdx + 1, groupCloseIdx).trim();
    }
  } else {
    let matchedTrig = '';
    for (const w of TRIG_WORDS) {
      if (leftEnd + 1 >= w.length && line.slice(leftEnd + 1 - w.length, leftEnd + 1) === w) {
        const beforeIdx = leftEnd + 1 - w.length - 1;
        if (beforeIdx < 0 || !TOKEN_CHAR_RE.test(line[beforeIdx])) {
          matchedTrig = w;
          leftStart = leftEnd + 1 - w.length;
          break;
        }
      }
    }

    if (!matchedTrig) {
      let idx = leftEnd;
      while (idx >= 0 && TOKEN_CHAR_RE.test(line[idx])) {
        idx--;
      }
      leftStart = idx + 1;
      if (leftStart > leftEnd) return null;
      rawNum = line.slice(leftStart, leftEnd + 1);

      if (leftStart > 0 && line[leftStart - 1] === '-') {
        const prevIdx = leftStart - 2;
        if (prevIdx < 0 || UNARY_MINUS_PREV_RE.test(line[prevIdx])) {
          leftStart = leftStart - 1;
          leadingSign = '−';
        }
      }
    } else {
      rawNum = matchedTrig;
    }
  }

  if (!isMathTerm(rawNum)) return null;

  let checkBefore = leftStart - 1;
  while (checkBefore >= 0 && line[checkBefore] === ' ') checkBefore--;
  if (checkBefore >= 0 && line[checkBefore] === '/') return null;

  let rightStart = slashIdx + 1;
  while (rightStart < line.length && line[rightStart] === ' ') rightStart++;
  if (rightStart >= line.length) return null;

  let rightEnd = -1;
  let rawDen = '';

  if (line[rightStart] === '(' || line[rightStart] === '[') {
    const closeIdx = findMatchingClose(line, rightStart);
    if (closeIdx === -1) return null;
    rightEnd = closeIdx;
    if (closeIdx + 1 < line.length && /[²³¹⁰⁴⁵⁶⁷⁸⁹]/.test(line[closeIdx + 1])) {
      rightEnd = closeIdx + 1;
      rawDen = line.slice(rightStart, rightEnd + 1);
    } else {
      rawDen = line.slice(rightStart + 1, closeIdx).trim();
    }
  } else {
    let matchedTrig = '';
    for (const w of TRIG_WORDS) {
      if (line.startsWith(w, rightStart)) {
        const afterIdx = rightStart + w.length;
        if (afterIdx >= line.length || !TOKEN_CHAR_RE.test(line[afterIdx])) {
          matchedTrig = w;
          rightEnd = afterIdx - 1;
          break;
        }
      }
    }

    if (!matchedTrig) {
      let idx = rightStart;
      while (idx < line.length && TOKEN_CHAR_RE.test(line[idx])) {
        idx++;
      }
      rightEnd = idx - 1;
      if (rightEnd < rightStart) return null;
      rawDen = line.slice(rightStart, rightEnd + 1);
    } else {
      rawDen = matchedTrig;
    }
  }

  if (!isMathTerm(rawDen)) return null;

  let checkAfter = rightEnd + 1;
  while (checkAfter < line.length && line[checkAfter] === ' ') checkAfter++;
  if (checkAfter < line.length && line[checkAfter] === '/') return null;

  if (/^0\d+$/.test(rawNum) || /^(19|20)\d{2}$/.test(rawDen)) return null;

  return {
    start: leftStart,
    end: rightEnd + 1,
    leadingSign,
    numerator: rawNum,
    denominator: rawDen,
  };
}

function renderLineWithFractions(line: string, depth = 0, keyPrefix = 'p'): React.ReactNode[] {
  if (depth > 2 || !line.includes('/')) {
    return [line];
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let searchFrom = 0;

  while (searchFrom < line.length) {
    const slashIdx = line.indexOf('/', searchFrom);
    if (slashIdx === -1) break;

    const match = matchFractionAt(line, slashIdx);
    if (!match || match.start < cursor) {
      searchFrom = slashIdx + 1;
      continue;
    }

    if (match.start > cursor) {
      nodes.push(line.slice(cursor, match.start));
    }

    nodes.push(
      <span key={`${keyPrefix}-frac-${match.start}-${depth}`} className="inline-flex items-center align-middle">
        {match.leadingSign && (
          <span className="mr-0.5 font-semibold">{match.leadingSign}</span>
        )}
        <span className="inline-flex flex-col items-center justify-center align-middle mx-1 leading-[1.1] text-[0.88em]">
          <span className="px-1 pb-[2px] border-b border-current text-center whitespace-nowrap">
            {renderLineWithFractions(match.numerator, depth + 1, `${keyPrefix}-n-${match.start}`)}
          </span>
          <span className="px-1 pt-[2px] text-center whitespace-nowrap">
            {renderLineWithFractions(match.denominator, depth + 1, `${keyPrefix}-d-${match.start}`)}
          </span>
        </span>
      </span>
    );

    cursor = match.end;
    searchFrom = match.end;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  return nodes;
}

function consumeBalancedGroup(str: string, start: number, openChar = '{', closeChar = '}'): number {
  if (str[start] !== openChar) return start;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return str.length;
}

function wrapBareLatexTokens(plainSegment: string): Array<{ type: 'text' | 'katex'; value: string }> {
  const tokens: Array<{ type: 'text' | 'katex'; value: string }> = [];
  const bareTriggerRe =
    /\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}|\\(?:dfrac|tfrac|cfrac|frac|sqrt|widehat|widetilde|overline|underline|overrightarrow|vec|mathbb|mathcal|mathbf|mathrm|text|binom|le|leq|ge|geq|neq|ne|in|notin|subset|subseteq|supset|cup|cap|setminus|emptyset|varnothing|forall|exists|Rightarrow|Leftrightarrow|Leftarrow|rightarrow|leftarrow|leftrightarrow|implies|iff|approx|equiv|cong|sim|perp|parallel|angle|triangle|Delta|alpha|beta|gamma|theta|varphi|phi|pi|omega|infty|pm|mp|cdot|times|div|sum|prod|int|lim|sin|cos|tan|cot|log|ln)\b|[A-Za-z0-9)\]}]\s*[\^_]\{[^}]+\}/g;

  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = bareTriggerRe.exec(plainSegment)) !== null) {
    const start = match.index;
    if (start < cursor) continue;

    let end = start + match[0].length;

    if (plainSegment[start] === '\\' && !match[0].startsWith('\\begin')) {
      let scan = end;
      while (scan < plainSegment.length) {
        while (scan < plainSegment.length && plainSegment[scan] === ' ') scan++;
        if (plainSegment[scan] === '[') {
          scan = consumeBalancedGroup(plainSegment, scan, '[', ']');
          end = scan;
        } else if (plainSegment[scan] === '{') {
          scan = consumeBalancedGroup(plainSegment, scan, '{', '}');
          end = scan;
        } else if ((plainSegment[scan] === '^' || plainSegment[scan] === '_') && plainSegment[scan + 1] === '{') {
          scan = consumeBalancedGroup(plainSegment, scan + 1, '{', '}');
          end = scan;
        } else {
          break;
        }
      }
      bareTriggerRe.lastIndex = end;
    }

    if (start > cursor) {
      tokens.push({ type: 'text', value: plainSegment.slice(cursor, start) });
    }
    tokens.push({ type: 'katex', value: plainSegment.slice(start, end) });
    cursor = end;
  }

  if (cursor < plainSegment.length) {
    tokens.push({ type: 'text', value: plainSegment.slice(cursor) });
  }

  return tokens;
}

function renderMixedLine(line: string, lineKey: number): React.ReactNode {
  const mathDelimiterRe = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\d[\d.,]*\s)([^$\n]+?)\$/g;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let segIdx = 0;

  const pushPlainText = (plain: string) => {
    const subTokens = wrapBareLatexTokens(plain);
    subTokens.forEach((tok, tIdx) => {
      if (tok.type === 'katex') {
        const html = renderKatexHtml(tok.value, false);
        parts.push(
          <span
            key={`l${lineKey}-bk${segIdx}-${tIdx}`}
            className="inline-block align-middle mx-0.5 [&_.katex]:text-[1.04em]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else {
        parts.push(
          <React.Fragment key={`l${lineKey}-txt${segIdx}-${tIdx}`}>
            {renderLineWithFractions(tok.value, 0, `l${lineKey}-s${segIdx}-${tIdx}`)}
          </React.Fragment>
        );
      }
    });
  };

  while ((match = mathDelimiterRe.exec(line)) !== null) {
    if (match.index > cursor) {
      pushPlainText(line.slice(cursor, match.index));
    }

    const isDisplay = Boolean(match[1] !== undefined || match[2] !== undefined);
    const expr = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
    const html = renderKatexHtml(expr, isDisplay);

    parts.push(
      <span
        key={`l${lineKey}-kx${segIdx}`}
        className={
          isDisplay
            ? 'block my-1.5 overflow-x-auto [&_.katex-display]:my-1'
            : 'inline-block align-middle mx-0.5 [&_.katex]:text-[1.04em]'
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );

    cursor = match.index + match[0].length;
    segIdx++;
  }

  if (cursor < line.length) {
    pushPlainText(line.slice(cursor));
  }

  return parts;
}

export const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  if (!text) return null;

  const normalized = repairMathNotation(text);

  if (
    normalized.includes('$$') ||
    normalized.includes('\\[') ||
    normalized.includes('\\begin{')
  ) {
    const blockRe = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\begin\{([^}]+)\}[\s\S]*?\\end\{\2\})/g;
    const chunks: React.ReactNode[] = [];
    let cursor = 0;
    let m: RegExpExecArray | null;
    let idx = 0;

    while ((m = blockRe.exec(normalized)) !== null) {
      if (m.index > cursor) {
        const before = normalized.slice(cursor, m.index);
        before.split('\n').forEach((ln, lIdx, arr) => {
          chunks.push(
            <React.Fragment key={`pre-${idx}-${lIdx}`}>
              {renderMixedLine(ln, idx * 100 + lIdx)}
              {lIdx < arr.length - 1 && '\n'}
            </React.Fragment>
          );
        });
      }

      const rawBlock = m[0];
      const isDisplay = rawBlock.startsWith('$$') || rawBlock.startsWith('\\[');
      const inner = rawBlock.startsWith('$$')
        ? rawBlock.slice(2, -2)
        : rawBlock.startsWith('\\[')
        ? rawBlock.slice(2, -2)
        : rawBlock;

      chunks.push(
        <span
          key={`blk-${idx}`}
          className={
            isDisplay
              ? 'block my-1.5 overflow-x-auto [&_.katex-display]:my-1'
              : 'inline-block align-middle mx-0.5 [&_.katex]:text-[1.04em]'
          }
          dangerouslySetInnerHTML={{ __html: renderKatexHtml(inner, isDisplay) }}
        />
      );
      cursor = m.index + rawBlock.length;
      idx++;
    }

    if (cursor < normalized.length) {
      const rest = normalized.slice(cursor);
      rest.split('\n').forEach((ln, lIdx, arr) => {
        chunks.push(
          <React.Fragment key={`post-${lIdx}`}>
            {renderMixedLine(ln, 9000 + lIdx)}
            {lIdx < arr.length - 1 && '\n'}
          </React.Fragment>
        );
      });
    }

    return <span className={className}>{chunks}</span>;
  }

  const lines = normalized.split('\n');
  if (lines.length === 1) {
    return <span className={className}>{renderMixedLine(normalized, 0)}</span>;
  }

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderMixedLine(line, i)}
          {i < lines.length - 1 && '\n'}
        </React.Fragment>
      ))}
    </span>
  );
};
