export function parseScoreRows(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) throw new Error("Enter at least one learner score.");
  const rows = lines.map((line) => line.split(",").map((s) => s.trim()));
  if (rows[0][1]?.toLowerCase() === "score") rows.shift();
  return rows.map((columns, index) => {
    const [name, score, ...responses] = columns;
    if (!name || score === "" || !Number.isFinite(Number(score)))
      throw new Error(
        `Row ${index + 1}: use learner code, numeric score, then optional responses.`,
      );
    return {
      name,
      score: Number(score),
      ...(responses.length ? { responses } : {}),
    };
  });
}
