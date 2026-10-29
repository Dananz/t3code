import type { ReactNode } from "react";
import { markdownCodeParts } from "~/textDirection";

export function BidiMarkdownText(props: { text: string; maxChars?: number }) {
  let previousSpace = false;
  const parts = [];
  for (const part of markdownCodeParts(props.text)) {
    let text = part.text;
    if (props.maxChars !== undefined) {
      text = text.replace(/\s+/g, " ");
      if (previousSpace && text.startsWith(" ")) text = text.slice(1);
      if (text.length > 0) previousSpace = text.endsWith(" ");
    }
    parts.push({ ...part, text });
  }
  const length = parts.reduce((total, part) => total + part.text.length, 0);
  const limit = props.maxChars ?? length;
  const content: Array<ReactNode> = [];
  let rendered = 0;
  for (const part of parts) {
    if (rendered >= limit) break;
    let text = part.text.slice(0, limit - rendered);
    rendered += text.length;
    if (rendered === limit && length > limit) text += "…";
    if (part.code) {
      content.push(
        <bdi dir="ltr" key={part.start}>
          {text}
        </bdi>,
      );
    } else {
      content.push(text);
    }
  }
  return content;
}
