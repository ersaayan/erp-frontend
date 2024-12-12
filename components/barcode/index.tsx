import { useState, useEffect } from "react";
import qz from "qz-tray";

const BarkodYazdir: React.FC = () => {
  const [stokKodu, setStokKodu] = useState<string>("");
  const [adet, setAdet] = useState<number>(1);
  const [yazici, setYazici] = useState<string>("");

  useEffect(() => {
    qz.api.setPromiseType((resolver) => new Promise(resolver));
  }, []);

  const sha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const yaziciSec = async () => {
    try {
      const yazicilar = await qz.printers.find();
      const yaziciListesi = Array.isArray(yazicilar)
        ? yazicilar.join(", ")
        : yazicilar;
      const secilenYazici = prompt("Yazıcı seçin:", yaziciListesi);
      if (secilenYazici) {
        setYazici(secilenYazici);
      }
    } catch (err) {
      console.error("Yazıcı seçimi hatası:", err);
    }
  };

  const barkodYazdir = async () => {
    try {
      const isConnected = await qz.websocket.isActive();
      if (!isConnected) {
        await qz.websocket.connect();
      }
      const config = qz.configs.create(yazici);
      const command = `^XA
        ^FO100,100^BY2
        ^BC100,Y,N,N
        ^FD${stokKodu}^FS
        ^PQ${adet}
        ^XZ`;
      const dataToPrint = {
        type: "raw" as const,
        format: "command" as const,
        data: command,
        flavor: "plain" as const,
      };
      await qz.print(config, [dataToPrint]);
      console.log("Barkod başarıyla yazdırıldı.");
    } catch (err) {
      console.error("Barkod yazdırma hatası:", err);
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
      <div>
        <button onClick={barkodYazdir}>Barkod Bas</button>
      </div>
    </div>
  );
};

export default BarkodYazdir;
