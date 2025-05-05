"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SaveLastReadChapter({ novel, chapter }) {
  const { data: session } = useSession();
  useEffect(() => {
    if (typeof window !== "undefined" && novel && chapter) {
      // Use useSession to check if logged in
      const isLoggedIn = !!session?.user?.id || document.cookie.includes('next-auth.session-token') || document.cookie.includes('__Secure-next-auth.session-token');
      if (isLoggedIn) {
        console.log('SaveLastReadChapter: Logged in, sending POST to update bookmark', { chapterId: chapter.chapter_id });
        fetch(`/api/chapters/${chapter.chapter_id}`, { 
          method: 'POST',
          credentials: 'include'
        }).then(res => res.json()).then(data => {
          console.log('SaveLastReadChapter: POST response', data);
        }).catch(err => {
          console.error('SaveLastReadChapter: POST error', err);
        });
      } else {
        // Only save for guests (no session)
        const key = `novelreader_last_read_chapter_${novel.novel_id}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            chapter_id: chapter.chapter_id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
          })
        );
        console.log('SaveLastReadChapter: Guest, saved to localStorage', { key });
      }
    }
  }, [novel, chapter, session]);
  return null;
} 