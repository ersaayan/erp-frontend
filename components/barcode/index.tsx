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
Q406,024
q831
rN
S4
D7
ZT
JF
OD
R111,10
f100
N
B50,10,0,1,3,5,100,B,"${stokKodu}"
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
    <div>
      <h1>Barkod Yazdırma</h1>
      <div>
        <label>
          Stok Kodu:
          <input
            type="text"
            value={stokKodu}
            onChange={(e) => setStokKodu(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Adet:
          <input
            type="number"
            value={adet}
            onChange={(e) => setAdet(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <button onClick={yaziciSec}>Yazıcı Ayarları</button>
      </div>
      {yazici && (
        <div>
          <p>Seçilen Yazıcı: {yazici}</p>
        </div>
      )}
      <div>
        <button onClick={barkodYazdir}>Barkod Bas</button>
      </div>

      {yaziciPopup && (
        <div className="popup">
          <h2>Yazıcı Seç</h2>
          <ul>
            {yaziciListesi.map((yaziciAdi) => (
              <li key={yaziciAdi}>
                <button onClick={() => yaziciSecimiKaydet(yaziciAdi)}>
                  {yaziciAdi}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setYaziciPopup(false)}>İptal</button>
        </div>
      )}

      <style jsx>{`
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
        .popup ul {
          list-style: none;
          padding: 0;
        }
        .popup li {
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default BarkodYazdir;
