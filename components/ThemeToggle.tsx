'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-sidebar-hover"
        >
            {theme === "light" ? (
                <>
                    <Sun className="h-[1.5rem] w-[1.3rem] text-black transition-all hover:scale-0" />
                    <Moon className="absolute h-[1.5rem] w-[1.3rem] text-black scale-0 transition-all hover:scale-100" />
                </>
            ) : (
                <>
                    <Moon className="h-[1.5rem] w-[1.3rem] text-white transition-all hover:scale-0" />
                    <Sun className="absolute h-[1.5rem] w-[1.3rem] text-white scale-0 transition-all hover:scale-100" />
                </>
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}