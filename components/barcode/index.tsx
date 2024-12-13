import { useState } from "react";
import qz from "qz-tray";
import QRCode from "qrcode";

export default function KarekodYazdir() {
  const [stokKodu, setStokKodu] = useState("");
  const [adet, setAdet] = useState(1);
  const [yazici, setYazici] = useState("");
  const [etiketBoyutu, setEtiketBoyutu] = useState({ en: 50, boy: 25 }); // mm cinsinden
  const [yaziciListesi, setYaziciListesi] = useState<string[]>([]);
  const [yaziciPopup, setYaziciPopup] = useState(false);

  // Yazıcıları Listele
  const yaziciSec = async () => {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      const yazicilar = await qz.printers.find();
      setYaziciListesi(Array.isArray(yazicilar) ? yazicilar : [yazicilar]);
      setYaziciPopup(true);
    } catch (error) {
      alert(
        "Yazıcı listesi alınamadı, lütfen QZ Tray'in çalıştığından emin olun."
      );
    }
  };

  // Seçilen Yazıcıyı Kaydet
  const yaziciSecimiKaydet = (secilenYazici: string) => {
    setYazici(secilenYazici);
    setYaziciPopup(false);
  };

  // QR Kod Üretme ve Yazdırma
  const createQRCode = async (data: string) => {
    try {
      const qrCodeBase64 = await QRCode.toDataURL(data, {
        margin: 0,
        width: etiketBoyutu.en * 8,
      });
      const imageData = qrCodeBase64.replace(/^data:image\/png;base64,/, ""); // Base64 verisinden başlığı temizle
      return imageData;
    } catch (error) {
      console.error("QR kod oluşturulamadı:", error);
      throw new Error("QR kod oluşturulurken bir hata oluştu.");
    }
  };

  // QR Kod ve Metin Basma İşlevi
  const karekodbas = async () => {
    try {
      if (!yazici) throw new Error("Lütfen bir yazıcı seçin.");
      if (!stokKodu || adet <= 0)
        throw new Error("Lütfen geçerli bir stok kodu ve adet girin.");
      const config = qz.configs.create(yazici);

      // QR kodu grafik olarak oluştur ve yazıcıya gönder
      const qrCodeImage = await createQRCode(stokKodu);

      // Grafik boyutlarını hesapla
      const imageWidth = etiketBoyutu.en * 8; // dots (1 mm = 8 dots)
      const imageHeight = etiketBoyutu.boy * 8; // dots

      // EPL komutlarıyla QR kod ve metin yazdırma
      const command = `
    N
    q640
    Q320,0
    GW240,160,19,150,${qrCodeImage}
    A16,16,0,3,1,1,N,"Stok Kodu: ${stokKodu}"
    P${adet}
    `;

      await qz.print(config, [
        { type: "raw", format: "command", data: command, flavor: "plain" },
      ]);
      alert("Karekod ve metin başarıyla yazdırıldı.");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Yazdırma hatası: ${error.message}`);
      } else {
        alert("Yazdırma hatası: Bilinmeyen bir hata oluştu.");
      }
    }
  };
  // Function to print QR code and text with updated EPL commands
  const printQRCodeAndText = async () => {
    try {
      // Validate inputs
      if (!yazici) throw new Error("Lütfen bir yazıcı seçin.");
      if (!stokKodu || adet <= 0)
        throw new Error("Lütfen geçerli bir stok kodu ve adet girin.");

      // Create printer config
      const config = qz.configs.create(yazici);

      // Generate QR code canvas
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, stokKodu, {
        margin: 0,
        width: Math.round(etiketBoyutu.en * 8),
      });

      // Convert canvas to binary data
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const binary = [];

      for (let y = 0; y < canvas.height; y++) {
        let row = "";
        for (let x = 0; x < canvas.width; x += 8) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
            const i = (y * canvas.width + x + bit) * 4;
            const alpha = imageData.data[i + 3];
            byte <= 1;
            if (alpha < 128) byte |= 1;
          }
          binary.push(byte.toString(16).padStart(2, "0"));
        }
      }

      const hexData = binary.join("").toUpperCase();

      // Calculate image parameters
      const bytesPerRow = Math.ceil(canvas.width / 8);
      const imageHeight = canvas.height;

      // Construct EPL command
      const command = `
  I8,A,001


  Q320,024
  q831
  rN
  S4
  D15
  ZT
  JF
  OD
  R96,0
  f100
  N
  q${etiketBoyutu.en * 8}
  Q${etiketBoyutu.boy * 8},0
  GW252,149,${bytesPerRow},${imageHeight},${hexData}
  A0,${imageHeight + 20},0,3,1,1,N,"Stok Kodu: ${stokKodu}"
  P${adet}
  `;
      await qz.print(config, [
        { type: "raw", format: "command", data: command, flavor: "plain" },
      ]);
      alert("Karekod ve metin başarıyla yazdırıldı.");
    } catch (error) {
      alert(
        `Yazdırma hatası: ${error instanceof Error ? error.message : error}`
      );
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-100 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Karekod Yazdırma</h1>
      <div className="space-y-4">
        {/* Stok Kodu Girişi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stok Kodu
          </label>
          <input
            type="text"
            value={stokKodu}
            onChange={(e) => setStokKodu(e.target.value)}
            placeholder="Stok Kodu"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Adet Girişi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Adet
          </label>
          <input
            type="number"
            value={adet}
            onChange={(e) => setAdet(parseInt(e.target.value))}
            placeholder="Adet"
            min={1}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Etiket Genişliği Girişi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Etiket Genişliği (mm)
          </label>
          <input
            type="number"
            value={etiketBoyutu.en}
            onChange={(e) =>
              setEtiketBoyutu({
                ...etiketBoyutu,
                en: parseInt(e.target.value) || 0,
              })
            }
            placeholder="50"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Etiket Yüksekliği Girişi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Etiket Yüksekliği (mm)
          </label>
          <input
            type="number"
            value={etiketBoyutu.boy}
            onChange={(e) =>
              setEtiketBoyutu({
                ...etiketBoyutu,
                boy: parseInt(e.target.value) || 0,
              })
            }
            placeholder="25"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Yazıcı Seçimi */}
        <button
          onClick={yaziciSec}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Yazıcı Seç
        </button>

        {/* Karekod ve Metin Bas */}
        <button
          onClick={printQRCodeAndText}
          className="w-full bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Karekod ve Metin Bas
        </button>
      </div>

      {yaziciPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2>Yazıcı Seç</h2>
            {yaziciListesi.map((item, idx) => (
              <button
                key={idx}
                onClick={() => yaziciSecimiKaydet(item)}
                className="block px-4 py-2 border"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
