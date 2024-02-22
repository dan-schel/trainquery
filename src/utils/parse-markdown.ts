export function parseMarkdown(markdown: string) {
  const lines = escapeHtml(markdown)
    .split("\n")
    .map((l) => l.replace(/[\r\t]/, "").trim())
    .filter((x) => x.length !== 0);

  let output = "";
  for (const line of lines) {
    if (/^# (.+)$/g.test(line)) {
      output += `<h1>${parseInlineMarkdown(line.replace("# ", ""))}</h1>`;
    } else if (/^## (.+)$/g.test(line)) {
      output += `<h2>${parseInlineMarkdown(line.replace("## ", ""))}</h2>`;
    } else {
      output += `<p>${parseInlineMarkdown(line)}</p>`;
    }
  }

  return output;
}

export function parseInlineMarkdown(line: string) {
  return line
    .replace(/\[([^[\]]+)\]\(([^()]+)\)/g, '<a class="link" href="$2">$1</a>')
    .replace(/\*\*(.*)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*)\*/g, "<i>$1</i>")
    .replace(/_(.*)_/g, "<i>$1</i>")
    .replace(
      /\{ERROR\}(.*)\{\/ERROR\}/g,
      '<span style="color: var(--color-error)">$1</span>',
    );
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
