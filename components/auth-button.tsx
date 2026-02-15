"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function GoogleAuthButton() {
    const supabase = createClient();

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <Button
            onClick={handleLogin}
            className="w-full gap-2 text-base py-6"
        >
            <LogIn size={20} />
            Continue with Google
        </Button>
    );
}
