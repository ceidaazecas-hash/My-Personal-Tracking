import { useState, useEffect, useRef } from 'react';
import { X, Calendar, MapPin, DollarSign, Trash2, Tag, FileText, CheckCircle2, Edit2, Save, RotateCcw, Clock, Upload, Users, Plus } from 'lucide-react';
import { Activity, Trophy, Briefcase, Gift, Sparkles, Utensils, Dumbbell, HelpCircle } from 'lucide-react';

export default function EventDetailModal({ event, isOpen, onClose, onDeleteEvent, onUpdateEvent, onMoveTaskToToday }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form States
  const [name, setName] = useState('');
  const [type, setType] = useState('Run');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [customType, setCustomType] = useState('');

  // Custom Date/Time States for Edit Mode
  const [editMonth, setEditMonth] = useState(0);
  const [editDay, setEditDay] = useState(1);
  const [editYear, setEditYear] = useState(new Date().getFullYear());
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmPm, setEditAmPm] = useState('PM');

  // Custom End DatePicker States for Edit Mode
  const [hasEndDate, setHasEndDate] = useState(false);
  const [editEndMonth, setEditEndMonth] = useState(0);
  const [editEndDay, setEditEndDay] = useState(1);
  const [editEndYear, setEditEndYear] = useState(new Date().getFullYear());
  const [editEndHour, setEditEndHour] = useState('12');
  const [editEndMinute, setEditEndMinute] = useState('00');
  const [editEndAmPm, setEditEndAmPm] = useState('PM');

  // Share Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Swipe-down to close gesture states
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef(null);
  const dragState = useRef({ dragging: false, startY: 0, currentDragY: 0 });

  // Custom delete confirm popup state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate edit fields when event changes or when edit mode is toggled
  useEffect(() => {
    if (event) {
      setName(event.name || '');
      setLocation(event.location || '');
      setOrganization(event.organization || '');
      setIsPaid(event.is_paid || false);
      setPrice(event.price ? String(event.price) : '');
      setCurrency('USD'); // Default to editing in USD normalized
      setDescription(event.description || '');

      const taskTypesList = ['Food', 'Work', 'Workout', 'Running'];
      const eventTypesList = ['Run', 'Sport', 'Meeting', 'Birthday', 'Festival'];
      if (event.is_task) {
        if (taskTypesList.includes(event.type)) {
          setType(event.type);
          setCustomType('');
        } else {
          setType('Other');
          setCustomType(event.type || '');
        }
      } else {
        if (eventTypesList.includes(event.type)) {
          setType(event.type || 'Run');
          setCustomType('');
        } else {
          setType('Other');
          setCustomType(event.type || '');
        }
      }

      const eventDate = new Date(event.date);
      setEditMonth(eventDate.getMonth());
      setEditDay(eventDate.getDate());
      setEditYear(eventDate.getFullYear());
      
      const hour24 = eventDate.getHours();
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      const hour12 = hour24 % 12 || 12;
      setEditHour(String(hour12).padStart(2, '0'));
      setEditMinute(String(eventDate.getMinutes()).padStart(2, '0'));
      setEditAmPm(ampm);

      if (event.end_date) {
        setHasEndDate(true);
        const eventEndDate = new Date(event.end_date);
        setEditEndMonth(eventEndDate.getMonth());
        setEditEndDay(eventEndDate.getDate());
        setEditEndYear(eventEndDate.getFullYear());
        
        const endHour24 = eventEndDate.getHours();
        const endAmpm = endHour24 >= 12 ? 'PM' : 'AM';
        const endHour12 = endHour24 % 12 || 12;
        setEditEndHour(String(endHour12).padStart(2, '0'));
        setEditEndMinute(String(eventEndDate.getMinutes()).padStart(2, '0'));
        setEditEndAmPm(endAmpm);
      } else {
        setHasEndDate(false);
        // Default end date matches start date
        setEditEndMonth(eventDate.getMonth());
        setEditEndDay(eventDate.getDate());
        setEditEndYear(eventDate.getFullYear());
        setEditEndHour(String(hour12).padStart(2, '0'));
        setEditEndMinute(String(eventDate.getMinutes()).padStart(2, '0'));
        setEditEndAmPm(ampm);
      }
    }
  }, [event, isEditing]);

  // Reset editing mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setErrorMsg('');
      setDragY(0);
    }
  }, [isOpen]);


  const eventTypes = [
    { name: 'Run', icon: <Activity size={18} /> },
    { name: 'Sport', icon: <Trophy size={18} /> },
    { name: 'Meeting', icon: <Briefcase size={18} /> },
    { name: 'Birthday', icon: <Gift size={18} /> },
    { name: 'Festival', icon: <Sparkles size={18} /> },
    { name: 'Other', icon: <Calendar size={18} /> }
  ];

  const taskTypes = [
    { name: 'Food', icon: <Utensils size={18} /> },
    { name: 'Work', icon: <Briefcase size={18} /> },
    { name: 'Workout', icon: <Dumbbell size={18} /> },
    { name: 'Running', icon: <Activity size={18} /> },
    { name: 'Other', icon: <HelpCircle size={18} /> }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysCount = getDaysInMonth(editMonth, editYear);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  const formatPrice = (priceUSD) => {
    const usd = Number(priceUSD);
    const khr = usd * 4000;
    return `$${usd.toFixed(2)} / ${khr.toLocaleString()}៛`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderReadOnlyDateRange = () => {
    const startD = new Date(event.date);
    const hasEnd = !!event.end_date;
    const endD = hasEnd ? new Date(event.end_date) : null;

    const startFormattedDate = formatDate(event.date);
    const startFormattedTime = formatTime(event.date);

    if (!hasEnd) {
      return (
        <>
          <div className="detail-item">
            <span className="detail-label-icon"><Calendar size={20} /></span>
            <div className="detail-content">
              <span className="detail-label">Date</span>
              <span className="detail-val">{startFormattedDate}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-label-icon"><Clock size={20} /></span>
            <div className="detail-content">
              <span className="detail-label">Scheduled Time</span>
              <span className="detail-val">{startFormattedTime}</span>
            </div>
          </div>
        </>
      );
    }

    const endFormattedDate = formatDate(event.end_date);
    const endFormattedTime = formatTime(event.end_date);

    const isSameDay = startD.toDateString() === endD.toDateString();

    if (isSameDay) {
      return (
        <>
          <div className="detail-item">
            <span className="detail-label-icon"><Calendar size={20} /></span>
            <div className="detail-content">
              <span className="detail-label">Date</span>
              <span className="detail-val">{startFormattedDate}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-label-icon"><Clock size={20} /></span>
            <div className="detail-content">
              <span className="detail-label">Scheduled Time</span>
              <span className="detail-val">{startFormattedTime} - {endFormattedTime}</span>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="detail-item">
          <span className="detail-label-icon"><Calendar size={20} /></span>
          <div className="detail-content">
            <span className="detail-label">Date Range</span>
            <span className="detail-val">{startFormattedDate} to {endFormattedDate}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label-icon"><Clock size={20} /></span>
          <div className="detail-content">
            <span className="detail-label">Scheduled Time</span>
            <span className="detail-val">{startFormattedTime} to {endFormattedTime}</span>
          </div>
        </div>
      </>
    );
  };

  const getMapsUrl = () => {
    if (!event.location) return '#';
    if (event.location.includes('http')) return event.location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!name.trim()) {
      setErrorMsg('Title/Name is required.');
      setLoading(false);
      return;
    }

    if (!event.is_task && !location.trim()) {
      setErrorMsg('Location is required.');
      setLoading(false);
      return;
    }

    // Reconstruct safe Date object
    let hour24 = parseInt(editHour);
    if (editAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (editAmPm === 'AM' && hour24 === 12) hour24 = 0;

    const localDate = new Date(
      editYear,
      editMonth,
      editDay,
      hour24,
      parseInt(editMinute)
    );

    if (isNaN(localDate.getTime())) {
      setErrorMsg('Selected date & time is invalid.');
      setLoading(false);
      return;
    }

    let endIso = null;
    if (hasEndDate) {
      let endHour24 = parseInt(editEndHour);
      if (editEndAmPm === 'PM' && endHour24 !== 12) endHour24 += 12;
      if (editEndAmPm === 'AM' && endHour24 === 12) endHour24 = 0;

      const localEndDate = new Date(
        editEndYear,
        editEndMonth,
        editEndDay,
        endHour24,
        parseInt(editEndMinute)
      );

      if (isNaN(localEndDate.getTime())) {
        setErrorMsg('Selected end date & time is invalid.');
        setLoading(false);
        return;
      }

      if (localEndDate <= localDate) {
        setErrorMsg('End date & time must be after start date & time.');
        setLoading(false);
        return;
      }

      endIso = localEndDate.toISOString();
    }

    try {
      const updatedData = {
        name,
        date: localDate.toISOString(),
        end_date: endIso,
      };

      if (!event.is_task) {
        updatedData.type = type === 'Other' ? (customType.trim() || 'Other') : type;
        updatedData.location = location.trim();
        updatedData.organization = organization.trim();
        updatedData.is_paid = isPaid;
        const rawPrice = parseFloat(price);
        updatedData.price = isPaid 
          ? (currency === 'KHR' ? rawPrice / 4000 : rawPrice) 
          : 0.00;
      } else {
        updatedData.type = type === 'Other' ? (customType.trim() || 'Task') : type;
        updatedData.description = description.trim();
      }

      await onUpdateEvent(event.id, updatedData);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update item.');
    } finally {
      setLoading(false);
    }
  };

  // Touch handlers — uses native addEventListener with passive:false to prevent page scroll
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const onTouchStart = (e) => {
      dragState.current.dragging = true;
      dragState.current.startY = e.touches[0].clientY;
      dragState.current.currentDragY = 0;
      setIsDragging(true);
    };

    const onTouchMove = (e) => {
      if (!dragState.current.dragging) return;
      const deltaY = e.touches[0].clientY - dragState.current.startY;
      if (deltaY > 0) {
        e.preventDefault(); // Stop page from scrolling during swipe-down
        dragState.current.currentDragY = deltaY;
        setDragY(deltaY);
      }
    };

    const onTouchEnd = () => {
      dragState.current.dragging = false;
      setIsDragging(false);
      if (dragState.current.currentDragY > 120) {
        onClose();
      }
      dragState.current.currentDragY = 0;
      setDragY(0);
    };

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen]);

  // Mouse handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.modal-header') || e.target.closest('.drag-handle')) {
      setStartY(e.clientY);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (dragY > 120) {
        onClose();
      }
      setDragY(0);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div 
      className="modal-overlay"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        ref={sheetRef}
        className="modal-sheet"
        style={{ 
          transform: dragY > 0 ? `translateY(${dragY}px)` : 'none', 
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        
        {/* Drag Handle Indicator */}
        <div 
          className="drag-handle"
          onMouseDown={handleMouseDown}
          style={{
            width: '100%',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 10
          }}
        >
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--border)',
            borderRadius: '2px'
          }} />
        </div>

        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{ 
            justifyContent: 'center', 
            position: 'relative', 
            marginBottom: '16px',
            paddingTop: '8px'
          }}
        >
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
            {event.is_task ? <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} /> : <Calendar size={20} style={{ color: 'var(--accent)' }} />}
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
              {isEditing ? `Edit ${event.is_task ? 'Task' : 'Event'}` : event.name}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close details" style={{ position: 'absolute', right: '0' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {/* --- EDIT MODE FORM --- */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Title / Name */}
            <div className="input-group">
              <label className="input-label">Title / Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input"
                style={{ textAlign: 'center' }}
                required
                disabled={loading}
              />
            </div>

            {/* Event specific: Organization (Optional) */}
            {!event.is_task && (
              <div className="input-group">
                <label className="input-label">Organization (Optional)</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Event specific: Type selector */}
            {!event.is_task && (
              <div className="input-group">
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>Event Type</label>
                <div className="type-grid">
                  {eventTypes.map(t => (
                    <div
                      key={t.name}
                      className={`type-option ${type === t.name ? 'selected' : ''}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setType(t.name)}
                    >
                      <span style={{ color: type === t.name ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {t.icon}
                      </span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event specific: Custom Type selector (optional) */}
            {!event.is_task && type === 'Other' && (
              <div className="input-group">
                <label className="input-label">Custom Event Type (Optional)</label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Task specific: Category selector */}
            {event.is_task && (
              <div className="input-group">
                <label className="input-label" style={{ textAlign: 'center' }}>Task Category</label>
                <div className="type-grid">
                  {taskTypes.map(t => (
                    <div
                      key={t.name}
                      className={`type-option ${type === t.name ? 'selected' : ''}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setType(t.name)}
                    >
                      <span style={{ color: type === t.name ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {t.icon}
                      </span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task specific: Custom Category Input */}
            {event.is_task && type === 'Other' && (
              <div className="input-group">
                <label className="input-label">Custom Category</label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Date selection grid */}
            <div className="input-group">
              <label className="input-label" style={{ textAlign: 'center' }}>Date</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                <div className="select-container">
                  <select 
                    value={editMonth} 
                    onChange={(e) => setEditMonth(parseInt(e.target.value))}
                    className="select-input"
                    disabled={loading}
                  >
                    {months.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
                
                <div className="select-container">
                  <select 
                    value={editDay} 
                    onChange={(e) => setEditDay(parseInt(e.target.value))}
                    className="select-input"
                    disabled={loading}
                  >
                    {Array.from({ length: daysCount }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="select-container">
                  <select 
                    value={editYear} 
                    onChange={(e) => setEditYear(parseInt(e.target.value))}
                    className="select-input"
                    disabled={loading}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day name display */}
              <div style={{
                textAlign: 'center',
                marginTop: '6px',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--accent)',
                letterSpacing: '0.5px'
              }}>
                {new Date(editYear, editMonth, editDay).toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>

            {/* Time selection grid */}
            <div className="input-group">
              <label className="input-label" style={{ textAlign: 'center' }}>Time</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="select-container" style={{ flex: 1 }}>
                  <select 
                    value={editHour} 
                    onChange={(e) => setEditHour(e.target.value)}
                    className="select-input"
                    disabled={loading}
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                
                <span className="time-separator">:</span>

                <div className="select-container" style={{ flex: 1 }}>
                  <select 
                    value={editMinute} 
                    onChange={(e) => setEditMinute(e.target.value)}
                    className="select-input"
                    disabled={loading}
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="toggle-selector time-ampm-toggle">
                  <div 
                    className={`toggle-option ${editAmPm === 'AM' ? 'active' : ''}`}
                    onClick={() => setEditAmPm('AM')}
                  >
                    AM
                  </div>
                  <div 
                    className={`toggle-option ${editAmPm === 'PM' ? 'active' : ''}`}
                    onClick={() => setEditAmPm('PM')}
                  >
                    PM
                  </div>
                </div>
              </div>
            </div>

            {/* End Date toggle & picker */}
            <div className="input-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="input-label" style={{ margin: 0 }}>Set End Date & Time</span>
                <label className="toggle-switch-container">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>

            {hasEndDate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                {/* Custom End Date Picker (Month, Day, Year Select list grid row) */}
                <div className="input-group">
                  <label className="input-label" style={{ textAlign: 'center' }}>End Date</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                    
                    {/* End Month Select Picker */}
                    <div className="select-container">
                      <select 
                        value={editEndMonth}
                        onChange={(e) => setEditEndMonth(parseInt(e.target.value))}
                        className="select-input"
                        disabled={loading}
                      >
                        {months.map((m, idx) => (
                          <option key={m} value={idx}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* End Day Select Picker */}
                    <div className="select-container">
                      <select 
                        value={editEndDay}
                        onChange={(e) => setEditEndDay(parseInt(e.target.value))}
                        className="select-input"
                        disabled={loading}
                      >
                        {Array.from({ length: getDaysInMonth(editEndMonth, editEndYear) }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* End Year Select Picker */}
                    <div className="select-container">
                      <select 
                        value={editEndYear}
                        onChange={(e) => setEditEndYear(parseInt(e.target.value))}
                        className="select-input"
                        disabled={loading}
                      >
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* End Day name display */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--accent)',
                    letterSpacing: '0.5px'
                  }}>
                    {new Date(editEndYear, editEndMonth, editEndDay).toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                </div>

                {/* Custom End Time Picker (Hour, Minute, AM/PM Segmented control row) */}
                <div className="input-group">
                  <label className="input-label" style={{ textAlign: 'center' }}>End Time</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    {/* End Hour Select Picker */}
                    <div className="select-container" style={{ flex: 1 }}>
                      <select 
                        value={editEndHour}
                        onChange={(e) => setEditEndHour(e.target.value)}
                        className="select-input"
                        disabled={loading}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <span className="time-separator">:</span>

                    {/* End Minute Select Picker */}
                    <div className="select-container" style={{ flex: 1 }}>
                      <select 
                        value={editEndMinute}
                        onChange={(e) => setEditEndMinute(e.target.value)}
                        className="select-input"
                        disabled={loading}
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* End AM/PM toggle button segment */}
                    <div className="toggle-selector time-ampm-toggle">
                      <div 
                        className={`toggle-option ${editEndAmPm === 'AM' ? 'active' : ''}`}
                        onClick={() => setEditEndAmPm('AM')}
                      >
                        AM
                      </div>
                      <div 
                        className={`toggle-option ${editEndAmPm === 'PM' ? 'active' : ''}`}
                        onClick={() => setEditEndAmPm('PM')}
                      >
                        PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event specific: Location */}
            {!event.is_task && (
              <div className="input-group">
                <label className="input-label">Location / Maps Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Event specific: Cost Selector */}
            {!event.is_task && (
              <div className="input-group">
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>Cost</label>
                <div className="toggle-selector">
                  <div 
                    className={`toggle-option ${!isPaid ? 'active' : ''}`}
                    onClick={() => { setIsPaid(false); setPrice(''); }}
                  >
                    Free
                  </div>
                  <div 
                    className={`toggle-option ${isPaid ? 'active' : ''}`}
                    onClick={() => setIsPaid(true)}
                  >
                    Paid
                  </div>
                </div>
              </div>
            )}

            {/* Event specific: Cost Currency & Pricing inputs */}
            {!event.is_task && isPaid && (
              <div className="input-group">
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>Currency</label>
                <div className="toggle-selector" style={{ marginBottom: '12px' }}>
                  <div 
                    className={`toggle-option ${currency === 'USD' ? 'active' : ''}`}
                    onClick={() => setCurrency('USD')}
                  >
                    USD ($)
                  </div>
                  <div 
                    className={`toggle-option ${currency === 'KHR' ? 'active' : ''}`}
                    onClick={() => setCurrency('KHR')}
                  >
                    KHR (៛)
                  </div>
                </div>

                <label className="input-label">Price ({currency === 'USD' ? '$' : '៛'})</label>
                <input
                  type="number"
                  step={currency === 'USD' ? '0.01' : '100'}
                  placeholder={currency === 'USD' ? '0.00' : '0'}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Task specific: Description notes */}
            {event.is_task && (
              <div className="input-group">
                <label className="input-label">Task Description (Notes)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-input"
                  style={{ 
                    height: '80px', 
                    resize: 'none', 
                    padding: '12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                  placeholder="Enter task details..."
                  disabled={loading}
                />
              </div>
            )}

            {/* Form actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsEditing(false)} 
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        ) : (
          /* --- READ ONLY DETAILS VIEW --- */
          <>
            <div className="event-detail-grid">
              
              {/* Type / Category Label */}
              <div className="detail-item">
                <span className="detail-label-icon"><Tag size={20} /></span>
                <div className="detail-content">
                  <span className="detail-label">{event.is_task ? 'Task Category' : 'Item Type'}</span>
                  <span className="detail-val" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                    {event.type}
                  </span>
                </div>
              </div>

              {/* Organization (Event only - Optional) */}
              {!event.is_task && event.organization && (
                <div className="detail-item">
                  <span className="detail-label-icon"><Users size={20} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Organization</span>
                    <span className="detail-val">{event.organization}</span>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              {renderReadOnlyDateRange()}

              {/* Location (Event only) */}
              {!event.is_task && (
                <div className="detail-item">
                  <span className="detail-label-icon"><MapPin size={20} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Location / Address</span>
                    <span className="detail-val" style={{ marginBottom: '8px' }}>
                      {event.location}
                    </span>
                    
                    <a 
                      href={getMapsUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="maps-link-btn"
                    >
                      <MapPin size={16} />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Cost (Event only) */}
              {!event.is_task && (
                <div className="detail-item">
                  <span className="detail-label-icon"><DollarSign size={20} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Cost</span>
                    <span className="detail-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {event.is_paid ? (
                        <span className="price-tag">{formatPrice(event.price)}</span>
                      ) : (
                        <span className="price-tag free">Free</span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Description Notes (Task only) */}
              {event.is_task && event.description && (
                <div className="detail-item">
                  <span className="detail-label-icon"><FileText size={20} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Task Description</span>
                    <span className="detail-val" style={{ fontWeight: 'normal', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {event.description}
                    </span>
                  </div>
                </div>
              )}

              {/* Status (Task only) */}
              {event.is_task && (
                <div className="detail-item">
                  <span className="detail-label-icon"><CheckCircle2 size={20} /></span>
                  <div className="detail-content">
                    <span className="detail-label">Status</span>
                    <span className="detail-val" style={{ color: event.is_completed ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {event.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Reschedule to Today Button (Overdue Tasks only) */}
            {event.is_task && !event.is_completed && new Date(event.date) < (new Date().setHours(0,0,0,0)) && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ 
                  width: '100%', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  fontWeight: '700'
                }}
                onClick={() => {
                  onMoveTaskToToday(event.id);
                  onClose();
                }}
              >
                <Calendar size={16} />
                <span>Reschedule to Today</span>
              </button>
            )}

            {/* Read-only Actions: Edit & Delete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                
                <button 
                  className="btn-danger-outline"
                  style={{ margin: 0 }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>

              {!event.is_task && (
                <button 
                  type="button" 
                  className="btn-primary"
                  style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    backgroundColor: 'var(--accent)',
                    color: '#000',
                    fontWeight: '700'
                  }}
                  onClick={() => setShowShareModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.41" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  <span>Share Event</span>
                </button>
              )}
            </div>

            {/* Custom Share Modal Popup */}
            {showShareModal && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px'
              }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '20px',
                  padding: '28px 24px',
                  width: '100%',
                  maxWidth: '380px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                  animation: 'slideUp 0.2s ease-out',
                  position: 'relative'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', textAlign: 'center' }}>
                    Share Event
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
                    Share <strong>"{event.name}"</strong> with others
                  </p>

                  {/* Share link input with copy button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    marginBottom: '20px',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?share=${event.id}`}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?share=${event.id}`);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Social sharing icons grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    {/* Telegram */}
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/?share=${event.id}`)}&text=${encodeURIComponent(`Check out this event: ${event.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        backgroundColor: '#229ED9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '20px'
                      }}>
                        ✈️
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Telegram</span>
                    </a>

                    {/* Messenger */}
                    <div
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?share=${event.id}`);
                        alert("Link copied! You can now paste and share it in your Facebook Messenger chat.");
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        backgroundColor: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '20px'
                      }}>
                        💬
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Messenger</span>
                    </div>

                    {/* TikTok / Other share method */}
                    <div
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/?share=${event.id}`);
                        alert("Link copied! You can paste this link in your TikTok bio or video comment section to share it.");
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        backgroundColor: '#010101', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '20px'
                      }}>
                        🎵
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>TikTok</span>
                    </div>
                  </div>

                  {/* Native share sheet trigger if supported */}
                  {navigator.share && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: event.name,
                            text: `Check out this event: ${event.name}`,
                            url: `${window.location.origin}/?share=${event.id}`,
                          });
                        } catch (err) {
                          console.log('Native share failed or cancelled');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--accent)',
                        background: 'var(--accent-glow)',
                        color: 'var(--accent)',
                        fontWeight: '700',
                        fontSize: '13px',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      📱 Open System Share
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'none',
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Custom Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '28px 24px',
              width: '100%',
              maxWidth: '360px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              textAlign: 'center',
              animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🗑️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Delete {event.is_task ? 'Task' : 'Event'}?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>"{event.name}"</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: '1px solid var(--border)', background: 'none',
                    color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); onDeleteEvent(event.id); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    border: 'none', background: '#ef4444',
                    color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
