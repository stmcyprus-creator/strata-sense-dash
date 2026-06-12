import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ExportOptions {
  filename: string;
  title: string;
  /** Array of "label: value" lines shown under the title. */
  meta?: string[];
  /** Page orientation; defaults to landscape (better for wide tables). */
  orientation?: "portrait" | "landscape";
}

function buildHeader(title: string, meta: string[]) {
  const generated = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const node = document.createElement("div");
  node.setAttribute("data-export-header", "1");
  node.style.cssText = [
    "padding:16px 18px",
    "margin-bottom:14px",
    "border:1px solid hsl(var(--border))",
    "border-radius:12px",
    "background:hsl(var(--card))",
    "color:hsl(var(--foreground))",
    "font-family:Inter,system-ui,sans-serif",
  ].join(";");
  node.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap">
      <div>
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:hsl(var(--muted-foreground))">Отчёт</div>
        <div style="font-size:18px;font-weight:700;margin-top:2px">${title}</div>
      </div>
      <div style="font-size:11px;color:hsl(var(--muted-foreground));text-align:right">
        Сформировано<br><span style="font-family:ui-monospace,Menlo,monospace;color:hsl(var(--foreground))">${generated}</span>
      </div>
    </div>
    ${
      meta.length
        ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
            ${meta
              .map(
                (m) =>
                  `<span style="font-size:11px;padding:3px 8px;border-radius:6px;background:hsl(var(--secondary));color:hsl(var(--secondary-foreground))">${m}</span>`
              )
              .join("")}
          </div>`
        : ""
    }
  `;
  return node;
}

export async function exportElementToPdf(
  element: HTMLElement,
  opts: ExportOptions
): Promise<void> {
  const header = buildHeader(opts.title, opts.meta ?? []);
  element.prepend(header);

  // Background colour from current theme (avoids transparent canvas).
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      backgroundColor: bg,
      scale: 2,
      useCORS: true,
      windowWidth: element.scrollWidth,
    });
  } finally {
    header.remove();
  }

  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: opts.orientation ?? "landscape",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;
  const ratio = contentW / canvas.width; // px → pt
  const sliceHeightPx = Math.floor(contentH / ratio);

  let offset = 0;
  let pageIndex = 0;
  while (offset < canvas.height) {
    const slice = document.createElement("canvas");
    const h = Math.min(sliceHeightPx, canvas.height - offset);
    slice.width = canvas.width;
    slice.height = h;
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      h,
      0,
      0,
      canvas.width,
      h
    );
    const data = slice.toDataURL("image/png");
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(data, "PNG", margin, margin, contentW, h * ratio);
    offset += h;
    pageIndex++;
  }

  pdf.save(opts.filename);
}

export function datedFilename(base: string, ext = "pdf"): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${base}_${stamp}.${ext}`;
}
