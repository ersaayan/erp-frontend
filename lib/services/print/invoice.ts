import { format } from "date-fns";
import { currencyService } from "../currency";

export interface PrintInvoiceOptions {
  title: string;
  type: "purchase" | "sales";
  hideProductsTable?: boolean;
  hideExpensesTable?: boolean;
}

export const printInvoice = async (
  invoice: any,
  options: PrintInvoiceOptions
) => {
  try {
    // Get exchange rates for expense calculations
    const exchangeRates = await currencyService.getExchangeRates();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Yazdırma penceresi açılamadı");
    }

    // Calculate product totals
    const totalProducts =
      invoice.items?.reduce((sum: number, item: any) => {
        let amount = item.totalAmount;
        if (item.currency === "TRY") {
          amount = amount / exchangeRates.USD_TRY;
        } else if (item.currency === "EUR") {
          amount = (amount * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
        }
        return sum + amount;
      }, 0) || 0;

    // Calculate expense totals in USD
    const totalExpenses =
      invoice.expenses?.reduce((sum: number, expense: any) => {
        let amount = expense.price;
        if (expense.currency === "TRY") {
          amount = amount / exchangeRates.USD_TRY;
        } else if (expense.currency === "EUR") {
          amount = (amount * exchangeRates.EUR_TRY) / exchangeRates.USD_TRY;
        }
        return sum + amount;
      }, 0) || 0;

    // Calculate VAT and discount totals
    const totalVat =
      invoice.items?.reduce(
        (sum: number, item: any) => sum + item.vatAmount,
        0
      ) || 0;
    const totalDiscount =
      invoice.items?.reduce(
        (sum: number, item: any) => sum + (item.discountAmount || 0),
        0
      ) || 0;

    // Calculate final total
    const totalAmount = totalProducts + totalExpenses;

    printWindow.document.write(`
      <html>
        <head>
          <title>${options.title} - ${invoice.invoiceNo}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 9pt;
              line-height: 1.3;
              color: #333;
            }
            
            .container {
              max-width: 190mm;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              padding: 10px 0;
              border-bottom: 2px solid #333;
              margin-bottom: 10px;
            }
            
            .header h1 {
              margin: 0;
              font-size: 16pt;
              font-weight: bold;
            }
            
            .header h2 {
              margin: 5px 0 0;
              font-size: 14pt;
              font-weight: bold;
            }
            
            .header p {
              margin: 5px 0 0;
              font-size: 10pt;
              color: #666;
            }
            
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px;
              background: #f8f8f8;
              border-radius: 4px;
            }
            
            .info-block {
              flex: 1;
              padding: 0 10px;
            }
            
            .info-block h3 {
              margin: 0 0 5px;
              font-size: 10pt;
              color: #444;
              border-bottom: 1px solid #ddd;
              padding-bottom: 3px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 3px 10px;
              font-size: 9pt;
            }
            
            .info-grid .label {
              font-weight: 500;
              color: #666;
            }
            
            .info-grid .value {
              color: #333;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 9pt;
            }
            
            th {
              background: #f3f4f6;
              font-weight: 600;
              text-align: left;
              padding: 5px;
              border-bottom: 2px solid #ddd;
              white-space: nowrap;
            }
            
            td {
              padding: 4px 5px;
              border-bottom: 1px solid #eee;
            }
            
            .text-right {
              text-align: right;
            }
            
            .total-row {
              font-weight: bold;
              background: #f8f8f8;
            }
            
            .total-row td {
              border-top: 2px solid #ddd;
              padding-top: 8px;
            }
            
            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #ddd;
            }
            
            .summary-block {
              width: 200px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            
            .summary-row.total {
              font-weight: bold;
              font-size: 11pt;
              border-top: 1px solid #ddd;
              padding-top: 5px;
              margin-top: 5px;
            }
            
            .footer {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 8pt;
              color: #666;
              text-align: center;
            }
            
            @media print {
              button { display: none; }
              body { -webkit-print-color-adjust: exact; }
              .info-section { -webkit-print-color-adjust: exact; }
              th { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${
                options.type === "purchase" ? "ALIŞ FATURASI" : "SATIŞ FATURASI"
              }</h1>
              <h2>${invoice.invoiceNo}</h2>
              <p>GİB No: ${invoice.gibInvoiceNo || "-"}</p>
            </div>

            <div class="info-section">
              <div class="info-block">
                <h3>Fatura Bilgileri</h3>
                <div class="info-grid">
                  <span class="label">Fatura Tarihi:</span>
                  <span class="value">${format(
                    new Date(invoice.invoiceDate),
                    "dd.MM.yyyy HH:mm"
                  )}</span>
                  <span class="label">Vade Tarihi:</span>
                  <span class="value">${format(
                    new Date(invoice.paymentDate),
                    "dd.MM.yyyy"
                  )}</span>
                  <span class="label">Şube:</span>
                  <span class="value">${invoice.branchCode}</span>
                  <span class="label">Açıklama:</span>
                  <span class="value">${invoice.description || "-"}</span>
                </div>
              </div>
              
              <div class="info-block">
                <h3>Cari Bilgileri</h3>
                <div class="info-grid">
                  <span class="label">Cari Kodu:</span>
                  <span class="value">${invoice.current.currentCode}</span>
                  <span class="label">Cari Adı:</span>
                  <span class="value">${invoice.current.currentName}</span>
                  <span class="label">Vergi No:</span>
                  <span class="value">${invoice.current.taxNumber || "-"}</span>
                  <span class="label">Vergi Dairesi:</span>
                  <span class="value">${invoice.current.taxOffice || "-"}</span>
                </div>
              </div>
            </div>

            ${
              !options.hideProductsTable
                ? `
            <table>
              <thead>
                <tr>
                  <th>Ürün Kodu</th>
                  <th>Ürün Adı</th>
                  <th>Miktar</th>
                  <th>Birim</th>
                  <th class="text-right">Birim Fiyat</th>
                  <th class="text-right">KDV %</th>
                  <th class="text-right">KDV Tutarı</th>
                  <th class="text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.stockCode}</td>
                    <td>${item.stockName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td class="text-right">${item.unitPrice.toFixed(2)}</td>
                    <td class="text-right">${item.vatRate.toFixed(2)}</td>
                    <td class="text-right">${item.vatAmount.toFixed(2)}</td>
                    <td class="text-right">${item.totalAmount.toFixed(2)} ${
                      item.currency
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            `
                : ""
            }

            ${
              !options.hideExpensesTable &&
              invoice.expenses &&
              invoice.expenses.length > 0
                ? `
            <table>
              <thead>
                <tr>
                  <th>Masraf Kodu</th>
                  <th>Masraf Adı</th>
                  <th class="text-right">Tutar</th>
                  <th class="text-right">USD Karşılığı</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.expenses
                  .map((expense: any) => {
                    // Convert expense amount to USD for display
                    let usdAmount = expense.price;
                    if (expense.currency === "TRY") {
                      usdAmount = expense.price / exchangeRates.USD_TRY;
                    } else if (expense.currency === "EUR") {
                      usdAmount =
                        (expense.price * exchangeRates.EUR_TRY) /
                        exchangeRates.USD_TRY;
                    }
                    return `
                  <tr>
                    <td>${expense.expenseCode}</td>
                    <td>${expense.expenseName}</td>
                    <td class="text-right">${expense.price.toFixed(2)} ${
                      expense.currency
                    }</td>
                    <td class="text-right">${usdAmount.toFixed(2)} USD</td>
                  </tr>
                `;
                  })
                  .join("")}
                <tr class="total-row">
                  <td colspan="2" class="text-right">Toplam Masraf:</td>
                  <td colspan="2" class="text-right">${totalExpenses.toFixed(
                    2
                  )} USD</td>
                </tr>
              </tbody>
            </table>
            `
                : ""
            }

            <div class="summary-section">
              <div class="summary-block">
                <div class="summary-row">
                  <span>Ara Toplam:</span>
                  <span>${(totalProducts - totalVat).toFixed(2)} ${
      invoice.current.priceList.currency
    }</span>
                </div>
                ${
                  invoice.expenses && invoice.expenses.length > 0
                    ? `
                  <div class="summary-row">
                    <span>Toplam Masraf:</span>
                    <span>${totalExpenses.toFixed(2)} USD</span>
                  </div>
                `
                    : ""
                }
                <div class="summary-row">
                  <span>Toplam İndirim:</span>
                  <span>${totalDiscount.toFixed(2)} ${
      invoice.current.priceList.currency
    }</span>
                </div>
                <div class="summary-row">
                  <span>Toplam KDV:</span>
                  <span>${totalVat.toFixed(2)} ${
      invoice.current.priceList.currency
    }</span>
                </div>
                <div class="summary-row total">
                  <span>Genel Toplam:</span>
                  <span>${totalAmount.toFixed(2)} ${
      invoice.current.priceList.currency
    }</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>
                Bu belge bilgisayar tarafından oluşturulmuştur ve geçerli bir imza olmadan geçerli değildir. |
                Oluşturma Tarihi: ${format(new Date(), "dd.MM.yyyy HH:mm")}
              </p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    return true;
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};
