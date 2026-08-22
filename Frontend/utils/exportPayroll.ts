/**
 * Utility functions for exporting Payroll data as structured PDF downloads
 */

export interface ExportPayslipData {
  employeeName: string;
  employeeId: string;
  month: string;
  year: number;
  grossPay: number;
  reimbursements: number;
  deductions: number;
  takeHome: number;
  basicSalary?: number;
  hra?: number;
  allowances?: number;
}

function printHTMLToPDF(htmlContent: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 400);
  }
}

export function downloadPayslipPDF(data: ExportPayslipData) {
  const basic = data.basicSalary || data.grossPay * 0.5;
  const hra = data.hra || data.grossPay * 0.25;
  const allowances = data.allowances || data.grossPay * 0.25;
  const pf = data.deductions > 200 ? data.deductions - 200 : data.deductions;
  const pt = data.deductions > 200 ? 200 : 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payslip_${data.employeeName}_${data.month}_${data.year}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #fff;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #70485a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-title {
      font-size: 22px;
      font-weight: 900;
      color: #70485a;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-badge {
      background: #70485a;
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .emp-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 6px;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
      font-size: 12px;
    }
    .info-val {
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
      font-size: 12px;
    }
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
    }
    .amount {
      text-align: right;
      font-family: monospace;
      font-weight: 700;
    }
    .total-row {
      background: #f8fafc;
      font-weight: 800;
    }
    .summary-card {
      background: #fdf2f8;
      border: 2px solid #70485a;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .summary-title {
      font-size: 14px;
      font-weight: 800;
      color: #70485a;
    }
    .summary-amount {
      font-size: 24px;
      font-weight: 900;
      color: #70485a;
      font-family: monospace;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div className="header">
    <div className="logo-box">
      <div>
        <h1 className="logo-title">DAYFLOW HRMS</h1>
        <div className="subtitle">Human Resource & Payroll Operations</div>
      </div>
    </div>
    <div className="doc-badge">Official Payslip</div>
  </div>

  <div className="emp-info">
    <div className="info-item"><span className="info-label">Employee Name:</span><span className="info-val">${data.employeeName}</span></div>
    <div className="info-item"><span className="info-label">Employee ID:</span><span className="info-val">${data.employeeId}</span></div>
    <div className="info-item"><span className="info-label">Pay Period:</span><span className="info-val">${data.month} ${data.year}</span></div>
    <div className="info-item"><span className="info-label">Issue Date:</span><span className="info-val">${new Date().toLocaleDateString("en-IN")}</span></div>
  </div>

  <div className="tables-grid">
    <div>
      <table>
        <thead>
          <tr><th>Earnings Component</th><th style="text-align:right">Amount</th></tr>
        </thead>
        <tbody>
          <tr><td>Basic Salary</td><td className="amount">₹${basic.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>House Rent Allowance (HRA)</td><td className="amount">₹${hra.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>Special & Transport Allowances</td><td className="amount">₹${allowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          <tr className="total-row"><td>Total Gross Earnings</td><td className="amount">₹${data.grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <table>
        <thead>
          <tr><th>Deductions Component</th><th style="text-align:right">Amount</th></tr>
        </thead>
        <tbody>
          <tr><td>Provident Fund (PF)</td><td className="amount">₹${pf.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>Professional Tax (PT)</td><td className="amount">₹${pt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
          <tr><td>Income Tax / TDS</td><td className="amount">₹0.00</td></tr>
          <tr className="total-row"><td>Total Deductions</td><td className="amount">₹${data.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div className="summary-card">
    <div>
      <div className="summary-title">NET TAKE HOME SALARY</div>
      <div style="font-size:11px; color:#64748b;">Direct Bank Transfer Disbursed</div>
    </div>
    <div className="summary-amount">₹${data.takeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
  </div>

  <div className="footer">
    This is a system-generated electronic payslip issued by Dayflow HRMS Suite. No physical signature required.
  </div>
</body>
</html>
`;

  printHTMLToPDF(html);
}

export function downloadAnnualEarningsPDF(
  employeeName: string,
  financialYear: string,
  monthlyRows: any[]
) {
  const totalGross = monthlyRows.reduce((sum, r) => sum + r.grossPay, 0);
  const totalDeductions = monthlyRows.reduce((sum, r) => sum + r.deductions, 0);
  const totalTakeHome = monthlyRows.reduce((sum, r) => sum + r.takeHome, 0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Annual_Earnings_${employeeName}_${financialYear}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #70485a;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .title { font-size: 20px; font-weight: 900; color: #70485a; margin: 0; }
    .badge { background: #70485a; color: #fff; font-weight: 800; font-size: 11px; padding: 5px 12px; border-radius: 16px; }
    .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    th { background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1; }
    td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    .num { text-align: right; font-family: monospace; font-weight: 700; }
    .total-row { background: #fdf2f8; font-weight: 900; color: #70485a; }
  </style>
</head>
<body>
  <div className="header">
    <div>
      <h1 className="title">DAYFLOW HRMS</h1>
      <div style="font-size:11px; color:#64748b;">Annual Earnings & YTD Tax Summary Statement</div>
    </div>
    <div className="badge">Financial Year ${financialYear}</div>
  </div>

  <div className="meta">
    <div><strong>Employee Name:</strong> ${employeeName}</div>
    <div><strong>Financial Year:</strong> ${financialYear}</div>
    <div><strong>Generated On:</strong> ${new Date().toLocaleDateString("en-IN")}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Month</th>
        <th style="text-align:right">Gross Salary</th>
        <th style="text-align:right">Reimbursements</th>
        <th style="text-align:right">Deductions</th>
        <th style="text-align:right">Net Take Home</th>
      </tr>
    </thead>
    <tbody>
      ${monthlyRows
        .map(
          (r) => `
        <tr>
          <td><strong>${r.month}</strong></td>
          <td className="num">₹${r.grossPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td className="num">₹${(r.reimbursements || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td className="num" style="color:#e11d48">-₹${r.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td className="num" style="color:#70485a">₹${r.takeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join("")}
      <tr className="total-row">
        <td>YTD TOTAL SUMMARY</td>
        <td className="num">₹${totalGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td className="num">₹0.00</td>
        <td className="num">₹${totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td className="num" style="font-size:13px">₹${totalTakeHome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div style="text-align:center; font-size:10px; color:#94a3b8; margin-top:30px;">
    Official Document produced by Dayflow HRMS Suite.
  </div>
</body>
</html>
`;

  printHTMLToPDF(html);
}
