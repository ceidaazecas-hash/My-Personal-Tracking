import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import DailyTab from './components/DailyTab';
import EventsTab from './components/EventsTab';
import SettingsTab from './components/SettingsTab';
import CreateEventModal from './components/CreateEventModal';
import EventDetailModal from './components/EventDetailModal';
import GatekeeperLock from './components/GatekeeperLock';
import { Sun, Moon, Calendar, Clock, Plus, Settings, Lock, RefreshCw } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'events', or 'settings'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('my-event-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });
  
  // Gatekeeper states
  const [isLocked, setIsLocked] = useState(true);
  const [sitePassword, setSitePassword] = useState('mrevent2026'); // Dynamic Supabase site password

  // Logo & Icon states
  const [logo, setLogo] = useState('');
  const [icon, setIcon] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Drafts states
  const [drafts, setDrafts] = useState([]);
  const [draftToEdit, setDraftToEdit] = useState(null);

  // 1. Initial Gatekeeper Lock Check, Load Events & Fetch Site Password
  useEffect(() => {
    fetchSitePassword();
    const expiry = localStorage.getItem('my-event-gatekeeper-expiry');
    if (expiry) {
      if (Date.now() < parseInt(expiry)) {
        setIsLocked(false);
        fetchEvents();
      } else {
        localStorage.removeItem('my-event-gatekeeper-expiry');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSitePassword = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'site_password')
        .maybeSingle();
      if (data && data.value) {
        setSitePassword(data.value);
      }
    } catch (e) {
      console.warn("Could not fetch password from database, using default fallback");
    }
  };

  // 2. Load Custom Logo and Icon & Update Browser Tab Favicon Dynamically
  useEffect(() => {
    const customLogo = localStorage.getItem('my-event-custom-logo');
    const customIcon = localStorage.getItem('my-event-custom-icon');
    
    if (customLogo) setLogo(customLogo);
    if (customIcon) {
      setIcon(customIcon);
      updateFavicon(customIcon);
    } else if (customLogo) {
      updateFavicon(customLogo); // Use logo as fallback icon
    }
  }, []);

  // Helper to dynamically inject custom favicons/apple touch icons in DOM
  const updateFavicon = (hrefData) => {
    if (!hrefData) return;
    
    // Update main favicon
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = hrefData;

    // Update iOS Apple Touch Icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = hrefData;
  };

  // 3. Fetch Events from Supabase Database
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Load Theme from LocalStorage / Prefs & Listen to Device Changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const savedTheme = localStorage.getItem('my-event-theme');
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // 5. Toggle Theme handler
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('my-event-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('my-event-theme', 'light');
    }
  };

  // 6. Gatekeeper Unlock
  const handleUnlock = (expiry) => {
    setIsLocked(false);
    if (expiry) {
      localStorage.setItem('my-event-gatekeeper-expiry', expiry.toString());
    }
    fetchEvents();
  };

  // 7. Manually Lock Site
  const handleLock = () => {
    localStorage.removeItem('my-event-gatekeeper-expiry');
    setIsLocked(true);
    setEvents([]);
  };

  // 8. Settings Modifiers (Save Logo/Icon/Password)
  const handleSaveSettings = async (settings) => {
    if (settings.logo) {
      setLogo(settings.logo);
      localStorage.setItem('my-event-custom-logo', settings.logo);
    }
    if (settings.icon) {
      setIcon(settings.icon);
      localStorage.setItem('my-event-custom-icon', settings.icon);
      updateFavicon(settings.icon);
    } else if (settings.logo) {
      updateFavicon(settings.logo); // Fallback
    }

    if (settings.password) {
      try {
        const { error } = await supabase
          .from('app_settings')
          .upsert({ key: 'site_password', value: settings.password });
        if (error) throw error;
        setSitePassword(settings.password);
      } catch (err) {
        alert('Failed to update password in database: ' + err.message);
      }
    }
  };

  const handleResetSettings = async () => {
    localStorage.removeItem('my-event-custom-logo');
    localStorage.removeItem('my-event-custom-icon');
    setLogo('');
    setIcon('');
    
    let link = document.querySelector("link[rel*='icon']");
    if (link) link.href = "/favicon.ico";
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) appleLink.href = "/apple-touch-icon.png";

    try {
      await supabase
        .from('app_settings')
        .upsert({ key: 'site_password', value: 'mrevent2026' });
      setSitePassword('mrevent2026');
    } catch (e) {
      console.warn("Could not reset password in database:", e);
    }
  };

  // 9. Draft storage handlers
  const fetchDrafts = () => {
    const loadedDrafts = JSON.parse(localStorage.getItem('my-event-drafts') || '[]');
    setDrafts(loadedDrafts);
  };

  useEffect(() => {
    fetchDrafts();
    window.refreshDrafts = fetchDrafts; // Global hook for child components
  }, []);

  const handleDeleteDraft = (draftId) => {
    const existingDrafts = JSON.parse(localStorage.getItem('my-event-drafts') || '[]');
    const filteredDrafts = existingDrafts.filter(d => d.id !== draftId);
    localStorage.setItem('my-event-drafts', JSON.stringify(filteredDrafts));
    fetchDrafts();
  };

  const handleEditDraft = (draft) => {
    setDraftToEdit(draft);
    setIsCreateOpen(true);
  };

  // 10. Create Event / Task CRUD handler
  const handleCreateEvent = async (eventData, draftId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();

      if (error) {
        if (error.message && (error.message.includes('organization') || error.message.includes('column'))) {
          console.warn("Supabase schema cache is missing 'organization' column. Retrying insert without it...");
          const { organization, ...fallbackData } = eventData;
          const { data: retryData, error: retryError } = await supabase
            .from('events')
            .insert([fallbackData])
            .select();
          
          if (retryError) throw retryError;
          if (retryData) {
            setEvents(prev => [...prev, retryData[0]].sort((a, b) => new Date(a.date) - new Date(b.date)));
            if (draftId) {
              handleDeleteDraft(draftId);
            }
            return;
          }
        }
        throw error;
      }
      if (data) {
        setEvents(prev => [...prev, data[0]].sort((a, b) => new Date(a.date) - new Date(b.date)));
        if (draftId) {
          handleDeleteDraft(draftId);
        }
      }
    } catch (error) {
      alert('Error creating item: ' + error.message);
      throw error;
    }
  };

  // 11. Toggle Task Completion CRUD handler
  const handleToggleTaskCompletion = async (taskId, currentCompletedStatus) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_completed: !currentCompletedStatus })
        .eq('id', taskId)
        .select();

      if (error) throw error;
      if (data) {
        setEvents(prev => prev.map(e => e.id === taskId ? data[0] : e));
      }
    } catch (error) {
      alert('Error updating task status: ' + error.message);
    }
  };

  // 12. Delete Event / Task CRUD handler
  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setSelectedEvent(null);
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    }
  };

  // 13. Update Event / Task CRUD handler
  const handleUpdateEvent = async (eventId, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updatedData)
        .eq('id', eventId)
        .select();

      if (error) {
        if (error.message && (error.message.includes('organization') || error.message.includes('column'))) {
          console.warn("Supabase schema cache is missing 'organization' column. Retrying update without it...");
          const { organization, ...fallbackData } = updatedData;
          const { data: retryData, error: retryError } = await supabase
            .from('events')
            .update(fallbackData)
            .eq('id', eventId)
            .select();
          
          if (retryError) throw retryError;
          if (retryData) {
            setEvents(prev => prev.map(e => e.id === eventId ? retryData[0] : e).sort((a, b) => new Date(a.date) - new Date(b.date)));
            setSelectedEvent(retryData[0]);
            return;
          }
        }
        throw error;
      }
      if (data) {
        setEvents(prev => prev.map(e => e.id === eventId ? data[0] : e).sort((a, b) => new Date(a.date) - new Date(b.date)));
        setSelectedEvent(data[0]); // Update details modal state too!
      }
    } catch (error) {
      alert('Error updating item: ' + error.message);
      throw error;
    }
  };

  // 14. Reschedule Task to Today handler (Updates date while keeping original hour/minutes)
  const handleMoveTaskToToday = async (taskId) => {
    try {
      const task = events.find(e => e.id === taskId);
      if (!task) return;

      const originalDate = new Date(task.date);
      const newDate = new Date();
      newDate.setHours(originalDate.getHours());
      newDate.setMinutes(originalDate.getMinutes());
      newDate.setSeconds(originalDate.getSeconds());

      const { data, error } = await supabase
        .from('events')
        .update({ date: newDate.toISOString() })
        .eq('id', taskId)
        .select();

      if (error) throw error;
      if (data) {
        setEvents(prev => prev.map(e => e.id === taskId ? data[0] : e).sort((a, b) => new Date(a.date) - new Date(b.date)));
        if (selectedEvent && selectedEvent.id === taskId) {
          setSelectedEvent(data[0]); // update state in modal if open
        }
      }
    } catch (error) {
      alert('Failed to reschedule task: ' + error.message);
    }
  };

  // Calculate navigations counters
  const getCounts = () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const pendingTasks = events.filter(e => e.is_task && !e.is_completed).length;
    const upcomingEvents = events.filter(e => !e.is_task && new Date(e.date) >= todayStart).length;

    return {
      pendingTasksCount: pendingTasks,
      upcomingEventsCount: upcomingEvents
    };
  };

  const { pendingTasksCount, upcomingEventsCount } = getCounts();

  // Gatekeeper Gate
  if (isLocked) {
    return <GatekeeperLock onUnlock={handleUnlock} logo={logo} sitePassword={sitePassword} />;
  }

  // Render initial loading state
  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Premium Header Nav */}
      <header className="app-header">
        <div className="app-logo-area">
          {logo ? (
            <div className="logo-container" style={{ flexShrink: 0 }}>
              <img src={logo} alt="App Logo" className="app-custom-logo" />
            </div>
          ) : (
            <div className="logo-placeholder" style={{ flexShrink: 0 }} />
          )}
          <span className="app-title-text">My Event</span>
        </div>

        {/* Desktop Navigation links */}
        <div className="header-nav">
          <button 
            className={`header-nav-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <span>Daily</span>
            {pendingTasksCount > 0 && (
              <span className="nav-badge">{pendingTasksCount}</span>
            )}
          </button>
          <button 
            className={`header-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <span>Events</span>
            {upcomingEventsCount > 0 && (
              <span className="nav-badge">{upcomingEventsCount}</span>
            )}
          </button>
          <button 
            className={`header-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span>Settings</span>
          </button>
        </div>

        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={() => window.location.reload()}
            aria-label="Refresh"
            title="Hard Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            className="icon-btn" 
            onClick={handleLock}
            aria-label="Lock Site"
            style={{ color: '#ef4444' }}
          >
            <Lock size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        {activeTab === 'daily' && (
          <DailyTab 
            events={events} 
            onSelectEvent={setSelectedEvent} 
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onMoveTaskToToday={handleMoveTaskToToday}
            drafts={drafts}
            onEditDraft={handleEditDraft}
            onDeleteDraft={handleDeleteDraft}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab 
            events={events} 
            onSelectEvent={setSelectedEvent} 
            drafts={drafts}
            onEditDraft={handleEditDraft}
            onDeleteDraft={handleDeleteDraft}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            logo={logo}
            icon={icon}
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
          />
        )}
      </main>

      {/* Floating Add Action Button */}
      {activeTab !== 'settings' && (
        <button 
          className="add-event-fab"
          onClick={() => setIsCreateOpen(true)}
          aria-label={activeTab === 'daily' ? 'Add Task' : 'Add Event'}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Bottom Nav Bar (Mobile only) */}
      <nav className="app-nav">
        <button 
          className={`nav-tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Clock />
            {pendingTasksCount > 0 && (
              <span className="mobile-nav-badge">{pendingTasksCount}</span>
            )}
          </div>
          <span>Daily</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Calendar />
            {upcomingEventsCount > 0 && (
              <span className="mobile-nav-badge">{upcomingEventsCount}</span>
            )}
          </div>
          <span>Events</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings />
          <span>Settings</span>
        </button>
      </nav>

      {/* Create Event Sheet Modal */}
      <CreateEventModal 
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDraftToEdit(null);
        }}
        onCreateEvent={handleCreateEvent}
        forcedMode={draftToEdit ? (draftToEdit.is_task ? 'task' : 'event') : (activeTab === 'daily' ? 'task' : 'event')}
        draftToEdit={draftToEdit}
      />

      {/* Event Details Sheet Modal */}
      <EventDetailModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDeleteEvent={handleDeleteEvent}
        onUpdateEvent={handleUpdateEvent}
        onMoveTaskToToday={handleMoveTaskToToday}
      />
    </>
  );
}
