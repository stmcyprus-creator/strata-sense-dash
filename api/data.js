const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const cells = line.match(/("([^"]|"")*"|[^,]*)/g).filter((_, i) => i < headers.length);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] || '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();
    });
    return obj;
  });
};

export default async function handler(req, res) {
  try {
    const [works, estimates, problems] = await Promise.all([
      fetch(process.env.SHEET_WORKS_URL).then(r => r.text()),
      fetch(process.env.SHEET_ESTIMATES_URL).then(r => r.text()),
      fetch(process.env.SHEET_PROBLEMS_URL).then(r => r.text()),
    ]);
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json({
      works: parseCSV(works),
      estimates: parseCSV(estimates),
      problems: parseCSV(problems),
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
