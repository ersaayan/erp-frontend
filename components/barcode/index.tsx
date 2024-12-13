import { useState } from "react";
import qz from "qz-tray";
import QRCode from "qrcode";

export default function BarkodYazdir() {
  const [stokKodu, setStokKodu] = useState("");
  const [adet, setAdet] = useState(1);
  const [yazici, setYazici] = useState("");
  const [etiketBoyutu, setEtiketBoyutu] = useState({ en: 80, boy: 40 }); // mm cinsinden
  const [yaziciListesi, setYaziciListesi] = useState<string[]>([]);
  const [yaziciPopup, setYaziciPopup] = useState(false);

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

  const yaziciSecimiKaydet = (secilenYazici: string) => {
    setYazici(secilenYazici);
    setYaziciPopup(false);
  };

  const testBaskisi = async () => {
    try {
      if (!yazici) throw new Error("Lütfen bir yazıcı seçin.");
      const config = qz.configs.create(yazici);

      // Etiket boyutlarına göre QR kod hesaplaması
      const qrKodBoyut = Math.min(etiketBoyutu.en, etiketBoyutu.boy) / 2; // Yüksekliğin yarısı
      const qrData = await QRCode.toDataURL("Test");

      // EPL komutlarıyla test baskısı
      const command = `
N
q${etiketBoyutu.en * 8}
Q${etiketBoyutu.boy * 8},24
b50,50,Q,s${qrKodBoyut},eL,"Test"
A10,10,0,4,1,1,N,"Test Baskısı"
P1
`;

      await qz.print(config, [
        { type: "raw", format: "command", data: command },
      ]);
      alert("Test baskısı başarıyla alındı.");
    } catch (error) {
      alert(`Baskı hatası: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-100 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Barkod Yazdırma</h1>
      <div className="space-y-4">
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
        <button
          onClick={yaziciSec}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Yazıcı Seç
        </button>
        <button
          onClick={testBaskisi}
          className="w-full bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Baskısı
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
