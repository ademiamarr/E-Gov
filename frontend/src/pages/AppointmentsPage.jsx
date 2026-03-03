import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, MapPin, AlertCircle, Trash2, Check, X } from 'lucide-react'

const AppointmentsPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [selectedToCancel, setSelectedToCancel] = useState(null)
  const [selectedToReschedule, setSelectedToReschedule] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({ new_date: '', new_time: '' })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.get('/appointments/my')

      if (response.data?.success) {
        setAppointments(response.data.data || [])
      } else {
        setAppointments([])
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError(err.response?.data?.message || 'Gabim gjatë ngarkimit të terminek')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await API.delete(`/appointments/${appointmentId}`)

      if (response.data?.success) {
        setAppointments(appointments.filter(a => a.id !== appointmentId))
        setSelectedToCancel(null)
        showToast('Termini u anulua me sukses')
      }
    } catch (err) {
      console.error('Error canceling appointment:', err)
      showToast(err.response?.data?.message || 'Gabim gjatë anulimit të termini', 'error')
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!rescheduleForm.new_date) {
      showToast('Zgjidhni datën e re', 'error')
      return
    }

    try {
      const response = await API.put(`/appointments/${selectedToReschedule.id}/reschedule`, {
        new_date: rescheduleForm.new_date,
        new_time: rescheduleForm.new_time || null,
      })

      if (response.data?.success) {
        setAppointments(appointments.map(a => a.id === selectedToReschedule.id ? response.data.data : a))
        setSelectedToReschedule(null)
        setRescheduleForm({ new_date: '', new_time: '' })
        showToast('Termini u riprogramua me sukses')
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err)
      showToast(err.response?.data?.message || 'Gabim gjatë riprogramimit', 'error')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('sq-AL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const canCancel = (appointment) => {
    if (!appointment.status) return false
    return ['pending', 'approved'].includes(appointment.status.toLowerCase())
  }

  const canReschedule = (appointment) => {
    if (!appointment.status) return false
    return ['pending', 'approved'].includes(appointment.status.toLowerCase())
  }

  const getStatusColor = (status) => {
    if (!status) return { bg: '#f5f6f8', border: '#e5e7eb', color: '#6b7280', dot: '#9ca3af' }

    const st = status.toLowerCase()
    switch (st) {
      case 'pending':
        return { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b' }
      case 'approved':
        return { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dot: '#22c55e' }
      case 'cancelled':
        return { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', dot: '#ef4444' }
      default:
        return { bg: '#f5f6f8', border: '#e5e7eb', color: '#6b7280', dot: '#9ca3af' }
    }
  }

  const getStatusLabel = (status) => {
    if (!status) return 'Nuk dihet'

    const st = status.toLowerCase()
    switch (st) {
      case 'pending':
        return '⏳ Në pritje'
      case 'approved':
        return '✅ Aprovuar'
      case 'cancelled':
        return '❌ Anuluar'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f6f8', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #e5e7eb', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: 13 }}>Po ngarko terminet...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .appt-root {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 20px;
          font-family: 'DM Sans', sans-serif;
        }

        .appt-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .appt-header {
          margin-bottom: 28px;
        }

        .appt-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e3a8a;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .appt-subtitle {
          font-size: 13px;
          color: #6b7280;
        }

        .appt-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .appt-empty {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .appt-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: #f5f6f8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #9ca3af;
        }

        .appt-empty h3 {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .appt-empty p {
          font-size: 13px;
          color: #9ca3af;
        }

        .appt-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .appt-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: box-shadow 0.15s;
        }

        .appt-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .appt-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .appt-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e3a8a;
        }

        .appt-card-institution {
          font-size: 12px;
          color: #6b7280;
          margin-top: 3px;
        }

        .appt-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .appt-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }

        .appt-card-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .appt-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .appt-detail-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #1e3a8a;
        }

        .appt-detail-label {
          font-size: 10px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 2px;
        }

        .appt-detail-value {
          font-size: 13px;
          font-weight: 600;
          color: #1e3a8a;
          display: block;
        }

        .appt-card-actions {
          display: flex;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }

        .appt-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          flex: 1;
        }

        .appt-btn-reschedule {
          background: #f5f6f8;
          color: #1e3a8a;
          border: 1px solid #e5e7eb;
        }

        .appt-btn-reschedule:hover {
          background: #eef0f4;
          border-color: #d1d5db;
        }

        .appt-btn-cancel {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .appt-btn-cancel:hover:not(:disabled) {
          background: #fee2e2;
        }

        /* Modal */
        .appt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 58, 138, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .appt-modal {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .appt-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .appt-modal-title {
          font-size: 15px;
          font-weight: 700;
          color: #1e3a8a;
        }

        .appt-modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .appt-modal-close:hover {
          color: #1e3a8a;
        }

        .appt-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appt-modal-info {
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .appt-modal-info span {
          font-size: 13px;
          color: #1e3a8a;
          font-weight: 500;
        }

        .appt-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .appt-form-label {
          font-size: 11px;
          font-weight: 600;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .appt-form-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s;
        }

        .appt-form-input:focus {
          border-color: #1e3a8a;
          background: #fff;
        }

        .appt-modal-footer {
          padding: 14px 20px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          gap: 8px;
        }

        .appt-modal-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .appt-modal-btn-cancel {
          background: #fff;
          border: 1px solid #e5e7eb;
          color: #6b7280;
        }

        .appt-modal-btn-cancel:hover {
          background: #f9fafb;
        }

        .appt-modal-btn-confirm {
          background: #1e3a8a;
          color: #fff;
        }

        .appt-modal-btn-confirm:hover {
          background: #1d4ed8;
        }

        .appt-toast {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid;
          font-family: 'DM Sans', sans-serif;
          animation: slideIn 0.3s ease;
        }

        .appt-toast.success {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .appt-toast.error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 480px) {
          .appt-root {
            padding: 12px;
          }

          .appt-title {
            font-size: 20px;
          }

          .appt-card-details {
            grid-template-columns: 1fr;
          }

          .appt-card-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="appt-root">
        <div className="appt-container">
          {/* Toast */}
          {toast && (
            <div className={`appt-toast ${toast.type}`}>
              {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
              {toast.msg}
            </div>
          )}

          {/* Header */}
          <div className="appt-header">
            <h1 className="appt-title">📅 Terminet e mi</h1>
            <p className="appt-subtitle">Shikoni dhe menaxhoni terminet tuaj</p>
          </div>

          {/* Error */}
          {error && (
            <div className="appt-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {appointments.length === 0 ? (
            <div className="appt-empty">
              <div className="appt-empty-icon">
                <Calendar size={24} />
              </div>
              <h3>Nuk keni termine</h3>
              <p>Nuk keni asnjë termin të radhurur në momentin e tanishëm.</p>
            </div>
          ) : (
            <div className="appt-list">
              {appointments.map((appt) => {
                const colors = getStatusColor(appt.status)
                return (
                  <div key={appt.id} className="appt-card">
                    <div className="appt-card-header">
                      <div>
                        <div className="appt-card-title">
                          {appt.reason || appt.service_type || 'Termin'}
                        </div>
                        {appt.institution && (
                          <div className="appt-card-institution">📍 {appt.institution}</div>
                        )}
                      </div>
                      <div
                        className="appt-status"
                        style={{
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          color: colors.color,
                        }}
                      >
                        <span
                          className="appt-status-dot"
                          style={{ background: colors.dot }}
                        />
                        {getStatusLabel(appt.status)}
                      </div>
                    </div>

                    <div className="appt-card-details">
                      <div className="appt-detail-item">
                        <div className="appt-detail-icon">
                          <Calendar size={12} />
                        </div>
                        <div>
                          <span className="appt-detail-label">Data</span>
                          <span className="appt-detail-value">
                            {formatDate(appt.appointment_date || appt.approved_date)}
                          </span>
                        </div>
                      </div>

                      <div className="appt-detail-item">
                        <div className="appt-detail-icon">
                          <Clock size={12} />
                        </div>
                        <div>
                          <span className="appt-detail-label">Ora</span>
                          <span className="appt-detail-value">
                            {appt.appointment_time ? appt.appointment_time : appt.approved_date
                              ? new Date(appt.approved_date).toLocaleTimeString('sq-AL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="appt-card-actions">
                      {canReschedule(appt) && (
                        <button
                          className="appt-btn appt-btn-reschedule"
                          onClick={() => {
                            setSelectedToReschedule(appt)
                            setRescheduleForm({ new_date: '', new_time: '' })
                          }}
                        >
                          📅 Riprogramo
                        </button>
                      )}
                      {canCancel(appt) && (
                        <button
                          className="appt-btn appt-btn-cancel"
                          onClick={() => setSelectedToCancel(appt)}
                        >
                          <Trash2 size={12} />
                          Anullo
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cancel Modal */}
        {selectedToCancel && (
          <div className="appt-overlay" onClick={() => setSelectedToCancel(null)}>
            <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="appt-modal-header">
                <div className="appt-modal-title">Anulo termin?</div>
                <button className="appt-modal-close" onClick={() => setSelectedToCancel(null)}>
                  ✕
                </button>
              </div>
              <div className="appt-modal-body">
                <div className="appt-modal-info">
                  <span>
                    <strong>Shërbimi:</strong> {selectedToCancel.reason || selectedToCancel.service_type}
                  </span>
                  <span>
                    <strong>Data:</strong> {formatDate(selectedToCancel.appointment_date || selectedToCancel.approved_date)}
                  </span>
                  {selectedToCancel.institution && (
                    <span>
                      <strong>Institucioni:</strong> {selectedToCancel.institution}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                  Nëse anuloni këtë termin, do t'ju duhet të rezervoni një termin të ri më vonë.
                </p>
              </div>
              <div className="appt-modal-footer">
                <button
                  className="appt-modal-btn appt-modal-btn-cancel"
                  onClick={() => setSelectedToCancel(null)}
                >
                  Provo përsëri
                </button>
                <button
                  className="appt-modal-btn appt-modal-btn-confirm"
                  onClick={() => handleCancelAppointment(selectedToCancel.id)}
                >
                  Po, anullo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {selectedToReschedule && (
          <div className="appt-overlay" onClick={() => setSelectedToReschedule(null)}>
            <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="appt-modal-header">
                <div className="appt-modal-title">Riprogramo termin</div>
                <button className="appt-modal-close" onClick={() => setSelectedToReschedule(null)}>
                  ✕
                </button>
              </div>
              <div className="appt-modal-body">
                <div className="appt-modal-info">
                  <span>
                    <strong>Shërbimi:</strong> {selectedToReschedule.reason || selectedToReschedule.service_type}
                  </span>
                  <span>
                    <strong>Data aktuale:</strong> {formatDate(selectedToReschedule.appointment_date || selectedToReschedule.approved_date)}
                  </span>
                  {selectedToReschedule.institution && (
                    <span>
                      <strong>Institucioni:</strong> {selectedToReschedule.institution}
                    </span>
                  )}
                </div>

                <div className="appt-form-group">
                  <label className="appt-form-label">Data e re</label>
                  <input
                    type="date"
                    className="appt-form-input"
                    value={rescheduleForm.new_date}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })
                    }
                  />
                </div>

                <div className="appt-form-group">
                  <label className="appt-form-label">Ora (opsionale)</label>
                  <input
                    type="time"
                    className="appt-form-input"
                    value={rescheduleForm.new_time}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, new_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="appt-modal-footer">
                <button
                  className="appt-modal-btn appt-modal-btn-cancel"
                  onClick={() => setSelectedToReschedule(null)}
                >
                  Anulo
                </button>
                <button
                  className="appt-modal-btn appt-modal-btn-confirm"
                  onClick={handleRescheduleAppointment}
                >
                  Riprogramo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AppointmentsPage