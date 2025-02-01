import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!token) {
            return NextResponse.json(
                { error: "Oturum bulunamadı" },
                { status: 401 }
            );
        }

        if (!query) {
            return NextResponse.json([]);
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/stockcards/search?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Stok araması yapılırken bir hata oluştu");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Stok arama hatası:", error);
        return NextResponse.json(
            { error: "Stok araması yapılırken bir hata oluştu" },
            { status: 500 }
        );
    }
} 