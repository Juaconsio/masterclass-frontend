import ReactPlayer from 'react-player';
import { useEffect, useRef } from 'react';
import type React from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  controls?: boolean;
  playing?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  width?: string | number;
  height?: string | number;
}

export default function VideoPlayer({
  url,
  title,
  controls = true,
  playing = false,
  onPlay,
  onPause,
  onProgress,
  width = '100%',
  height = '100%',
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);

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

    const preventKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || (e.key === 'I' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        return false;
      }
    };

    const preventSelect = (e: Event) => {
      e.preventDefault();
      return false;
    };

    container.addEventListener('contextmenu', preventContextMenu);
    container.addEventListener('dragstart', preventDragStart);
    container.addEventListener('selectstart', preventSelect);
    document.addEventListener('keydown', preventKeyDown);

    return () => {
      container.removeEventListener('contextmenu', preventContextMenu);
      container.removeEventListener('dragstart', preventDragStart);
      container.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('keydown', preventKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center bg-black"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls={controls}
        playing={playing}
        width={width}
        height={height}
        onPlay={onPlay}
        onPause={onPause}
        onProgress={onProgress}
        onError={(error) => {
          console.error('Error loading video:', error);
        }}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload noplaybackrate',
              disablePictureInPicture: true,
              onContextMenu: (e: React.MouseEvent<HTMLVideoElement>) => e.preventDefault(),
            },
          },
        }}
        pip={false}
        light={false}
        playIcon={<button type="button" className="btn btn-circle btn-primary">▶</button>}
      />
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-black/50 px-2 py-1 text-sm text-white">
          {title}
        </div>
      )}
    </div>
  );
}
