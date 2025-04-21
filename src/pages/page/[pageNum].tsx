import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { PageProps } from "waku/router";
import { PostPagination } from "../../shared/PostPagination";
import { Header } from "../../shared/header";
import Markdown from "react-markdown";
import { dateToReadableString } from "../../shared/dateFormatter";
import { postsPerPage } from "../../shared/consts";
import { printWordCount } from "../../shared/utils";

export default async function PostPage({
  pageNum = "1",
}: PageProps<"/page/[pageNum]">) {
  const limit = postsPerPage;
  const page = parseInt(pageNum);
  const offset = (page - 1) * limit;

  const posts: PostType[] = await sql`
    SELECT p.id, p.text, p.created_at, p.slug, p.previewImageUrl
    FROM posts p
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;

  const postCountData = await sql`
    SELECT COUNT(*) AS count
    FROM posts`;

  const totalPostCount = postCountData[0]!.count;

  return (
    <>
      <title>scrawl</title>
      <meta name="description" content="Thoughts, quickly written" />
      <div className="flex flex-col max-w-[720px] mx-auto">
        <Header postCount={totalPostCount} isIndex={page === 1} />
        {page !== 1 ? (
          <PostPagination
            baseLink="/page/"
            page={page}
            totalPostCount={totalPostCount}
            postsOnPage={posts.length}
          />
        ) : null}
        <div className="flex flex-col gap-8 pb-10">
          {posts.map((post) => {
            return (
              <div key={post.id}>
               <div className="px-6 pb-1 lowercase">
                  <a className="underline" href={`/post/${post.slug}`}>
                    {dateToReadableString(post.created_at)}
                  </a>
                </div>
                <div className="py-3 px-6 border-2 border-grubox-white">
                  <div className="mb-4 -mt-2">
                    {printWordCount(post.text)}
                  </div>
                  <Markdown>{post.text}</Markdown>
                </div>
              </div>
            );
          })}
        </div>
        {totalPostCount > postsPerPage ? (
          <PostPagination
            baseLink="/page/"
            page={page}
            totalPostCount={totalPostCount}
            postsOnPage={posts.length}
          />
        ) : null}
      </div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
