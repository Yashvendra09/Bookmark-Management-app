import { GoogleAuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-xl shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Smart Bookmarks
                    </h1>
                    <p className="text-gray-400">
                        Your personal space for organizing links.
                    </p>
                </div>

                <div className="space-y-4">
                    <GoogleAuthButton />
                </div>

                <div className="text-center text-sm text-gray-500">
                    <p>Secure authentication via Supabase</p>
                </div>
            </div>
        </div>
    );
}
