export function parseMarkdown(
  markdown: string,
  {
    useClassesOverSemanticHtml = false,
  }: { useClassesOverSemanticHtml?: boolean } = {},
) {
  const lines = escapeHtml(markdown)
    .split("\n")
    .map((l) => l.replace(/[\r\t]/, "").trim())
    .filter((x) => x.length !== 0);

  const h1Start = useClassesOverSemanticHtml ? '<p class="h1">' : "<h1>";
  const h1End = useClassesOverSemanticHtml ? "</p>" : "</h1>";
  const h2Start = useClassesOverSemanticHtml ? '<p class="h2">' : "<h2>";
  const h2End = useClassesOverSemanticHtml ? "</p>" : "</h2>";
  const h3Start = useClassesOverSemanticHtml ? '<p class="h3">' : "<h3>";
  const h3End = useClassesOverSemanticHtml ? "</p>" : "</h3>";

  let output = "";
  for (const line of lines) {
    if (/^# (.+)$/g.test(line)) {
      output += `${h1Start}${parseInlineMarkdown(
        line.replace("# ", ""),
      )}${h1End}`;
    } else if (/^## (.+)$/g.test(line)) {
      output += `${h2Start}${parseInlineMarkdown(
        line.replace("## ", ""),
      )}${h2End}`;
    } else if (/^### (.+)$/g.test(line)) {
      output += `${h3Start}${parseInlineMarkdown(
        line.replace("### ", ""),
      )}${h3End}`;
    } else {
      output += `<p>${parseInlineMarkdown(line)}</p>`;
    }
  }

  return output;
}

export function parseInlineMarkdown(line: string) {
  return escapeHtml(line)
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
