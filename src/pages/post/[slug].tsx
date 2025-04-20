import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { Header } from "../../shared/header";
import { dateToReadableString } from "../../shared/dateFormatter";
import Markdown from "react-markdown";
import {
  AdminWrapper,
  PostDeleter,
  ShareToBluesky,
  ShareToMastodon,
  ShareToTwitter,
} from "../../shared/AdminComponents";
import { getWordCount, printWordCount } from "../../shared/utils";

async function Post({ slug }: PageProps<"/post/[slug]">) {
  const postData: PostType[] = await sql`
    SELECT p.id, p.text, p.created_at, p.slug, p.previewimageurl
    FROM posts p
    WHERE p.slug = ${slug}
    GROUP BY p.id, p.text, p.created_at, p.slug, p.previewimageurl`;

  const post = postData[0]!;

  async function deletePost(_post: PostType, adminPassword: string) {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    await sql`
      DELETE FROM posts
      WHERE id = ${_post.id}`;
  }

  const readableDate = dateToReadableString(post.created_at);

  const title = "scrawl on " + readableDate;
  const description = post.text.split("\n")[0]!;
  const wordCount = printWordCount(post.text);

  return (
    <>
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://scrawl.grantcuster.com/post/${slug}`}
        />
        <meta property="og:image" content={post.previewimageurl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={post.previewimageurl} />
      </>
      <div className="flex flex-col max-w-[720px] mx-auto pb-10">
        <Header />
        <div className="flex px-6 pb-1 justify-between">
          <div className="lowercase">{readableDate}</div>
          <div className="flex gap-3">
            <PostDeleter deletePost={deletePost} post={post} />
            <AdminWrapper>
              <div>
                <a href={`/editor/${post.slug}`} className="underline">
                  edit
                </a>
              </div>
            </AdminWrapper>
          </div>
        </div>
        <div className="py-3 px-6 border-2 border-gray-300">
          <div className="mb-4 -mt-2">{wordCount}</div>
          <Markdown>{post.text}</Markdown>
        </div>
        <AdminWrapper>
          <div className="flex px-6 pt-1 flex-wrap gap-3 items-start">
            <div>
              <a
                className="underline"
                href={post.previewimageurl}
                target="_blank"
                rel="noopener noreferrer"
              >
                image
              </a>
            </div>
            <ShareToBluesky
              post={post}
              title={title}
              description={description}
              imageUrl={post.previewimageurl}
            />
            <ShareToMastodon post={post} />
            <ShareToTwitter post={post} />
          </div>
        </AdminWrapper>
      </div>
    </>
  );
}

export default Post;
