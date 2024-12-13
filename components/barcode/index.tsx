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
      const config = qz.configs.create(yazici, {
        encoding: null, // Veriyi ham olarak gönder
      });

      const command = `^XA
  ^FX field for the element 'Sample Text Element'
  ^FO16,16,2
  ^FWN
  ^A0N,40,40^FDI'm a text element!^FS
  ^FX field for the element 'Sample Barcode Element'
  ^FO120,160,2
  ^FWN
  ^BY4,2,64
  ^BCN,64,Y,N^FD123456^FS
  ^XZ`;

      // Veriyi `qz.print` fonksiyonuna ham olarak gönderin
      await qz.print(config, [
        { type: "raw", format: "command", data: command },
      ]);

      alert("Test baskısı başarıyla alındı.");
    } catch (error: any) {
      alert(`Baskı hatası: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-100 rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Barkod Yazdırma</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={stokKodu}
          onChange={(e) => setStokKodu(e.target.value)}
          placeholder="Stok Kodu"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="number"
          value={adet}
          onChange={(e) => setAdet(parseInt(e.target.value))}
          placeholder="Adet"
          min={1}
          className="w-full px-4 py-2 border rounded"
        />
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
