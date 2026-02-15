"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { events } from "@/lib/events";
import { v4 as uuidv4 } from "uuid";

export function AddBookmark() {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in");
            setLoading(false);
            return;
        }

        const newBookmark = {
            id: uuidv4(),
            title,
            url,
            user_id: user.id,
            created_at: new Date().toISOString()
        };

        // Optimistic update
        events.emit("add-bookmark", newBookmark);

        const { error: insertError } = await supabase.from("bookmarks").insert({
            id: newBookmark.id,
            title,
            url,
            user_id: user.id,
            created_at: newBookmark.created_at
        });

        if (insertError) {
            alert("Error adding bookmark: " + insertError.message);
            console.error(insertError);
            // In a real app, we'd emit a 'remove-optimistic' event here
        } else {
            setUrl("");
            setTitle("");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded-xl bg-gray-900/50 border-gray-800 backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-semibold text-white pl-2">Add New Bookmark</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Title (e.g. My Favorite Blog)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/50"
                    required
                />
                <input
                    type="url"
                    placeholder="URL (https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition-all focus:ring-1 focus:ring-purple-500/50"
                    required
                />
                <Button type="submit" disabled={loading} className="py-3 px-6 h-auto bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 active:scale-95 transition-all">
                    {loading ? "Adding..." : <><Plus size={18} className="mr-2" /> Add</>}
                </Button>
            </div>
        </form>
    );
}
