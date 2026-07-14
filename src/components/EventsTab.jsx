import { useState } from 'react';
import { Search, Calendar, MapPin, Inbox, Users, Clock, Trash2 } from 'lucide-react';
import { Activity, Trophy, Briefcase, Gift, Sparkles } from 'lucide-react';

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
        const eventDate = new Date(e.date);
        return eventDate >= todayStart && eventDate < todayEnd;
      });
    } else if (activeStatusTab === 'Upcoming') {
      result = result.filter(e => new Date(e.date) >= todayEnd);
    } else if (activeStatusTab === 'Past') {
      result = result.filter(e => new Date(e.date) < todayStart);
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
      const d = new Date(e.date);
      return d >= todayStart && d < todayEnd;
    }).length;

    const upcomingCount = baseEvents.filter(e => new Date(e.date) >= todayEnd).length;
    const pastCount = baseEvents.filter(e => new Date(e.date) < todayStart).length;

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
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="events-tab-container">
      
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
                              <span>{formatDate(event.date)}</span>
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
                              <span>{formatDate(event.date)}</span>
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
                          </div>
                        </div>
                        <div className="price-tag free">
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
                            <span>{formatDate(event.date)}</span>
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
