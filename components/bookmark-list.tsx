"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "@/types";
import { Trash2, ExternalLink, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { events } from "@/lib/events";
import { User } from "@supabase/supabase-js";

export function BookmarkList({ initialBookmarks, currentUser }: { initialBookmarks: Bookmark[], currentUser?: User | null }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks || []);
    const supabase = createClient();

    useEffect(() => {
        if (initialBookmarks) {
            setBookmarks(initialBookmarks);
        }
    }, [initialBookmarks]);

    // Listen for optimistic updates
    useEffect(() => {
        const unsub = events.on<Bookmark>("add-bookmark", (newBookmark) => {
            setBookmarks((prev) => [newBookmark, ...prev]);
        });
        return unsub;
    }, []);

    useEffect(() => {
        // Filter by user_id if available to prevent receiving events for other users (even if RLS blocks it, this is cleaner)
        // and to avoid issues where RLS might be flaky if user_id is missing in context.

        let channel = supabase.channel("realtime-bookmarks");

        const filterConfig = {
            event: "*",
            schema: "public",
            table: "bookmarks",
        } as any;

        if (currentUser?.id) {
            filterConfig.filter = `user_id=eq.${currentUser.id}`;
        }

        channel = channel.on(
            "postgres_changes",
            filterConfig,
            (payload) => {
                console.log("Realtime payload received:", payload);
                if (payload.eventType === "INSERT") {
                    setBookmarks((prev) => {
                        // Prevent duplicates
                        if (prev.some(b => b.id === payload.new.id)) return prev;
                        return [payload.new as Bookmark, ...prev];
                    });
                } else if (payload.eventType === "DELETE") {
                    setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
                } else if (payload.eventType === "UPDATE") {
                    setBookmarks((prev) => prev.map(b => b.id === payload.new.id ? payload.new as Bookmark : b));
                }
            }
        )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]); // Re-subscribe if user changes

    const handleDelete = async (id: string) => {
        // Optimistic delete
        setBookmarks(prev => prev.filter(b => b.id !== id));

        const { error } = await supabase.from("bookmarks").delete().eq("id", id);
        if (error) {
            console.error("Error deleting", error);
            alert("Failed to delete");
        }
    };

    if (!bookmarks || bookmarks.length === 0) {
        return (
            <div className="animate-in fade-in zoom-in duration-500 text-gray-500 text-center py-20 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 flex flex-col items-center gap-2">
                <Globe className="w-10 h-10 text-gray-700 mb-2" />
                <p className="text-lg font-medium">No bookmarks yet</p>
                <p className="text-sm">Add your first one above!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark, index) => (
                <div
                    key={bookmark.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards p-5 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col justify-between group hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden backdrop-blur-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 translate-x-2 group-hover:translate-x-0 duration-300">
                        <Button variant="danger" onClick={() => handleDelete(bookmark.id)} className="h-8 w-8 p-0 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0 transition-all cursor-pointer">
                            <Trash2 size={14} />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-white line-clamp-2 pr-6 leading-tight group-hover:text-purple-200 transition-colors" title={bookmark.title}>
                                {bookmark.title}
                            </h3>
                        </div>
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-purple-400 truncate block transition-colors flex items-center gap-1.5 p-1.5 bg-black/20 rounded-md w-fit max-w-full hover:bg-black/40">
                            <ExternalLink size={10} />
                            <span className="truncate">{bookmark.url}</span>
                        </a>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-800/50 flex justify-between items-center">
                        <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
                            {new Date(bookmark.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
