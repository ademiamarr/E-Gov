const rejectedEmail = ({ first_name, last_name, reason }) => ({
  subject: '❌ Regjistrimi nuk u aprovua — eGov Portal',
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">🇲🇰 eGov Portal</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px; font-weight: 500;">Republika e Maqedonisë së Veriut</p>
      </div>

      <div style="padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; color: #1f2937;">
        
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #b91c1c; font-weight: 700;">Regjistrimi nuk u aprovua</h2>
        
        <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #374151;">
          Përshëndetje, <strong>${first_name} ${last_name}</strong>,
        </p>

        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #4b5563;">
          Pas shqyrtimit të dokumenteve tuaja, regjistrimi në <strong>eGov Portal</strong> nuk mund të aprovohet në këtë kohë.
        </p>

        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Arsyeja:</p>
          <p style="margin: 0; font-size: 15px; color: #7f1d1d; line-height: 1.6; font-weight: 500;">${reason || 'Dokumentet nuk plotësojnë kërkesat e kërkuara'}</p>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; margin: 0 0 24px; border-radius: 6px;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #374151;">Çfarë mund të bëni:</p>
          <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #4b5563; line-height: 1.8;">
            <li style="margin-bottom: 6px;">Kontrolloni dokumentet dhe sigurohuni se janë origjinale</li>
            <li style="margin-bottom: 6px;">Përpiquni të regjistroheni përsëri me dokumenta të përditësuara</li>
            <li>Kontaktoni support-in për ndihmë shtesë</li>
          </ol>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 16px; margin: 0;">
          <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #1e40af;">📞 Kontaktet e support:</p>
          <p style="margin: 0; font-size: 13px; color: #1e40af;">Email: <strong>support@egov.mk</strong></p>
        </div>

      </div>

      <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af;">© 2026 eGov Portal — Republika e Maqedonisë së Veriut</p>
      </div>

    </div>
  `
})

module.exports = rejectedEmail