import { useEffect, useState } from "react";

type MatchesCallback = (matches: boolean) => void;

// I don't really understand how the below works, I sort of get it but need to understand more about use effect and eventListeners

// https://www.netlify.com/blog/2020/12/05/building-a-custom-react-media-query-hook-for-more-responsive-apps/
export const useMediaQuery = (query: string, cb: MatchesCallback) => {
  const [matches, setMatches] = useState(false);

  console.log("outside effect", matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    console.log("effect", matches, media.matches);

    if (media.matches !== matches) {
      setMatches(media.matches);
      cb(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
      cb(media.matches);
    };

    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query, cb]);
};
