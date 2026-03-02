const approvedEmail = ({ first_name, last_name, email, login_url }) => ({
  subject: '✅ Llogara juaj u aprovua — eGov Portal',
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px; font-weight: 500;">Republika e Maqedonisë së Veriut</p>
      </div>
      <div style="padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; color: #1f2937;">
        
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #1e3a8a; font-weight: 700;">Llogara juaj u aprovua ✓</h2>
        
        <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #374151;">
          Përshëndetje, <strong>${first_name} ${last_name}</strong>,
        </p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #4b5563;">
          Llogara juaj në <strong>eGov Portal</strong> është aprovuar me sukses. Tani mund të aksesoni të gjitha shërbimet qeveritare online.
        </p>
        <div style="background: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 16px; margin: 0 0 24px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #1e3a8a;">📧 Email i llogarisë:</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">${email}</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 0 0 24px; border-radius: 6px;">
          <p style="margin: 0 0 14px; font-size: 13px; color: #6b7280;">Kyçuni në llogarinë tuaj:</p>
          <a href="${login_url}" style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: -0.5px;">Hyni në portal →</a>
        </div>
        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 14px 16px; border-radius: 6px; margin: 0;">
          <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.6;">
            <strong>Mbrojtja:</strong> Mos ndajeni këtë email me të tjerë. eGov Portal nuk ju do kërkojë përgjithmonë fjalëkalimin përmes email-it.
          </p>
        </div>
      </div>
      <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af;">© 2026 eGov Portal — Republika e Maqedonisë së Veriut</p>
      </div>
    </div>
  `
})

module.exports = approvedEmail