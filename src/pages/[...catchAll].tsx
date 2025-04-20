import type { PageProps } from "waku/router";

export default async function CatchAllPage({
  catchAll,
}: PageProps<"/app/[...catchAll]">) {
  // try rewriting to post
  if (catchAll.length === 1) {
    const nohtml = catchAll[0]!.replace(/\.html$/, "");
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/post/${nohtml}";`,
        }}
      />
    );
  }

  return <div>Not found</div>
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
