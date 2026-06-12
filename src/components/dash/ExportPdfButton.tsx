import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { exportElementToPdf, datedFilename } from "@/lib/exportPdf";

interface Props {
  targetRef: React.RefObject<HTMLElement>;
  title: string;
  meta?: string[];
  baseFilename: string;
  orientation?: "portrait" | "landscape";
  className?: string;
}

export default function ExportPdfButton({
  targetRef,
  title,
  meta,
  baseFilename,
  orientation,
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const onClick = async () => {
    if (lock.current || !targetRef.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await exportElementToPdf(targetRef.current, {
        filename: datedFilename(baseFilename),
        title,
        meta,
        orientation,
      });
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={busy}
      className={className}
    >
      {busy ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="mr-1.5 h-3.5 w-3.5" />
      )}
      {busy ? "Готовлю PDF…" : "Экспорт в PDF"}
    </Button>
  );
}
