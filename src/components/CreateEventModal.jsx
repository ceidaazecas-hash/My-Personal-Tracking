import { useState, useEffect, useRef } from 'react';
import { X, Calendar, MapPin, CheckSquare, Activity, Trophy, Briefcase, Gift, Sparkles, Utensils, Dumbbell, HelpCircle, Trash2 } from 'lucide-react';

export default function CreateEventModal({ isOpen, onClose, onCreateEvent, forcedMode, draftToEdit }) {
  // Mode switcher: 'event' or 'task'
  const [mode, setMode] = useState(forcedMode || 'event');
  
  // General states
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Date Picker states (local time based)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState(now.getDate()); // 1-31
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  // Custom Time Picker states
  const currentHour = now.getHours();
  const isPm = currentHour >= 12;
  const initialHour12 = currentHour % 12 || 12;
  
  const [selectedHour, setSelectedHour] = useState(String(initialHour12).padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState(String(now.getMinutes()).padStart(2, '0'));
  const [selectedAmPm, setSelectedAmPm] = useState(isPm ? 'PM' : 'AM');

  // Event specific states
  const [type, setType] = useState('Run');
  const [customEventType, setCustomEventType] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [distanceRun, setDistanceRun] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'KHR'
  const [paymentType, setPaymentType] = useState('once'); // 'once' or 'monthly'

  // Task specific states
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('Work');
  const [customTaskType, setCustomTaskType] = useState('');

  // Swipe-down to close gesture states
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef(null);
  const dragState = useRef({ dragging: false, startY: 0, currentDragY: 0 });

  // Custom Save as Draft Confirm Overlay State
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);

  // Custom End Date Picker states
  const [hasEndDate, setHasEndDate] = useState(false);
  const [selectedEndMonth, setSelectedEndMonth] = useState(now.getMonth());
  const [selectedEndDay, setSelectedEndDay] = useState(now.getDate());
  const [selectedEndYear, setSelectedEndYear] = useState(now.getFullYear());
  const [selectedEndHour, setSelectedEndHour] = useState(String(initialHour12).padStart(2, '0'));
  const [selectedEndMinute, setSelectedEndMinute] = useState(String(now.getMinutes()).padStart(2, '0'));
  const [selectedEndAmPm, setSelectedEndAmPm] = useState(isPm ? 'PM' : 'AM');

  // Reset form states cleanly
  const resetForm = () => {
    setName('');
    setOrganization('');
    setType('Run');
    setCustomEventType('');
    setLocation('');
    setDistance('');
    setHasRun(false);
    setDistanceRun('');
    setIsPaid(false);
    setPrice('');
    setCurrency('USD');
    setPaymentType('once');
    setDescription('');
    setTaskType('Work');
    setCustomTaskType('');
    setErrorMsg('');
    setHasEndDate(false);
    setSelectedEndMonth(now.getMonth());
    setSelectedEndDay(now.getDate());
    setSelectedEndYear(now.getFullYear());
    setSelectedEndHour(String(initialHour12).padStart(2, '0'));
    setSelectedEndMinute(String(now.getMinutes()).padStart(2, '0'));
    setSelectedEndAmPm(isPm ? 'PM' : 'AM');
  };

  // Sync mode and pre-populate draft data when modal opens/draftToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (draftToEdit) {
        setName(draftToEdit.name || '');
        setMode(draftToEdit.is_task ? 'task' : 'event');
        
        // Parse date
        const d = new Date(draftToEdit.date);
        setSelectedMonth(d.getMonth());
        setSelectedDay(d.getDate());
        setSelectedYear(d.getFullYear());
        
        const hour24 = d.getHours();
        setSelectedAmPm(hour24 >= 12 ? 'PM' : 'AM');
        setSelectedHour(String(hour24 % 12 || 12).padStart(2, '0'));
        setSelectedMinute(String(d.getMinutes()).padStart(2, '0'));

        // Parse optional end date
        if (draftToEdit.end_date) {
          setHasEndDate(true);
          const endD = new Date(draftToEdit.end_date);
          setSelectedEndMonth(endD.getMonth());
          setSelectedEndDay(endD.getDate());
          setSelectedEndYear(endD.getFullYear());
          
          const endHour24 = endD.getHours();
          setSelectedEndAmPm(endHour24 >= 12 ? 'PM' : 'AM');
          setSelectedEndHour(String(endHour24 % 12 || 12).padStart(2, '0'));
          setSelectedEndMinute(String(endD.getMinutes()).padStart(2, '0'));
        } else {
          setHasEndDate(false);
        }

        if (!draftToEdit.is_task) {
          const eventTypesList = ['Run', 'Sport', 'Meeting', 'Birthday', 'Festival'];
          if (eventTypesList.includes(draftToEdit.type)) {
            setType(draftToEdit.type || 'Run');
            setCustomEventType('');
          } else {
            setType('Other');
            setCustomEventType(draftToEdit.type || '');
          }
          setLocation(draftToEdit.location || '');
          const cleanDistance = (distStr) => {
            if (!distStr) return '';
            const match = distStr.match(/(\d+(?:\.\d+)?)/);
            return match ? match[1] : '';
          };
          setDistance(cleanDistance(draftToEdit.distance || ''));
          setHasRun(draftToEdit.has_run || false);
          setDistanceRun(draftToEdit.distance_run ? String(draftToEdit.distance_run) : '');
          setOrganization(draftToEdit.organization || '');
          setIsPaid(draftToEdit.is_paid || false);
          setPrice(draftToEdit.price || '');
          setPaymentType(draftToEdit.payment_type || 'once');
        } else {
          const taskTypesList = ['Food', 'Work', 'Workout', 'Running'];
          if (taskTypesList.includes(draftToEdit.type)) {
            setTaskType(draftToEdit.type || 'Work');
            setCustomTaskType('');
          } else {
            setTaskType('Other');
            setCustomTaskType(draftToEdit.type || '');
          }
          setDescription(draftToEdit.description || '');
        }
      } else {
        if (forcedMode) {
          setMode(forcedMode);
        }
        resetForm();
      }
    }
  }, [draftToEdit, isOpen, forcedMode]);

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

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const endDaysInMonth = getDaysInMonth(selectedEndMonth, selectedEndYear);
  const endDays = Array.from({ length: endDaysInMonth }, (_, i) => i + 1);

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Close Request Logic (Toggles Draft Confirm if name is entered)
  const handleCloseRequest = () => {
    if (name.trim() !== '') {
      setShowDraftConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  // Discard draft form contents completely
  const handleDiscard = () => {
    resetForm();
    onClose();
  };

  // Save the current form data to LocalStorage as a draft item
  const handleSaveDraft = () => {
    let hour24 = parseInt(selectedHour);
    if (selectedAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedAmPm === 'AM' && hour24 === 12) hour24 = 0;

    const localDate = new Date(
      selectedYear,
      selectedMonth,
      selectedDay,
      hour24,
      parseInt(selectedMinute)
    );

    let endIso = null;
    if (hasEndDate) {
      let endHour24 = parseInt(selectedEndHour);
      if (selectedEndAmPm === 'PM' && endHour24 !== 12) endHour24 += 12;
      if (selectedEndAmPm === 'AM' && endHour24 === 12) endHour24 = 0;
      const localEndDate = new Date(
        selectedEndYear,
        selectedEndMonth,
        selectedEndDay,
        endHour24,
        parseInt(selectedEndMinute)
      );
      if (!isNaN(localEndDate.getTime())) {
        endIso = localEndDate.toISOString();
      }
    }

    const draftId = draftToEdit ? draftToEdit.id : 'draft_' + Date.now();
    const isSportRelated = mode === 'event' && (type === 'Run' || type === 'Sport');
    const draftItem = {
      id: draftId,
      is_task: mode === 'task',
      name: name.trim(),
      date: localDate.toISOString(),
      end_date: endIso,
      type: mode === 'event' ? (type === 'Other' ? customEventType : type) : (taskType === 'Other' ? customTaskType : taskType),
      location: isSportRelated ? location.trim() : '',
      distance: isSportRelated && distance ? `${distance.trim()} KM` : '',
      has_run: isSportRelated ? hasRun : false,
      distance_run: isSportRelated ? distanceRun : '',
      organization: isSportRelated ? organization.trim() : '',
      is_paid: mode === 'event' ? isPaid : false,
      price: mode === 'event' ? price : '',
      payment_type: mode === 'event' ? paymentType : 'once',
      description: description.trim(),
      is_draft: true
    };

    // Save in drafts list
    const existingDrafts = JSON.parse(localStorage.getItem('my-event-drafts') || '[]');
    const filteredDrafts = existingDrafts.filter(d => d.id !== draftId); // Remove old draft if modifying
    filteredDrafts.push(draftItem);
    localStorage.setItem('my-event-drafts', JSON.stringify(filteredDrafts));

    resetForm();
    setShowDraftConfirm(false);
    onClose();

    // Trigger state reload in app parent
    if (window.refreshDrafts) {
      window.refreshDrafts();
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
      setStartY(e.touches[0].clientY);
    };

    const onTouchMove = (e) => {
      if (!dragState.current.dragging) return;
      if (sheet.scrollTop > 0) {
        dragState.current.startY = e.touches[0].clientY;
        return;
      }
      const deltaY = e.touches[0].clientY - dragState.current.startY;
      if (deltaY > 0) {
        // Only prevent page scroll when dragging downward on the sheet at the top
        e.preventDefault();
        dragState.current.currentDragY = deltaY;
        setDragY(deltaY);
      }
    };

    const onTouchEnd = () => {
      dragState.current.dragging = false;
      setIsDragging(false);
      if (dragState.current.currentDragY > 120) {
        handleCloseRequest();
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

  // Mouse handlers (desktop drag)
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
        handleCloseRequest();
      }
      setDragY(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(mode === 'event' ? 'Event name is required.' : 'Task title is required.');
      return;
    }

    if (mode === 'event') {
      if (!location.trim()) {
        setErrorMsg('Location (or Google Maps link) is required.');
        return;
      }
      if (isPaid && (!price || parseFloat(price) <= 0)) {
        setErrorMsg('Please specify a valid price for paid events.');
        return;
      }
    }

    let hour24 = parseInt(selectedHour);
    if (selectedAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedAmPm === 'AM' && hour24 === 12) hour24 = 0;

    const localDate = new Date(
      selectedYear,
      selectedMonth,
      selectedDay,
      hour24,
      parseInt(selectedMinute)
    );

    if (isNaN(localDate.getTime())) {
      setErrorMsg('Selected date & time is invalid.');
      return;
    }

    let endIso = null;
    if (hasEndDate) {
      let endHour24 = parseInt(selectedEndHour);
      if (selectedEndAmPm === 'PM' && endHour24 !== 12) endHour24 += 12;
      if (selectedEndAmPm === 'AM' && endHour24 === 12) endHour24 = 0;

      const localEndDate = new Date(
        selectedEndYear,
        selectedEndMonth,
        selectedEndDay,
        endHour24,
        parseInt(selectedEndMinute)
      );

      if (isNaN(localEndDate.getTime())) {
        setErrorMsg('Selected end date & time is invalid.');
        return;
      }

      if (localEndDate <= localDate) {
        setErrorMsg('End date & time must be after start date & time.');
        return;
      }

      endIso = localEndDate.toISOString();
    }

    setLoading(true);

    try {
      const itemData = {
        name: name.trim(),
        date: localDate.toISOString(),
        end_date: endIso,
        is_task: mode === 'task',
      };

      if (mode === 'event') {
        const isSportRelated = type === 'Run' || type === 'Sport';
        itemData.type = type === 'Other' ? (customEventType.trim() || 'Other') : type;
        itemData.location = isSportRelated ? location.trim() : '';
        itemData.distance = (isSportRelated && distance) ? `${distance.trim()} KM` : '';
        itemData.has_run = isSportRelated ? hasRun : false;
        itemData.distance_run = (isSportRelated && hasRun) ? parseFloat(distanceRun) || 0 : 0;
        itemData.organization = isSportRelated ? organization.trim() : '';
        itemData.is_paid = isPaid;
        const rawPrice = parseFloat(price);
        itemData.price = isPaid 
          ? (currency === 'KHR' ? rawPrice / 4000 : rawPrice) 
          : 0.00;
        itemData.payment_type = isPaid ? paymentType : 'once';
        itemData.description = description.trim();
      } else {
        itemData.type = taskType === 'Other' ? (customTaskType.trim() || 'Task') : taskType;
        itemData.location = '';
        itemData.distance = '';
        itemData.has_run = false;
        itemData.distance_run = 0;
        itemData.is_paid = false;
        itemData.price = 0.00;
        itemData.payment_type = 'once';
        itemData.is_completed = false;
        itemData.description = description.trim();
      }

      // If we are submitting a draft, pass the draft ID so parent deletes it
      await onCreateEvent(itemData, draftToEdit?.id);
      
      resetForm();
      onClose();
    } catch (error) {
      setErrorMsg(error.message || 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseRequest();
          }
        }}
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

          <div 
            className="modal-header" 
            style={{ 
              justifyContent: 'center', 
              position: 'relative', 
              marginBottom: '16px',
              paddingTop: '8px'
            }}
          >
            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
              {mode === 'event' ? <Calendar size={20} style={{ color: 'var(--accent)' }} /> : <CheckSquare size={20} style={{ color: 'var(--accent)' }} />}
              <span>{draftToEdit ? 'Finish Draft' : (mode === 'event' ? 'Create New Event' : 'Create Task')}</span>
            </h2>
            <button className="icon-btn" onClick={handleCloseRequest} aria-label="Close modal" style={{ position: 'absolute', right: '0' }}>
              <X size={18} />
            </button>
          </div>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          {/* Tab switch button only if forcedMode is NOT defined */}
          {!forcedMode && !draftToEdit && (
            <div className="toggle-selector" style={{ marginBottom: '20px' }}>
              <div 
                className={`toggle-option ${mode === 'event' ? 'active' : ''}`}
                onClick={() => setMode('event')}
              >
                Event
              </div>
              <div 
                className={`toggle-option ${mode === 'task' ? 'active' : ''}`}
                onClick={() => setMode('task')}
              >
                Task
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Title / Name */}
            <div className="input-group">
              <label className="input-label" htmlFor="event-name">
                {mode === 'event' ? 'Event Name' : 'Task Title'}
              </label>
              <input
                id="event-name"
                type="text"
                placeholder={mode === 'event' ? "e.g. Marathon 2026" : "e.g. Buy groceries"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input"
                style={{ textAlign: 'center' }}
                required
                disabled={loading}
              />
            </div>

            {/* Event-specific: Organization Name */}
            {mode === 'event' && (type === 'Run' || type === 'Sport') && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="event-organization">
                  Organization
                </label>
                <input
                  id="event-organization"
                  type="text"
                  placeholder="e.g. Smart Axiata"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Event-specific: Description */}
            {mode === 'event' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="event-description">Event Description</label>
                <textarea
                  id="event-description"
                  placeholder="Enter details about this event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-input"
                  style={{ 
                    height: '80px', 
                    resize: 'none', 
                    padding: '12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Event-specific: Type Selector */}
            {mode === 'event' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
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

            {/* Event-specific: Custom Type Input (shown only if 'Other' is selected) */}
            {mode === 'event' && type === 'Other' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="custom-event-type">Enter Custom Type (Optional)</label>
                <input
                  id="custom-event-type"
                  type="text"
                  placeholder="e.g. Workshop, Concert, Trip"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  disabled={loading}
                />
              </div>
            )}

            {/* Custom Date Picker (Month, Day, Year Select list grid row) */}
            <div className="input-group">
              <label className="input-label">Date</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                
                {/* Month Select Picker */}
                <div className="select-container">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => {
                      const newMonth = parseInt(e.target.value);
                      setSelectedMonth(newMonth);
                      const newDaysInMonth = getDaysInMonth(newMonth, selectedYear);
                      if (selectedDay > newDaysInMonth) {
                        setSelectedDay(newDaysInMonth);
                      }
                    }}
                    className="select-input"
                    disabled={loading}
                  >
                    {months.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Day Select Picker */}
                <div className="select-container">
                  <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="select-input"
                    disabled={loading}
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Year Select Picker */}
                <div className="select-container">
                  <select 
                    value={selectedYear}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      setSelectedYear(newYear);
                      const newDaysInMonth = getDaysInMonth(selectedMonth, newYear);
                      if (selectedDay > newDaysInMonth) {
                        setSelectedDay(newDaysInMonth);
                      }
                    }}
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
              {(() => {
                const d = new Date(selectedYear, selectedMonth, selectedDay);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--accent)',
                    letterSpacing: '0.5px'
                  }}>
                    {dayName}
                  </div>
                );
              })()}
            </div>

            {/* Custom Time Picker (Hour, Minute, AM/PM Segmented control row) */}
            <div className="input-group">
              <label className="input-label">Time</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                
                {/* Hour Select Picker */}
                <div className="select-container" style={{ flex: 1 }}>
                  <select 
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="select-input"
                    disabled={loading}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                      const val = String(h).padStart(2, '0');
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>

                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>:</span>

                {/* Minute Select Picker */}
                <div className="select-container" style={{ flex: 1 }}>
                  <select 
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="select-input"
                    disabled={loading}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(m => {
                      const val = String(m).padStart(2, '0');
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>

                {/* AM/PM toggle button segment */}
                <div className="toggle-selector time-ampm-toggle">
                  <div 
                    className={`toggle-option ${selectedAmPm === 'AM' ? 'active' : ''}`}
                    onClick={() => setSelectedAmPm('AM')}
                  >
                    AM
                  </div>
                  <div 
                    className={`toggle-option ${selectedAmPm === 'PM' ? 'active' : ''}`}
                    onClick={() => setSelectedAmPm('PM')}
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
                  <label className="input-label">End Date</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                    
                    {/* End Month Select Picker */}
                    <div className="select-container">
                      <select 
                        value={selectedEndMonth}
                        onChange={(e) => {
                          const newMonth = parseInt(e.target.value);
                          setSelectedEndMonth(newMonth);
                          const newDaysInMonth = getDaysInMonth(newMonth, selectedEndYear);
                          if (selectedEndDay > newDaysInMonth) {
                            setSelectedEndDay(newDaysInMonth);
                          }
                        }}
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
                        value={selectedEndDay}
                        onChange={(e) => setSelectedEndDay(parseInt(e.target.value))}
                        className="select-input"
                        disabled={loading}
                      >
                        {endDays.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* End Year Select Picker */}
                    <div className="select-container">
                      <select 
                        value={selectedEndYear}
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value);
                          setSelectedEndYear(newYear);
                          const newDaysInMonth = getDaysInMonth(selectedEndMonth, newYear);
                          if (selectedEndDay > newDaysInMonth) {
                            setSelectedEndDay(newDaysInMonth);
                          }
                        }}
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
                  {(() => {
                    const d = new Date(selectedEndYear, selectedEndMonth, selectedEndDay);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    return (
                      <div style={{
                        textAlign: 'center',
                        marginTop: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--accent)',
                        letterSpacing: '0.5px'
                      }}>
                        {dayName}
                      </div>
                    );
                  })()}
                </div>

                {/* Custom End Time Picker (Hour, Minute, AM/PM Segmented control row) */}
                <div className="input-group">
                  <label className="input-label">End Time</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    {/* End Hour Select Picker */}
                    <div className="select-container" style={{ flex: 1 }}>
                      <select 
                        value={selectedEndHour}
                        onChange={(e) => setSelectedEndHour(e.target.value)}
                        className="select-input"
                        disabled={loading}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                          const val = String(h).padStart(2, '0');
                          return <option key={val} value={val}>{val}</option>;
                        })}
                      </select>
                    </div>

                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>:</span>

                    {/* End Minute Select Picker */}
                    <div className="select-container" style={{ flex: 1 }}>
                      <select 
                        value={selectedEndMinute}
                        onChange={(e) => setSelectedEndMinute(e.target.value)}
                        className="select-input"
                        disabled={loading}
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map(m => {
                          const val = String(m).padStart(2, '0');
                          return <option key={val} value={val}>{val}</option>;
                        })}
                      </select>
                    </div>

                    {/* End AM/PM toggle button segment */}
                    <div className="toggle-selector time-ampm-toggle">
                      <div 
                        className={`toggle-option ${selectedEndAmPm === 'AM' ? 'active' : ''}`}
                        onClick={() => setSelectedEndAmPm('AM')}
                      >
                        AM
                      </div>
                      <div 
                        className={`toggle-option ${selectedEndAmPm === 'PM' ? 'active' : ''}`}
                        onClick={() => setSelectedEndAmPm('PM')}
                      >
                        PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event-specific: Location Link */}
            {mode === 'event' && (type === 'Run' || type === 'Sport') && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="event-location">Location / Google Maps Link</label>
                <input
                  id="event-location"
                  type="text"
                  placeholder="Drop Google Maps link or enter address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Event-specific: Distance (KM) */}
            {mode === 'event' && (type === 'Run' || type === 'Sport') && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="event-distance">Distance (KM)</label>
                <input
                  id="event-distance"
                  type="number"
                  step="any"
                  placeholder="e.g. 5, 10"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Event-specific: Joined and Run */}
            {mode === 'event' && (type === 'Run' || type === 'Sport') && (
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', backgroundColor: 'var(--bg-secondary)', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="input-label" style={{ margin: 0, fontWeight: '700' }}>I joined & ran this event</span>
                  <label className="toggle-switch-container">
                    <input
                      type="checkbox"
                      checked={hasRun}
                      onChange={(e) => {
                        setHasRun(e.target.checked);
                        if (!e.target.checked) setDistanceRun('');
                      }}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {hasRun && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', animation: 'fadeIn 0.2s ease-out' }}>
                    <label className="input-label" htmlFor="event-distance-run" style={{ textAlign: 'left', display: 'block' }}>How many Km did you run?</label>
                    <input
                      id="event-distance-run"
                      type="number"
                      step="any"
                      placeholder="Enter actual km run (e.g. 5, 10.2)"
                      value={distanceRun}
                      onChange={(e) => setDistanceRun(e.target.value)}
                      className="text-input"
                      style={{ textAlign: 'center' }}
                      required
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Event-specific: Cost */}
            {mode === 'event' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
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

            {/* Event-specific: Currency and Price field */}
            {mode === 'event' && isPaid && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>Payment Type</label>
                <div className="toggle-selector" style={{ marginBottom: '12px' }}>
                  <div 
                    className={`toggle-option ${paymentType === 'once' ? 'active' : ''}`}
                    onClick={() => setPaymentType('once')}
                  >
                    One-time
                  </div>
                  <div 
                    className={`toggle-option ${paymentType === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPaymentType('monthly')}
                  >
                    Monthly
                  </div>
                </div>

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

                <label className="input-label" htmlFor="event-price">
                  Price ({currency === 'USD' ? '$' : '៛'})
                </label>
                <input
                  id="event-price"
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

            {/* Task-specific: Task Category Selector */}
            {mode === 'task' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>Task Category</label>
                <div className="type-grid">
                  {taskTypes.map(t => (
                    <div
                      key={t.name}
                      className={`type-option ${taskType === t.name ? 'selected' : ''}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setTaskType(t.name)}
                    >
                      <span style={{ color: taskType === t.name ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {t.icon}
                      </span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task-specific: Custom Task Category Input (shown only if 'Other' is selected) */}
            {mode === 'task' && taskType === 'Other' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="custom-task-type">Enter Custom Category</label>
                <input
                  id="custom-task-type"
                  type="text"
                  placeholder="e.g. Shopping, Reading, Study"
                  value={customTaskType}
                  onChange={(e) => setCustomTaskType(e.target.value)}
                  className="text-input"
                  style={{ textAlign: 'center' }}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Task-specific: Description (Notes) */}
            {mode === 'task' && (
              <div className="input-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <label className="input-label" htmlFor="task-description">Task Description (Notes)</label>
                <textarea
                  id="task-description"
                  placeholder="Enter details about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-input"
                  style={{ 
                    height: '80px', 
                    resize: 'none', 
                    padding: '12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCloseRequest} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : mode === 'event' ? 'Create Event' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Beautiful Custom Save as Draft Confirm Modal */}
      {showDraftConfirm && (
        <div className="modal-overlay" style={{ zIndex: 110, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="modal-sheet" style={{ maxWidth: '360px', padding: '24px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Save as Draft?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              You have unsaved changes. Would you like to save this as a draft to finish it later?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
              <button 
                type="button"
                className="btn-danger-outline" 
                style={{ margin: 0 }}
                onClick={() => {
                  setShowDraftConfirm(false);
                  handleDiscard();
                }}
              >
                Discard Changes
              </button>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => setShowDraftConfirm(false)}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
