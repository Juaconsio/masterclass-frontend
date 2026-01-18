interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

export default function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  return (
    <div className="flex h-screen w-full flex-col">
      <iframe src={pdfUrl} className="h-full w-full flex-1" title={title} />
    </div>
  );
}
