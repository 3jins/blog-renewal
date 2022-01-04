import _ from 'lodash';
import { marked, Tokenizer } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import { Heading } from '@src/post/model/PostVersion';
import { makeDefaultThumbnailContent, makeToc } from '@src/common/marked/MarkedMetaDataUtil';

export const renderContent = (rawContent: string): { renderedContent: string, toc: Heading[], defaultThumbnailContent: string } => {
  const MATH: string = 'Math';

  const renderer = {
    code(code, infostring) {
      return infostring === MATH
        ? katex.renderToString(code, { throwOnError: false, displayMode: true })
        : false;
    },
  };

  const tokenizer: Tokenizer = {
    /**
     * emStrong
     *
     * - Little fix of Copy-and-paste from emStrong tokenizer code of `markedjs` library.
     *   - v4.0.8
     *   - https://github.com/markedjs/marked/blob/v4.0.8/src/Tokenizer.js#L567-L631
     *   - https://github.com/markedjs/marked/blob/v4.0.8/src/rules.js#L168-L174
     * - Check this issue:
     *   - https://github.com/markedjs/marked/issues/2154#issuecomment-890300422
     */
    // @ts-ignore
    emStrong(src, maskedSrc, prevChar = '') {
      /* eslint-disable */
      // All `punct`s are removed from the rules.
      const rules = {
          lDelim: /^(?:\*+(?:([_])|[^\s*]))|^_+(?:([*])|([^\s_]))/,
          rDelimAst: /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[_](\*+)(?=[\s]|$)|[^*_\s](\*+)(?=[_\s]|$)|[_\s](\*+)(?=[^*_\s])|[\s](\*+)(?=[_])|[_](\*+)(?=[_])|[^*_\s](\*+)(?=[^*_\s])/,
          rDelimUnd: /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[*](\_+)(?=[\s]|$)|[^*_\s](\_+)(?=[*\s]|$)|[*\s](\_+)(?=[^*_\s])|[\s](\_+)(?=[*])|[*](\_+)(?=[*])/,
      };

      let match = rules.lDelim.exec(src);
      if (!match) return;

      if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

      const nextChar = match[1] || match[2] || '';

      if (!nextChar || (nextChar && (prevChar === ''))) { // No need to check punctuation here
        const lLength = match[0].length - 1;
        let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

        const endReg = match[0][0] === '*' ? rules.rDelimAst : rules.rDelimUnd;
        endReg.lastIndex = 0;

        maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

        while ((match = endReg.exec(maskedSrc)) != null) {
          rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

          if (!rDelim) continue;

          rLength = rDelim.length;

          if (match[3] || match[4]) {
            delimTotal += rLength;
            continue;
          } else if (match[5] || match[6]) {
            if (lLength % 3 && !((lLength + rLength) % 3)) {
              midDelimTotal += rLength;
              continue;
            }
          }

          delimTotal -= rLength;

          if (delimTotal > 0) continue;

          rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

          if (Math.min(lLength, rLength) % 2) {
            const text = src.slice(1, lLength + match.index + rLength);
            return {
              type: 'em',
              raw: src.slice(0, lLength + match.index + rLength + 1),
              text,
              tokens: this.lexer.inlineTokens(text, [])
            };
          }

          const text = src.slice(2, lLength + match.index + rLength - 1);
          return {
            type: 'strong',
            raw: src.slice(0, lLength + match.index + rLength + 1),
            text,
            tokens: this.lexer.inlineTokens(text, [])
          };
        }
      }
      /* eslint-enable */
    },

    // @ts-ignore
    inlineText(src) {
      const cap = src.match(/(\s*)([^$\n]*)\$([^$\n]+)\$([^$\n]*)/);
      return _.isNil(cap)
        ? false
        : {
          type: 'text',
          raw: cap[0],
          text: cap[2] + katex.renderToString(cap[3].trim(), { throwOnError: false }) + cap[4],
        };
    },

    // @ts-ignore
    fences(src) {
      const cap = src.match(
        /^ {0,3}(`{3,}|\${2,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`$]* *(?:\n+|$)|$)/,
      );
      return _.isNil(cap)
        ? false
        : {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          lang: cap[1] === '$$' ? MATH : cap[2].trim(),
          text: cap[3],
        };
    },
  };

  marked.use({ tokenizer, renderer });
  marked.setOptions({
    breaks: true,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return `<pre class="hljs"><code class = "language-${language} hljs">${hljs.highlight(code, { language }).value}</code></pre>`;
    },
  });
  const tokenList: marked.TokensList = marked.lexer(rawContent);
  tokenList
    .forEach((token, idx) => {
      if (token.type === 'table') {
        const tableHtml: string = marked.parser([token] as marked.TokensList)
          .replace(/align="left"/ig, 'style="text-align:left;"')
          .replace(/align="right"/ig, 'style="text-align:right;"')
          .replace(/align="center"/ig, 'style="text-align:center;"')
          .replace(/align="justify"/ig, 'style="text-align:justify;"');
        tokenList[idx] = {
          type: 'html',
          raw: tableHtml,
          pre: false,
          text: tableHtml,
        };
      }
    });

  const renderedContent: string = marked.parser(tokenList);
  const toc: Heading[] = makeToc(tokenList);
  const defaultThumbnailContent: string = makeDefaultThumbnailContent(tokenList);

  return { renderedContent, toc, defaultThumbnailContent };
};
