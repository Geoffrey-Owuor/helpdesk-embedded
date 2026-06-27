"use client";
import { useNewsStore } from "@/store/useNewsStore";
import { useQuery } from "@tanstack/react-query";
import { GetNews } from "@/serverActions/NewsHandling/GetNews";
import ViewNews from "./ViewNews";

const NewsButton = () => {
  const setShowNews = useNewsStore((state) => state.setShowNews);
  const showNews = useNewsStore((state) => state.showNews);

  // Fetch news data seamlessly in the background
  const { data: newsList = [], refetch } = useQuery({
    queryKey: ["newsData"],
    queryFn: GetNews,
  });

  const refetchNews = () => {
    refetch();
  };

  const count = newsList.length;

  return (
    <>
      {/* Mount Modal */}
      {showNews && <ViewNews newsList={newsList} refetch={refetchNews} />}

      <button
        onClick={() => setShowNews(true)}
        className="relative rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          viewBox="0 0 48 48"
        >
          <g fill="none">
            <path
              fill="#8fbffa"
              fillRule="evenodd"
              d="M9.374 46.05c3.065.212 8.164.45 15.626.45s12.56-.238 15.626-.45c2.82-.195 5.1-2.306 5.38-5.174c.247-2.525.494-6.417.494-11.876s-.247-9.351-.494-11.876c-.28-2.868-2.56-4.98-5.38-5.174c-3.065-.212-8.164-.45-15.626-.45s-12.56.238-15.626.45c-2.82.195-5.1 2.306-5.38 5.174C3.747 19.649 3.5 23.541 3.5 29s.247 9.351.494 11.876c.28 2.868 2.56 4.98 5.38 5.174"
              clipRule="evenodd"
            ></path>
            <path
              fill="#2859c5"
              fillRule="evenodd"
              d="M35.726 1.509c3.214-.162 6.038 1.928 6.706 5.1c.34 1.613.74 3.72 1.156 6.372a5.9 5.9 0 0 0-2.962-1.031c-3.065-.212-8.164-.45-15.626-.45s-12.56.238-15.626.45c-2.82.195-5.1 2.306-5.38 5.174C3.747 19.649 3.5 23.541 3.5 29q0 .803.007 1.56a188 188 0 0 1-.901-6.402c-.706-5.685-.993-9.82-1.1-12.572c-.128-3.24 2.105-5.949 5.266-6.562c3.008-.582 7.722-1.378 14.423-2.191c6.7-.814 11.47-1.17 14.53-1.324M11 36.5a1.5 1.5 0 0 0 0 3h28a1.5 1.5 0 0 0 0-3z"
              clipRule="evenodd"
            ></path>
            <path
              fill="#2859c5"
              d="M9.5 32a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 0 3h-8A1.5 1.5 0 0 1 9.5 32m0-6a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 0 3h-8A1.5 1.5 0 0 1 9.5 26m0-6a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 0 3h-8A1.5 1.5 0 0 1 9.5 20m17.932 13.37c1.081.07 2.587.13 4.568.13s3.487-.06 4.568-.13a2.966 2.966 0 0 0 2.803-2.802c.07-1.081.129-2.587.129-4.568s-.06-3.487-.13-4.568a2.966 2.966 0 0 0-2.802-2.803A72 72 0 0 0 32 18.5c-1.98 0-3.487.06-4.568.13a2.966 2.966 0 0 0-2.803 2.802A72 72 0 0 0 24.5 26c0 1.98.06 3.487.13 4.568a2.966 2.966 0 0 0 2.802 2.803"
            ></path>
          </g>
        </svg>
        {/* ── UNREAD BADGE ── */}
        {count > 0 && (
          <span className="absolute right-0.5 bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] leading-none font-semibold tracking-tighter text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </>
  );
};

export default NewsButton;
