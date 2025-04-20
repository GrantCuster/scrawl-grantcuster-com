import { Link } from "waku";
import { AddPostLink, LogoutLink } from "./AdminComponents";

export const Header = ({ postCount, isIndex }: { postCount?: number, isIndex?: boolean }) => {
  return (
    <div className={`px-6 w-full flex items-center justify-between`}>
      <div className="yellow py-4">
        <Link to="/" className={isIndex ? '' : 'underline'}>
          scrawl
        </Link>
      </div>
      <div className="flex gap-3">
        <AddPostLink />
        <a
          href="/random"
          className="underline pointer-events-auto purple hover:underline"
        >
          random
        </a>
      </div>
    </div>
  );
};
