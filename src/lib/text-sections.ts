export function textSections(pages: { page: number | null; text: string }[]) {
  return pages.flatMap(({ page, text }) =>
    text
      .replace(/\r|\u0000/g, '')
      .trim()
      .split(/\n\s*\n/)
      .filter((section) => section.trim())
      .flatMap((section) => {
        const words = section.trim().split(/\s+/),
          chunks: { text: string; page: number | null }[] = [];
        for (let i = 0; i < words.length; i += 100)
          chunks.push({ text: words.slice(i, i + 100).join(' '), page });
        return chunks;
      }),
  );
}
