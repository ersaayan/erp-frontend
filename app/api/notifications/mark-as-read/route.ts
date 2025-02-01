import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const body = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: "Oturum bulunamadı" },
                { status: 401 }
            );
        }

        const ids = Array.isArray(body.ids) ? body.ids : [body.id];

        console.log("API'ye gönderilen istek:", {
            url: `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-as-read`,
            method: "PUT",
            body: { ids }
        });

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-as-read`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Hata Detayları:", {
                status: response.status,
                statusText: response.statusText,
                responseBody: errorText
            });

            throw new Error(`Bildirim(ler) okundu olarak işaretlenirken bir hata oluştu: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Başarılı Yanıt:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Bildirim okundu işaretleme hatası:", {
            message: error instanceof Error ? error.message : "Bilinmeyen hata",
            error
        });

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Bildirim(ler) okundu olarak işaretlenirken bir hata oluştu" },
            { status: 500 }
        );
    }
} 