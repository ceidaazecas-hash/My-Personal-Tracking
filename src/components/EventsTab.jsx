import { useState } from 'react';
import { Search, Calendar, MapPin, Inbox, Users, Clock, Trash2 } from 'lucide-react';
import { Activity, Trophy, Briefcase, Gift, Sparkles } from 'lucide-react';

const ShoesIcon = ({ size = 20, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <path d="M3 18h16.2c1 0 1.9-.7 2.1-1.7l1.5-7.3h-4.3l-2.5 3.5h-6l-2-4.5H2v6c0 2.2 1.8 4 4 4z" />
    <path d="M11 8l1.5 2" />
    <path d="M12.5 7l1.5 2" />
    <path d="M7 14c3-3 8-3 10 0" />
  </svg>
);

export default function EventsTab({ events, onSelectEvent, drafts = [], onEditDraft, onDeleteDraft }) {
  // States for search and categories
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatusTab, setActiveStatusTab] = useState('All');

  // Filter out Tasks (Events Tab shows only events)
  const getOnlyEvents = () => {
    return events.filter(item => !item.is_task);
  };

  const onlyEvents = getOnlyEvents();
  const eventDrafts = drafts.filter(item => !item.is_task);
  const now = new Date();

  // Get monthly stats (current calendar month & year)
  const getMonthlyStats = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    // Filter only events (no tasks) belonging to the current month & year
    const monthlyEvents = events.filter(item => {
      if (item.is_task) return false;
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const totalEventsCount = monthlyEvents.length;

    // Count events joined & run
    const eventsJoinedCount = monthlyEvents.filter(item => item.has_run).length;

    // Sum monthly km run (from distance_run column)
    const totalKmRun = monthlyEvents.reduce((sum, item) => {
      if (item.has_run && item.distance_run) {
        return sum + parseFloat(item.distance_run);
      }
      return sum;
    }, 0);

    return {
      totalEventsCount,
      eventsJoinedCount,
      totalKmRun
    };
  };

  const { totalEventsCount, eventsJoinedCount, totalKmRun } = getMonthlyStats();

  // Helper to format currency pricing USD <-> KHR for read-only modals
  const formatPrice = (priceUSD) => {
    const usd = Number(priceUSD);
    const khr = usd * 4000;
    return `$${usd.toFixed(2)} / ${khr.toLocaleString()}៛`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventCardDateRange = (eventItem) => {
    const startD = new Date(eventItem.date);
    const hasEnd = !!eventItem.end_date;
    const endD = hasEnd ? new Date(eventItem.end_date) : null;

    const startFormatted = startD.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + startD.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (!hasEnd) {
      return startFormatted;
    }

    const startDayStr = startD.toDateString();
    const endDayStr = endD.toDateString();
    const isSameDay = startDayStr === endDayStr;

    if (isSameDay) {
      const endFormattedTime = endD.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${startFormatted} - ${endFormattedTime}`;
    }

    const endFormatted = endD.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + endD.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${startFormatted} to ${endFormatted}`;
  };

  // Get dynamic categories list
  const getCategories = () => {
    const cats = new Set();
    onlyEvents.forEach(e => {
      if (e.type) cats.add(e.type);
    });
    return ['All', ...Array.from(cats)];
  };

  const categories = getCategories();

  // Filter events based on active category, search query and status tab
  const getFilteredEvents = () => {
    let result = [...onlyEvents];

    // 1. Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(e => e.type === activeCategory);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.organization && e.organization.toLowerCase().includes(q))
      );
    }

    // 3. Filter by active status tab
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    if (activeStatusTab === 'Today') {
      result = result.filter(e => {
        const startD = new Date(e.date);
        const endD = e.end_date ? new Date(e.end_date) : null;
        return startD < todayEnd && (endD ? endD >= todayStart : startD >= todayStart);
      });
    } else if (activeStatusTab === 'Upcoming') {
      result = result.filter(e => new Date(e.date) >= todayEnd);
    } else if (activeStatusTab === 'Past') {
      result = result.filter(e => {
        const startD = new Date(e.date);
        const endD = e.end_date ? new Date(e.end_date) : null;
        return endD ? endD < todayStart : startD < todayStart;
      });
    }

    return result;
  };

  const getIconForType = (typeStr) => {
    switch (typeStr) {
      case 'Run': return <Activity size={20} style={{ color: 'var(--accent)' }} />;
      case 'Sport': return <Trophy size={20} style={{ color: 'var(--accent)' }} />;
      case 'Meeting': return <Briefcase size={20} style={{ color: 'var(--accent)' }} />;
      case 'Birthday': return <Gift size={20} style={{ color: 'var(--accent)' }} />;
      case 'Festival': return <Sparkles size={20} style={{ color: 'var(--accent)' }} />;
      default: return <Calendar size={20} style={{ color: 'var(--accent)' }} />;
    }
  };

  // Get status tab count values dynamically (based on category + search filters)
  const getStatusTabCounts = () => {
    let baseEvents = [...onlyEvents];
    
    // Apply active category filter
    if (activeCategory !== 'All') {
      baseEvents = baseEvents.filter(e => e.type === activeCategory);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      baseEvents = baseEvents.filter(e => 
        e.name.toLowerCase().includes(q) || 
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.organization && e.organization.toLowerCase().includes(q))
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todayCount = baseEvents.filter(e => {
      const startD = new Date(e.date);
      const endD = e.end_date ? new Date(e.end_date) : null;
      return startD < todayEnd && (endD ? endD >= todayStart : startD >= todayStart);
    }).length;

    const upcomingCount = baseEvents.filter(e => new Date(e.date) >= todayEnd).length;
    const pastCount = baseEvents.filter(e => {
      const startD = new Date(e.date);
      const endD = e.end_date ? new Date(e.end_date) : null;
      return endD ? endD < todayStart : startD < todayStart;
    }).length;

    return {
      todayCount,
      upcomingCount,
      pastCount
    };
  };

  const { todayCount, upcomingCount, pastCount } = getStatusTabCounts();
  const allCount = onlyEvents.length;

  const statusTabs = [
    { id: 'All', name: 'All Events', count: allCount },
    { id: 'Today', name: 'Today', count: todayCount },
    { id: 'Upcoming', name: 'Upcoming', count: upcomingCount },
    { id: 'Past', name: 'Past', count: pastCount },
    { id: 'Drafts', name: 'Drafts', count: eventDrafts.length }
  ];

  const filteredEvents = getFilteredEvents();

  // Helper to split them if in 'All' view, otherwise show single list
  const upcomingEvents = filteredEvents.filter(e => {
    const endD = e.end_date ? new Date(e.end_date) : new Date(e.date);
    return endD >= now;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = filteredEvents.filter(e => {
    const endD = e.end_date ? new Date(e.end_date) : new Date(e.date);
    return endD < now;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="events-tab-container">
      
      {/* Monthly Summary Statistics Grid */}
      <div className="monthly-stats-card" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        marginBottom: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          textAlign: 'center'
        }}>
          {/* Total Events */}
          <div style={{ borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>{totalEventsCount}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Total Events</div>
          </div>
          {/* Events Run */}
          <div style={{ borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>{eventsJoinedCount}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Event Joined</div>
          </div>
          {/* Total Km Run */}
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent)' }}>
              {totalKmRun.toFixed(1).replace(/\.0$/, '')} km
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Total Km Run</div>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="search-filter-section" style={{ gap: '12px' }}>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ textAlign: 'center' }}
          />
        </div>

        {/* Category filters */}
        <div className="category-filters center-on-desktop" style={{ paddingBottom: '4px' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Event Status Navigation Bar */}
      <div 
        className="category-filters center-on-desktop" 
        style={{ 
          paddingBottom: '4px'
        }}
      >
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            className={`filter-chip ${activeStatusTab === tab.id ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <span>{tab.name}</span>
            {tab.count > 0 && (
              <span className="event-count" style={{ 
                fontSize: '10px', 
                padding: '1px 6px',
                backgroundColor: activeStatusTab === tab.id ? 'var(--bg-secondary)' : 'var(--border)',
                color: activeStatusTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Render Lists */}
      {activeStatusTab === 'Drafts' ? (
        /* --- DRAFTS SECTION --- */
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h2 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
            <span>Event Drafts</span>
            <span className="event-count" style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {eventDrafts.length}
            </span>
          </h2>

          {eventDrafts.length === 0 ? (
            <div className="empty-state" style={{ padding: '64px 32px' }}>
              <div className="empty-icon"><Inbox size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">No Drafts Stored</div>
              <div className="empty-text">Unfinished events will show up here if you save them as drafts.</div>
            </div>
          ) : (
            <div className="events-list">
              {eventDrafts.map(draft => (
                <div 
                  key={draft.id} 
                  className="event-card"
                  style={{ borderLeft: '4px dashed var(--text-secondary)', cursor: 'pointer' }}
                  onClick={() => onEditDraft(draft)}
                >
                  <div className="event-card-type-icon">
                    {getIconForType(draft.type)}
                  </div>
                  <div className="event-card-details" style={{ flex: 1 }}>
                    <span className="event-type-label" style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1px',
                      display: 'block'
                    }}>
                      {draft.type} (Draft)
                    </span>
                    <div className="event-card-name" style={{ fontWeight: 'bold' }}>{draft.name}</div>
                    <div className="event-card-meta">
                      <span className="meta-item">
                        <Calendar size={12} />
                        <span>{formatDate(draft.date)}</span>
                      </span>
                      {draft.location && (
                        <span className="meta-item" style={{ marginTop: '2px' }}>
                          <MapPin size={12} />
                          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {draft.location.includes('http') ? 'Google Maps' : draft.location}
                          </span>
                        </span>
                      )}
                      {draft.distance && (
                        <span className="meta-item" style={{ marginTop: '2px' }}>
                          <ShoesIcon size={12} />
                          <span>{draft.distance}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Discard Draft Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to discard this draft?')) {
                        onDeleteDraft(draft.id);
                      }
                    }}
                    className="icon-btn"
                    style={{ 
                      marginLeft: 'auto', 
                      color: '#ef4444',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label="Delete draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state" style={{ padding: '64px 32px' }}>
          <div className="empty-icon"><Inbox size={32} style={{ color: 'var(--text-secondary)' }} /></div>
          <div className="empty-title">No Events Found</div>
          <div className="empty-text">No events match your selected filters. Tap the "+" button to add an event.</div>
        </div>
      ) : (
        <>
          {/* If 'All' is selected, show separated sections. Otherwise, show flat list for the specific tab */}
          {activeStatusTab === 'All' ? (
            <>
              {/* Upcoming Events Subsection */}
              {upcomingEvents.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h2 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
                    <span>Upcoming Events</span>
                    <span className="event-count">{upcomingEvents.length}</span>
                  </h2>
                  <div className="events-list">
                    {upcomingEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="event-card"
                        onClick={() => onSelectEvent(event)}
                      >
                        <div className="event-card-type-icon">
                          {getIconForType(event.type)}
                        </div>
                        <div className="event-card-details">
                          <span className="event-type-label" style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: 'var(--accent)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '1px',
                            display: 'block'
                          }}>
                            {event.type}
                          </span>
                          <div className="event-card-name">{event.name}</div>
                          <div className="event-card-meta">
                            <span className="meta-item">
                              <Calendar size={12} style={{ color: 'var(--accent)' }} />
                              <span>{renderEventCardDateRange(event)}</span>
                            </span>
                            {event.organization && (
                              <span className="meta-item" style={{ marginTop: '2px' }}>
                                <Users size={12} style={{ color: 'var(--accent)' }} />
                                <span>{event.organization}</span>
                              </span>
                            )}
                            <span className="meta-item" style={{ marginTop: '2px' }}>
                              <MapPin size={12} style={{ color: 'var(--accent)' }} />
                              <span>{event.location.includes('http') ? 'Google Maps' : event.location}</span>
                            </span>
                            {event.distance && (
                              <span className="meta-item" style={{ marginTop: '2px' }}>
                                <ShoesIcon size={12} style={{ color: 'var(--accent)' }} />
                                <span>{event.distance}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`price-tag ${event.is_paid ? '' : 'free'}`}>
                          {event.is_paid ? (
                            <>
                              <div className="price-usd">${Number(event.price).toFixed(2)}{event.payment_type === 'monthly' ? '/mo' : ''}</div>
                              <div className="price-khr" style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>
                                {(Number(event.price) * 4000).toLocaleString()}៛{event.payment_type === 'monthly' ? '/mo' : ''}
                              </div>
                            </>
                          ) : (
                            'Free'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events Subsection */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
                    <span>Past Events</span>
                    <span className="event-count">{pastEvents.length}</span>
                  </h2>
                  <div className="events-list">
                    {pastEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="event-card"
                        style={{ opacity: 0.7 }}
                        onClick={() => onSelectEvent(event)}
                      >
                        <div className="event-card-type-icon" style={{ filter: 'grayscale(1)' }}>
                          {getIconForType(event.type)}
                        </div>
                        <div className="event-card-details">
                          <span className="event-type-label" style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '1px',
                            display: 'block'
                          }}>
                            {event.type}
                          </span>
                          <div className="event-card-name" style={{ textDecoration: 'line-through' }}>{event.name}</div>
                          <div className="event-card-meta">
                            <span className="meta-item">
                              <Calendar size={12} />
                              <span>{renderEventCardDateRange(event)}</span>
                            </span>
                            {event.organization && (
                              <span className="meta-item" style={{ marginTop: '2px' }}>
                                <Users size={12} />
                                <span>{event.organization}</span>
                              </span>
                            )}
                            <span className="meta-item" style={{ marginTop: '2px' }}>
                              <MapPin size={12} />
                              <span>{event.location ? (event.location.includes('http') ? 'Google Maps' : event.location) : 'No Location'}</span>
                            </span>
                            {event.distance && (
                              <span className="meta-item" style={{ marginTop: '2px' }}>
                                <ShoesIcon size={12} />
                                <span>{event.distance}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`price-tag ${event.is_paid ? '' : 'free'}`}>
                          {event.is_paid ? (
                            <>
                              <div className="price-usd">${Number(event.price).toFixed(2)}{event.payment_type === 'monthly' ? '/mo' : ''}</div>
                              <div className="price-khr" style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>
                                {(Number(event.price) * 4000).toLocaleString()}៛{event.payment_type === 'monthly' ? '/mo' : ''}
                              </div>
                            </>
                          ) : (
                            'Free'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Flat List for specific status tab (Today, Upcoming, or Past)
            <div>
              <h2 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
                <span>{activeStatusTab} Events</span>
                <span className="event-count">{filteredEvents.length}</span>
              </h2>
              <div className="events-list">
                {filteredEvents.map(event => {
                  const isPast = new Date(event.date) < now;
                  return (
                    <div 
                      key={event.id} 
                      className="event-card"
                      style={{ opacity: isPast ? 0.7 : 1 }}
                      onClick={() => onSelectEvent(event)}
                    >
                      <div className="event-card-type-icon" style={{ filter: isPast ? 'grayscale(1)' : 'none' }}>
                        {getIconForType(event.type)}
                      </div>
                      <div className="event-card-details">
                        <span className="event-type-label" style={{ 
                          fontSize: '10px', 
                          fontWeight: '800', 
                          color: isPast ? 'var(--text-secondary)' : 'var(--accent)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '1px',
                          display: 'block'
                        }}>
                          {event.type}
                        </span>
                        <div className="event-card-name" style={{ textDecoration: isPast ? 'line-through' : 'none' }}>
                          {event.name}
                        </div>
                        <div className="event-card-meta">
                          <span className="meta-item">
                            {isPast ? <Clock size={12} /> : <Calendar size={12} style={{ color: 'var(--accent)' }} />}
                            <span>{renderEventCardDateRange(event)}</span>
                          </span>
                          {event.organization && (
                            <span className="meta-item" style={{ marginTop: '2px' }}>
                              <Users size={12} style={{ color: isPast ? 'var(--text-secondary)' : 'var(--accent)' }} />
                              <span>{event.organization}</span>
                            </span>
                          )}
                          <span className="meta-item" style={{ marginTop: '2px' }}>
                            <MapPin size={12} style={{ color: isPast ? 'var(--text-secondary)' : 'var(--accent)' }} />
                            <span>{event.location ? (event.location.includes('http') ? 'Google Maps' : event.location) : 'No Location'}</span>
                          </span>
                          {event.distance && (
                            <span className="meta-item" style={{ marginTop: '2px' }}>
                              <ShoesIcon size={12} style={{ color: isPast ? 'var(--text-secondary)' : 'var(--accent)' }} />
                              <span>{event.distance}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`price-tag ${event.is_paid ? '' : 'free'}`}>
                        {event.is_paid ? (
                          <>
                            <div className="price-usd">${Number(event.price).toFixed(2)}</div>
                            <div className="price-khr" style={{ fontSize: '10px', opacity: 0.8, fontWeight: '500' }}>
                              {(Number(event.price) * 4000).toLocaleString()}៛
                            </div>
                          </>
                        ) : (
                          'Free'
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
