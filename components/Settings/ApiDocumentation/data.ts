import { ApiDefinition } from "./types";

export const apiDefinitions: ApiDefinition[] = [
    {
        id: "exchange-rate-api",
        name: "Exchange Rate API",
        description: "Varsayılan döviz kuru API'si",
        category: "Finans",
        features: [
            "Gerçek zamanlı kurlar",
            "Çoklu para birimi desteği",
            "Tarihsel veri",
            "Çapraz kur hesaplama"
        ],
        protocols: ["HTTP/HTTPS", "REST"],
        formats: ["JSON"],
        pricing: "Ücretsiz",
        limits: {
            "Günlük İstek": "1000 istek/gün",
            "Hız Limiti": "60 istek/dakika"
        },
        authentication: {
            type: "API Key",
            description: "API anahtarı ile kimlik doğrulama",
            steps: [
                "API anahtarı almak için kayıt olun",
                "Anahtarı header'da gönder"
            ]
        },
        endpoints: [
            {
                method: "GET",
                path: "/latest",
                description: "Güncel döviz kurlarını getirir",
                parameters: [
                    {
                        name: "base",
                        type: "string",
                        description: "Baz para birimi",
                        required: true
                    }
                ]
            }
        ],
        errors: [
            {
                code: "401",
                message: "Unauthorized",
                description: "Geçersiz API anahtarı",
                solution: "API anahtarınızı kontrol edin"
            }
        ],
        isFavorite: true
    },
    {
        id: "tcmb-api",
        name: "TCMB Döviz Kurları API",
        description: "Türkiye Cumhuriyet Merkez Bankası resmi döviz kurları",
        category: "Finans",
        features: [
            "Resmi kurlar",
            "Günlük güncelleme",
            "Çoklu para birimi",
            "Alış/Satış fiyatları"
        ],
        protocols: ["HTTP/HTTPS"],
        formats: ["XML"],
        pricing: "Ücretsiz",
        limits: {
            "Güncelleme": "Günde 1 kez (15:30)"
        },
        authentication: {
            type: "Yok",
            description: "Kimlik doğrulama gerektirmez"
        },
        endpoints: [
            {
                method: "GET",
                path: "/kurlar/today.xml",
                description: "Günlük döviz kurlarını getirir"
            }
        ],
        errors: [
            {
                code: "404",
                message: "Not Found",
                description: "Kur verileri bulunamadı",
                solution: "Mesai saatleri içinde tekrar deneyin"
            }
        ]
    }
];