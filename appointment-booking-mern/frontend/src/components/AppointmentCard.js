const AppointmentCard = ({ appointment, subtitle, actions }) => {
  return (
    <div className={`appt-card status-${appointment.status}`}>
      <div className="appt-main">
        <span className="appt-date">
          {appointment.date} · {appointment.time}
        </span>
        <span className="muted">{subtitle}</span>
        {appointment.reason && <span className="muted">Reason: {appointment.reason}</span>}
        {appointment.notes && <span className="muted">Doctor's notes: {appointment.notes}</span>}
        <span className={`stamp ${appointment.status}`}>{appointment.status}</span>
      </div>
      {actions && <div className="appt-actions">{actions}</div>}
    </div>
  );
};

export default AppointmentCard;
