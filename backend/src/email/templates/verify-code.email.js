const verifyCodeEmail = ({ first_name, code }) => ({
  subject: '🔐 Kodi juaj i verifikimit — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Përshëndetje, <strong>${first_name}</strong>!</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 32px; line-height: 1.6;">
          Kodi juaj i verifikimit për regjistrim në eGov Portal është:
        </p>
        <div style="background: #f0f4ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 28px; text-align: center; margin: 0 0 32px;">
          <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1e3a8a; font-family: monospace;">${code}</span>
          <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0;">Ky kod skadon në <strong>10 minuta</strong></p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
          Nëse nuk jeni ju që e kërkuat këtë kod, inoroni këtë email.
        </p>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = verifyCodeEmail