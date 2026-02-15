import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddBookmark } from "@/components/add-bookmark";
import { BookmarkList } from "@/components/bookmark-list";
import { LogOut } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-purple-500/30">
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">SB</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Smart Bookmarks</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700/50 hover:border-gray-600">
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-8 mt-6">
        <AddBookmark />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white px-1">Your Collection</h2>
          <BookmarkList initialBookmarks={bookmarks || []} currentUser={user} />
        </div>
      </main>
    </div>
  );
}
