"use client";
import { useNewsStore } from "@/store/useNewsStore";
import { useQuery } from "@tanstack/react-query";
import { GetNews } from "@/serverActions/NewsHandling/GetNews";
import ViewNews from "./ViewNews";

const NewsButton = () => {
  const setShowNews = useNewsStore((state) => state.setShowNews);

  // Fetch news data seamlessly in the background
  const { data: newsList = [] } = useQuery({
    queryKey: ["newsData"],
    queryFn: GetNews,
  });

  const count = newsList.length;

  return (
    <>
      <button
        onClick={() => setShowNews(true)}
        className="relative rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.4em"
          height="1.4em"
          viewBox="0 0 16 16"
        >
          <g fill="none">
            <path
              fill="url(#SVGrwuGtcVh)"
              d="M13 4a2 2 0 0 1 2 2v4.5a2.5 2.5 0 0 1-2.5 2.5l-.023-9z"
            ></path>
            <path
              fill="url(#SVGJdWhObSs)"
              d="M1 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8.95q-.243.05-.5.05h-9A2.5 2.5 0 0 1 1 10.5z"
            ></path>
            <path
              fill="url(#SVGeS4wFbmj)"
              d="M1 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8.95q-.243.05-.5.05h-9A2.5 2.5 0 0 1 1 10.5z"
            ></path>
            <path
              fill="url(#SVGeDF8iboa)"
              d="M1 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8.95q-.243.05-.5.05h-9A2.5 2.5 0 0 1 1 10.5z"
            ></path>
            <path
              fill="url(#SVG68RIee3f)"
              d="M3.5 7a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"
            ></path>
            <path
              fill="url(#SVGdCTsBbav)"
              d="M3.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm4 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"
            ></path>
            <defs>
              <linearGradient
                id="SVGJdWhObSs"
                x1={4.429}
                x2={13.346}
                y1={0.308}
                y2={12.311}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3bd5ff"></stop>
                <stop offset={1} stopColor="#367af2"></stop>
              </linearGradient>
              <linearGradient
                id="SVGeS4wFbmj"
                x1={7.857}
                x2={7.857}
                y1={10.885}
                y2={13}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset={0.181} stopColor="#2764e7" stopOpacity={0}></stop>
                <stop offset={1} stopColor="#2764e7"></stop>
              </linearGradient>
              <linearGradient
                id="SVGeDF8iboa"
                x1={7.429}
                x2={11.535}
                y1={5.385}
                y2={16.126}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#dcf8ff" stopOpacity={0}></stop>
                <stop offset={1} stopColor="#ff6ce8" stopOpacity={0.7}></stop>
              </linearGradient>
              <linearGradient
                id="SVG68RIee3f"
                x1={3.286}
                x2={4.787}
                y1={6.853}
                y2={9.857}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#defcff"></stop>
                <stop offset={1} stopColor="#9ff0f9"></stop>
              </linearGradient>
              <linearGradient
                id="SVGdCTsBbav"
                x1={3.7}
                x2={4.227}
                y1={5.088}
                y2={10.525}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#fdfdfd"></stop>
                <stop offset={1} stopColor="#cceaff"></stop>
              </linearGradient>
              <radialGradient
                id="SVGrwuGtcVh"
                cx={0}
                cy={0}
                r={1}
                gradientTransform="rotate(129.203 6.987 6.595)scale(6.38779 9.53604)"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#068beb"></stop>
                <stop offset={0.617} stopColor="#0056cf"></stop>
                <stop offset={0.974} stopColor="#0027a7"></stop>
              </radialGradient>
            </defs>
          </g>
        </svg>
        {/* ── UNREAD BADGE ── */}
        {count > 0 && (
          <span className="absolute right-0.5 bottom-2.25 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] leading-none font-semibold tracking-tighter text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {/* Mount Modal */}
      <ViewNews newsList={newsList} />
    </>
  );
};

export default NewsButton;
