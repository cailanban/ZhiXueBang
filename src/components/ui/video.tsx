/**
 * Video Player Component — native HTML5 video wrapper
 */
import { cn } from '@/lib/utils';

interface VideoProps {
    /** Video resource URL */
    src: string;
    /** Video poster image URL */
    poster?: string;
    /** Custom class name */
    className?: string;
    /** Whether to autoplay, defaults to false */
    autoPlay?: boolean;
    /** Whether to mute, defaults to false */
    muted?: boolean;
    /** Whether to show controls, defaults to true */
    controls?: boolean;
    /** Video aspect ratio, defaults to 'auto' */
    aspectRatio?: 'auto' | '16:9' | '4:3' | (string & {});
}

export default function Video({
    className,
    src,
    poster,
    autoPlay = false,
    muted = false,
    controls = true,
}: VideoProps) {
    return (
        <div className={cn('w-full overflow-hidden rounded-md', className)}>
            <video
                src={src}
                poster={poster}
                autoPlay={autoPlay}
                muted={muted}
                controls={controls}
                className="w-full h-auto"
                playsInline
            />
        </div>
    );
}
