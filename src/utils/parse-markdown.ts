export function parseMarkdown(markdown: string) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const lines = escaped
    .split("\n")
    .map((l) => l.replace(/[\r\t]/, "").trim())
    .filter((x) => x.length != 0);

  let output = "";
  for (const line of lines) {
    if (/^# (.+)$/g.test(line)) {
      output += `<h1>${inlineMarkup(line.replace("# ", ""))}</h1>`;
    } else if (/^## (.+)$/g.test(line)) {
      output += `<h2>${inlineMarkup(line.replace("## ", ""))}</h2>`;
    } else {
      output += `<p>${inlineMarkup(line)}</p>`;
    }
  }

  return output;
}

function inlineMarkup(line: string) {
  return line
    .replace(/\[([^[\]]+)\]\(([^()]+)\)/g, '<a class="link" href="$2">$1</a>')
    .replace(/\*\*(.*)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*)\*/g, "<i>$1</i>")
    .replace(
      /\{ERROR\}(.*)\{\/ERROR\}/g,
      '<span style="color: var(--color-error)">$1</span>',
    );
}
