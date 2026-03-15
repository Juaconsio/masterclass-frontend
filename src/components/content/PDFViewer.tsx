import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { fullScreenPlugin } from '@react-pdf-viewer/full-screen';
import type { RenderToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/full-screen/lib/styles/index.css';
import { useEffect, useRef } from 'react';
import type React from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const renderToolbar = (Toolbar: (props: ToolbarSlot) => React.ReactElement) => (
  <Toolbar>
    {(slots: RenderToolbarProps) => {
      const {
        CurrentPageInput,
        EnterFullScreen,
        GoToNextPage,
        GoToPreviousPage,
        NumberOfPages,
        ShowSearchPopover,
        Zoom,
        ZoomIn,
        ZoomOut,
      } = slots;
      return (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            width: '100%',
          }}
        >
          <div style={{ padding: '0px 2px' }}>
            <ShowSearchPopover />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <ZoomOut />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <Zoom />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <ZoomIn />
          </div>
          <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
            <GoToPreviousPage />
          </div>
          <div style={{ padding: '0px 2px', width: '4rem' }}>
            <CurrentPageInput />
          </div>
          <div style={{ padding: '0px 2px' }}>
            / <NumberOfPages />
          </div>
          <div style={{ padding: '0px 2px' }}>
            <GoToNextPage />
          </div>
          <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
            <EnterFullScreen />
          </div>
        </div>
      );
    }}
  </Toolbar>
);

export default function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],
  });

  const fullScreenPluginInstance = fullScreenPlugin();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    container.addEventListener('contextmenu', preventContextMenu);
    container.addEventListener('dragstart', preventDragStart);
    container.addEventListener('selectstart', preventSelectStart);

    return () => {
      container.removeEventListener('contextmenu', preventContextMenu);
      container.removeEventListener('dragstart', preventDragStart);
      container.removeEventListener('selectstart', preventSelectStart);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="flex h-full w-full flex-col">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance, fullScreenPluginInstance]}
            theme={{
              theme: 'auto',
            }}
            renderError={(error) => (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-base-200 p-4">
                <p className="text-base-content/70 text-sm">Error al cargar el PDF</p>
                <p className="text-base-content/50 text-xs">{error.message}</p>
              </div>
            )}
          />
        </div>
      </Worker>
    </div>
  );
}
