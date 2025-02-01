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

        const response = await fetch(`${process.env.BASE_URL}/stockcards/balance-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.error || "Stok bakiye raporu oluşturulurken hata oluştu" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Stok bakiye raporu hatası:", error);
        return NextResponse.json(
            { error: "Stok bakiye raporu oluşturulurken hata oluştu" },
            { status: 500 }
        );
    }
} 