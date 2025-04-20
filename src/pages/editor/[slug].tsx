import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { PostEditor } from "../../shared/PostEditor";
import { makeDBTimestamp } from "../../shared/dateFormatter";

async function Post({ slug }: PageProps<"/post/[slug]">) {
  const postData: PostType[] = await sql`
    SELECT p.id, p.text, p.previewimageurl, p.created_at, p.slug
    FROM posts p
    WHERE p.slug = ${slug}
    GROUP BY p.id, p.text, p.previewimageurl, p.created_at, p.slug`;

  const post = postData[0]!;

  async function updatePost(
    _post: PostType,
    adminPassword: string,
  ): Promise<void> {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    const dbTimestamp = makeDBTimestamp(_post.created_at);

    await sql`
      UPDATE posts
      SET slug = ${_post.slug}, created_at = ${dbTimestamp}, text = ${_post.text}, previewimageurl = ${_post.previewimageurl}
      WHERE slug = ${_post.slug}`;
  }

  return <PostEditor post={post} updatePost={updatePost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
