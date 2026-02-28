const appointmentReminderEmail = ({ first_name, institution, reason, date, reference_id }) => ({
  subject: '⏰ Kujtesë: Termini juaj nesër — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #4f46e5; font-size: 18px; margin: 0 0 8px;">⏰ Kujtesë për terminm nesër!</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Përshëndetje, <strong>${first_name}</strong>! Ju kujtojmë terminin tuaj.</p>
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 24px; margin: 0 0 24px;">
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">INSTITUCIONI</span>
            <strong style="color: #1f2937; font-size: 14px;">${institution}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">SHËRBIMI</span>
            <strong style="color: #1f2937; font-size: 14px;">${reason}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">DATA & ORA</span>
            <strong style="color: #4f46e5; font-size: 16px;">${date}</strong>
          </div>
          <div>
            <span style="color: #6b7280; font-size: 12px; display: block; margin-bottom: 2px;">REFERENCA</span>
            <strong style="color: #1f2937; font-size: 13px; font-family: monospace;">${reference_id}</strong>
          </div>
        </div>
        <div style="background: #fef3c7; border-radius: 8px; padding: 14px 18px;">
          <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 600;">
            ⚠️ Mos harroni: dokumentin e identitetit + këtë konfirmim!
          </p>
        </div>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = appointmentReminderEmail