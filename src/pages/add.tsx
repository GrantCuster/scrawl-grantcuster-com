import { sql } from "../shared/db";
import { PostEditor } from "../shared/PostEditor";
import { PostType } from "../shared/types";
import { dateToSlugTimestamp, makeDBTimestamp } from "../shared/dateFormatter";

async function Post() {
  const newDate = new Date();
  const blankPost = {
    id: 0,
    text: "",
    created_at: newDate,
    slug: dateToSlugTimestamp(newDate),
  } as PostType;

  async function createPost(
    _post: PostType,
    adminPassword: string,
  ): Promise<void> {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    const dbTimestamp = makeDBTimestamp(_post.created_at);

    await sql`
      INSERT INTO posts (text, slug, created_at, previewimageurl)
      VALUES (${_post.text}, ${_post.slug}, ${dbTimestamp}, ${_post.previewimageurl})
      RETURNING id`;
  }

  return <PostEditor post={blankPost} isNew={true} updatePost={createPost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
