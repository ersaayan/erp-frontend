import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Oturum bulunamadı" },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Bildirimler alınırken bir hata oluştu");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Bildirimler hatası:", error);
        return NextResponse.json(
            { error: "Bildirimler alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
} 