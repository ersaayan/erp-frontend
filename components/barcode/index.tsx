import { useState } from "react";
import qz from "qz-tray";

const BarkodYazdir: React.FC = () => {
  const [stokKodu, setStokKodu] = useState<string>("");
  const [adet, setAdet] = useState<number>(1);
  const [yazici, setYazici] = useState<string>("");
  const [yaziciPopup, setYaziciPopup] = useState<boolean>(false);
  const [yaziciListesi, setYaziciListesi] = useState<string[]>([]);

  const yaziciSec = async () => {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      const yazicilar = await qz.printers.find();
      setYaziciListesi(Array.isArray(yazicilar) ? yazicilar : [yazicilar]);
      setYaziciPopup(true);
    } catch (err) {
      console.error("Yazıcı seçimi hatası:", err);
      alert("Yazıcılar alınamadı, lütfen QZ Tray'in çalıştığından emin olun.");
    }
  };

  const yaziciSecimiKaydet = (secilenYazici: string) => {
    setYazici(secilenYazici);
    setYaziciPopup(false);
  };

  const barkodYazdir = async () => {
    if (!yazici) {
      alert("Lütfen bir yazıcı seçin.");
      return;
    }
    if (!stokKodu || adet <= 0) {
      alert("Lütfen geçerli bir stok kodu ve adet girin.");
      return;
    }

    try {
      const isConnected = await qz.websocket.isActive();
      if (!isConnected) {
        await qz.websocket.connect();
      }

      const config = qz.configs.create(yazici);
      const command = `
I8,A,001
Q200,024
q831
rN
S4
D7
ZT
JF
OD
R215,0
f100
N
B23,7,0,1,3,9,139,B,"${stokKodu}"
P${adet}
`;

      const dataToPrint = {
        type: "raw" as const,
        format: "command" as const,
        data: command,
        flavor: "plain" as const,
      };

      await qz.print(config, [dataToPrint]);
      alert("Barkod başarıyla yazdırıldı.");
    } catch (err) {
      console.error("Barkod yazdırma hatası:", err);
      alert("Barkod yazdırılırken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Barkod Yazdırma</h1>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Stok Kodu
          </label>
          <input
            type="text"
            value={stokKodu}
            onChange={(e) => setStokKodu(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Stok kodunu girin"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Adet</label>
          <input
            type="number"
            value={adet}
            onChange={(e) => setAdet(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            min="1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={yaziciSec}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Yazıcı Ayarları
          </button>

          {yazici && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Seçilen Yazıcı: <span className="font-medium">{yazici}</span>
              </p>
            </div>
          )}

          <button
            onClick={barkodYazdir}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Barkod Bas
          </button>
        </div>
      </div>

      {yaziciPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Yazıcı Seç
            </h2>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {yaziciListesi.map((yaziciAdi) => (
                <li key={yaziciAdi}>
                  <button
                    onClick={() => yaziciSecimiKaydet(yaziciAdi)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {yaziciAdi}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setYaziciPopup(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarkodYazdir;
