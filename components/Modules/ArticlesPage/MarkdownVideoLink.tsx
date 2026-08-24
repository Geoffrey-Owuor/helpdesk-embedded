import { AnchorHTMLAttributes, ReactNode } from "react";

// Extracts a YouTube video ID from watch/shorts/youtu.be/embed links and
// returns the canonical embed URL, or null if the link isn't a YouTube video.
const getYouTubeEmbedUrl = (href: string): string | null => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = url.pathname.split("/")[1] || null;
  } else if (host === "youtube.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (
      url.pathname.startsWith("/shorts/") ||
      url.pathname.startsWith("/embed/")
    ) {
      videoId = url.pathname.split("/")[2] || null;
    }
  }

  if (videoId && /^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

// Facebook's video plugin embeds any public video/watch URL via an iframe —
// no API key required.
const getFacebookEmbedUrl = (href: string): string | null => {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const isFacebookVideo =
    host === "fb.watch" || (host === "facebook.com" && url.pathname.includes("/videos/"));

  if (!isFacebookVideo) return null;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false`;
};

const VideoEmbed = ({ src, title }: { src: string; title: string }) => (
  <span className="not-prose my-4 block aspect-video w-full max-w-2xl overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
    <iframe
      src={src}
      title={title}
      className="h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
    />
  </span>
);

type MarkdownVideoLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

// Drop-in replacement for react-markdown's default `a` renderer: known
// YouTube/Facebook video links become embedded players, everything else
// falls through to a normal link.
const MarkdownVideoLink = ({
  href,
  children,
  ...props
}: MarkdownVideoLinkProps) => {
  if (href) {
    const youtubeEmbedUrl = getYouTubeEmbedUrl(href);
    if (youtubeEmbedUrl) {
      return <VideoEmbed src={youtubeEmbedUrl} title="Embedded YouTube video" />;
    }

    const facebookEmbedUrl = getFacebookEmbedUrl(href);
    if (facebookEmbedUrl) {
      return (
        <VideoEmbed src={facebookEmbedUrl} title="Embedded Facebook video" />
      );
    }
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export default MarkdownVideoLink;
