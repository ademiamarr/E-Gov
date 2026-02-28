const approvedEmail = ({ first_name, login_url }) => ({
  subject: '✅ Llogaria juaj u aprovua — eGov Portal',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #065f46; font-size: 20px; margin: 0 0 16px;">Llogaria u aprovua! 🎉</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Përshëndetje, <strong>${first_name}</strong>!<br><br>
          Llogaria juaj në eGov Portal është aprovuar. Tani mund të aksesoni të gjitha shërbimet qeveritare online.
        </p>
        <div style="background: #ecfdf5; border-radius: 10px; padding: 20px; margin: 0 0 28px;">
          <p style="color: #065f46; font-size: 13px; margin: 0 0 8px; font-weight: 600;">✓ Termine online</p>
          <p style="color: #065f46; font-size: 13px; margin: 0 0 8px; font-weight: 600;">✓ Pagesa gjobash</p>
          <p style="color: #065f46; font-size: 13px; margin: 0; font-weight: 600;">✓ Shërbime administrative</p>
        </div>
        <a href="${login_url}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Kyçuni tani →
        </a>
      </div>
      <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
        © 2026 eGov Portal — Republika e Maqedonisë së Veriut
      </p>
    </div>
  `
})

module.exports = approvedEmail