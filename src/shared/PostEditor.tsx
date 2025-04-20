"use client";

import { dateToReadableString } from "./dateFormatter";
import { PostType } from "./types";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { adminPasswordAtom } from "./atoms";
import { useAtom } from "jotai";
import { Link } from "waku";
import { makeCanvasPreview } from "./AdminComponents";
import { getGardenExtraBaseUrl } from "./consts";
import { getWordCount } from "./utils";

export function PostEditor({
  post,
  updatePost,
  isNew = false,
}: {
  post: PostType;
  updatePost: (post: PostType, adminPassword: string) => Promise<void>;
  isNew?: boolean;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [text, setText] = useState(post.text);
  const [isSaving, setIsSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState(post.created_at);

  const wordCount = getWordCount(text);

  const sizeRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const size = sizeRef.current;
    if (!textarea || !size) return;
    const height = Math.max(size.scrollHeight, 32);
    textarea.style.height = `${height}px`;
  }, [text, textareaRef, sizeRef]);

  useEffect(() => {
    if (isNew) {
      const interval = setInterval(() => {
        setCreatedAt(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isNew, textareaRef]);

  return (
    <div className="flex flex-col max-w-[720px] mx-auto">
      <div className="py-4 px-6 flex justify-between">
        <Link to="/" className="underline">
          scrawl
        </Link>
        <div>editor</div>
      </div>
      <div className="px-6 pb-1 lowercase">
        {dateToReadableString(createdAt)}
      </div>
      <div className="py-3 px-6 border-2 border-gray-300">
        <div className="mb-4 -mt-2">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </div>
        <div className="relative">
          <div
            className="absolute left-0 top-0 w-full whitespace-pre-wrap opacity-0 pointer-events-none"
            ref={sizeRef}
          >
            {text}&ZeroWidthSpace;
          </div>
          <textarea
            className="w-full focus:outline-none resize-none overflow-hidden"
            autoFocus
            value={text}
            ref={textareaRef}
            onChange={(e) => {
              setText(e.target.value);
            }}
            style={{
              height: 32,
            }}
          ></textarea>
        </div>
      </div>
      <div className="flex justify-end">
        {isSaving ? (
          <div className="px-6 pt-1">saving...</div>
        ) : (
          <button
            className="underline px-6 pt-1"
            onClick={async () => {
              if (!adminPassword) {
                alert("No password");
                return;
              }
              setIsSaving(true);

              function dataURLToBlob(dataURL: string) {
                const byteString = atob(dataURL.split(",")[1]!);
                const mimeString = dataURL
                  .split(",")[0]!
                  .split(":")[1]!
                  .split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], { type: mimeString! });
              }

              const newPost: PostType = {
                ...post,
                created_at: createdAt,
                text,
              };

              const canvasDataURL = makeCanvasPreview(newPost)!;

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
                  ...newPost,
                  previewimageurl: uploadedImageUrl,
                };
                await updatePost(finalPost, adminPassword);
                if (isNew) {
                  window.location.href = `/`;
                } else {
                  window.location.href = `/post/${post.slug}`;
                }
              } else {
                alert("Error uploading image");
              }
            }}
          >
            save
          </button>
        )}
      </div>
    </div>
  );
}
