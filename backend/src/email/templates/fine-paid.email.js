const finePaidEmail = ({ first_name, fine_type, amount, reference_id, paid_at }) => ({
  subject: '✅ Gjoba u pagua — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #065f46; font-size: 18px; margin: 0 0 8px;">Pagesa u krye me sukses! ✅</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Përshëndetje, <strong>${first_name}</strong>! Pagesa juaj u konfirmua.</p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 24px; margin: 0 0 24px;">
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">LLOJI I GJOBËS</span>
            <strong style="color: #1f2937; font-size: 14px;">${fine_type}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">SHUMA E PAGUAR</span>
            <strong style="color: #065f46; font-size: 22px;">${amount} MKD</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">REFERENCA</span>
            <strong style="color: #1f2937; font-size: 13px; font-family: monospace;">${reference_id}</strong>
          </div>
          <div>
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">DATA E PAGESËS</span>
            <strong style="color: #1f2937; font-size: 13px;">${paid_at}</strong>
          </div>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Ruajeni këtë email si dëshmi pagese.
        </p>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = finePaidEmail