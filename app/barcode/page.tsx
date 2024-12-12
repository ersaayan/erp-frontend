import { useState } from "react";

export default function PrintLabel() {
  const [stockCode, setStockCode] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handlePrint = async () => {
    const response = await fetch(`${process.env.BASE_URL}/print-label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      credentials: "include",
      body: JSON.stringify({ stockCode, quantity }),
    });
    const result = await response.json();
    alert(result.message);
  };

  return (
    <div>
      <label>
        Stok Kodu:
        <input
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value)}
        />
      </label>
      <label>
        Adet:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>
      <button onClick={handlePrint}>Barkod Bas</button>
    </div>
  );
}
