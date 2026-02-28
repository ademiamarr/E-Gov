const welcomePendingEmail = ({ first_name }) => ({
  subject: '⏳ Llogaria juaj është në pritje — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px;">Regjistrimi juaj u pranua! ✅</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          Përshëndetje, <strong>${first_name}</strong>!
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Dokumentet tuaja janë duke u shqyrtuar nga ekipi ynë. 
          Do të njoftoheni me email sapo llogaria juaj të aprovohet.
        </p>
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
          <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⏱ Koha e pritjes: 1-2 ditë pune</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Nëse keni pyetje, kontaktoni support-in tonë.
        </p>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = welcomePendingEmail