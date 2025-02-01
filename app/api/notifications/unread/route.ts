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

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Hata Detayları:", {
                status: response.status,
                statusText: response.statusText,
                responseBody: errorText
            });

            throw new Error(`Okunmamış bildirimler alınırken bir hata oluştu: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Okunmamış bildirimler alma hatası:", {
            message: error instanceof Error ? error.message : "Bilinmeyen hata",
            error
        });

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Okunmamış bildirimler alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
} 