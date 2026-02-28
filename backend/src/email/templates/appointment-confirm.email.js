const appointmentConfirmEmail = ({ first_name, institution, reason, date, reference_id }) => ({
  subject: '📅 Termini juaj u konfirmua — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 8px;">Termini u konfirmua! ✅</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px;">Përshëndetje, <strong>${first_name}</strong>!</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 0 0 24px;">
          <div style="display: flex; margin-bottom: 14px;">
            <span style="color: #6b7280; font-size: 13px; width: 140px; flex-shrink: 0;">📍 Institucioni:</span>
            <strong style="color: #1f2937; font-size: 13px;">${institution}</strong>
          </div>
          <div style="display: flex; margin-bottom: 14px;">
            <span style="color: #6b7280; font-size: 13px; width: 140px; flex-shrink: 0;">📋 Shërbimi:</span>
            <strong style="color: #1f2937; font-size: 13px;">${reason}</strong>
          </div>
          <div style="display: flex; margin-bottom: 14px;">
            <span style="color: #6b7280; font-size: 13px; width: 140px; flex-shrink: 0;">📅 Data & Ora:</span>
            <strong style="color: #2563eb; font-size: 13px;">${date}</strong>
          </div>
          <div style="display: flex;">
            <span style="color: #6b7280; font-size: 13px; width: 140px; flex-shrink: 0;">🔖 Referenca:</span>
            <strong style="color: #1f2937; font-size: 13px; font-family: monospace;">${reference_id}</strong>
          </div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 14px 18px;">
          <p style="color: #1e40af; font-size: 12px; margin: 0;">
            ℹ️ Sillni me vete dokumentin tuaj të identitetit dhe këtë konfirmim.
          </p>
        </div>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = appointmentConfirmEmail