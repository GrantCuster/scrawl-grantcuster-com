"use client";

import { useAtom } from "jotai";
import { PostType } from "./types";
import { adminPasswordAtom } from "./atoms";
import { makeSocialShare } from "./utils";
import {useState } from "react";
import { getGardenExtraBaseUrl } from "./consts";
import { dateToReadableString } from "./dateFormatter";

export function PostDeleter({
  deletePost,
  post,
}: {
  deletePost: (post: PostType, adminPassword: string) => Promise<void>;
  post: PostType;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <button
      className="pointer-events-auto underline"
      onClick={async () => {
        if (confirm("Are you sure you want to delete this post?")) {
          if (adminPassword) {
            await deletePost(post, adminPassword);
            window.location.href = `/`;
          } else {
            alert("No password");
          }
        }
      }}
    >
      x
    </button>
  ) : null;
}

export function EditLink({ post }: { post: PostType }) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <a
      className="pointer-events-auto hover:underline"
      href={`/editor/${post.slug}`}
    >
      edit
    </a>
  ) : null;
}

export function AddPostLink() {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <a className="pointer-events-auto hover:underline underline" href={`/add`}>
      add
    </a>
  ) : null;
}

export function LogoutLink() {
  const [adminPassword] = useAtom(adminPasswordAtom);
  return adminPassword ? (
    <a className="pointer-events-auto hover:underline" href={`/logout`}>
      logout
    </a>
  ) : null;
}

export function ShareToMastodon({ post }: { post: PostType }) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto underline purple"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }
        setPostStatus("sharing");
        const status =
          makeSocialShare(post) +
          "\n" +
          "https://scrawl.grantcuster.com/post/" +
          post.slug;
        setPostStatus("shared");
        const fetchUrl = `${getGardenExtraBaseUrl()}api/postToMastodon`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            status,
          }),
        });
      }}
    >
      mastodon
    </button>
  ) : postStatus === "sharing" ? (
    <span>sharing...</span>
  ) : (
    <span>shared!</span>
  );
}

export function ShareToBluesky({
  post,
  imageUrl,
  description,
  title,
}: {
  post: PostType;
  imageUrl: string | undefined;
  description: string;
  title: string;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto underline purple"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }

        setPostStatus("sharing");
        const status = makeSocialShare(post);

        const url = `https://scrawl.grantcuster.com/post/${post.slug}`;

        const fetchUrl = `${getGardenExtraBaseUrl()}api/postToBluesky`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            url,
            image: imageUrl,
          }),
        });

        setPostStatus("shared");
      }}
    >
      bluesky
    </button>
  ) : postStatus === "sharing" ? (
    <span>sharing...</span>
  ) : (
    <span>shared!</span>
  );
}

export function ShareToTwitter({ post }: { post: PostType }) {
  const excerpt = makeSocialShare(post);
  const splits = excerpt.split(" ");
  let truncated = "";
  for (const word of splits) {
    if (truncated.length + word.length + 1 > 280 - 24) {
      break;
    }
    truncated += word + " ";
  }

  return (
    <a
      className="pointer-events-auto purple underline"
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(truncated)}&url=https://scrawl.grantcuster.com/post/${post.slug}`}
      target="_blank"
    >
      tweet
    </a>
  );
}

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? <>{children}</> : null;
}

export function makeCanvasPreview(post: PostType) {
  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) {
    let lineNumber = 0;
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
        lineNumber++;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);

    lineNumber++;
    return lineNumber;
  }

  const canvas = document.createElement("canvas");
  
  // strip markdown links from text
  let strippedText = post.text
  strippedText = strippedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

  const wordCount = post.text
    .split("\n")
    .join(" ")
    .split(" ")
    .filter((word) => word.length > 0).length;

  const paragraphs = strippedText.split("\n").filter((p) => p.length > 0);

  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#171717";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "68px sans-serif";
  ctx.fillStyle = "#e5e5e5";

  const startX = 180;
  let startY = 180;

  const timestamp = dateToReadableString(post.created_at).toLowerCase();

  ctx.fillText(timestamp, startX, startY);

  startY += 80;

  ctx.strokeStyle = "#e5e5e5";
  ctx.lineWidth = 6;
  const pad = 80;
  ctx.strokeRect(
    startX - pad,
    startY - 40,
    canvas.width - startX * 2 + pad * 2,
    canvas.height,
  );

  startY += 40;

  ctx.fillText(
    wordCount + (wordCount === 1 ? " word" : " words"),
    startX,
    startY,
  );

  startY += 80;
  startY += 80;

  for (const paragraph of paragraphs) {
    const lineNumber = wrapText(
      ctx,
      paragraph,
      startX,
      startY,
      canvas.width - startX * 2,
      80,
    );
    startY += lineNumber * 80 + 80;
  }

  return canvas.toDataURL("image/png", 1.0);
}

export function RegenCanvas({
  post,
  updatePost,
}: {
  post: PostType;
  updatePost: (post: PostType, adminPassword: string) => Promise<void>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminPassword] = useAtom(adminPasswordAtom);

  const regenerateCanvas = async () => {
    if (!adminPassword) {
      alert("No password");
      return;
    }
    setIsGenerating(true);
    function dataURLToBlob(dataURL: string) {
      const byteString = atob(dataURL.split(",")[1]!);
      const mimeString = dataURL.split(",")[0]!.split(":")[1]!.split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString! });
    }

    const canvasDataURL = makeCanvasPreview(post)!;

    // Create a Blob from the data URL
    const blob = dataURLToBlob(canvasDataURL);

    // Create FormData and append the Blob
    const formData = new FormData();
    formData.append("file", blob, "image.png");

    const res = await fetch(`${getGardenExtraBaseUrl()}api/upload`, {
      headers: {
        Authorization: `Bearer ${adminPassword}`,
      },
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    const uploadedImageUrl = result.largeImageUrl;

    if (result.message === "Images uploaded successfully") {
      const finalPost: PostType = {
        ...post,
        previewimageurl: uploadedImageUrl,
      };
      await updatePost(finalPost, adminPassword);
      // reload page
      window.location.href = `/post/${post.slug}`;
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="pointer-events-auto purple hover:underline"
        onClick={regenerateCanvas}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Regenerate Canvas"}
      </button>
    </div>
  );
}
