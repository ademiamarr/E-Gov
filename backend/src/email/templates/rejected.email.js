const rejectedEmail = ({ first_name, reason }) => ({
  subject: '❌ Regjistrimi nuk u aprovua — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #dc2626; font-size: 18px; margin: 0 0 16px;">Regjistrimi nuk u aprovua</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          Përshëndetje, <strong>${first_name}</strong>,
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Pas shqyrtimit të dokumenteve tuaja, regjistrimi nuk mund të aprovohet.
        </p>
        ${reason ? `
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
            <p style="color: #991b1b; font-size: 13px; margin: 0; font-weight: 600;">Arsyeja: ${reason}</p>
          </div>
        ` : ''}
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
          Për më shumë informacion, kontaktoni support-in tonë ose paraqituni personalisht në zyrën më të afërt.
        </p>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = rejectedEmail