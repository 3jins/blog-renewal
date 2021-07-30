import _ from 'lodash';
import marked, { Tokenizer, TokensList } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

export const renderContent = (rawContent: string) => {
  const MATH: string = 'Math';

  const renderer = {
    code(code, infostring) {
      return infostring === MATH
        ? katex.renderToString(code, { throwOnError: false, displayMode: true })
        : false;
    },
  };

  const tokenizer: Tokenizer = {
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
  const tokenList: TokensList = marked.lexer(rawContent);
  tokenList
    .forEach((token, idx) => {
      if (token.type === 'table') {
        const tableHtml: string = marked.parser([token] as TokensList)
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

  // TODO: tokenList로부터 TOC 추출
  return marked.parser(tokenList);
};
