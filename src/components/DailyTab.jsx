import { useState } from 'react';
import { ListTodo, CheckCircle2, Circle, Clock, AlertCircle, Inbox, Calendar, Trash2 } from 'lucide-react';

export default function DailyTab({ events, onSelectEvent, onToggleTaskCompletion, onMoveTaskToToday, drafts = [], onEditDraft, onDeleteDraft }) {
  // State to track active sub-navigation tab
  const [activeTaskTab, setActiveTaskTab] = useState('Today');

  // Filter only Tasks
  const getTasks = () => {
    return events.filter(item => item.is_task);
  };

  const tasks = getTasks();
  const taskDrafts = drafts.filter(item => item.is_task);

  // Today boundary helper
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Group tasks by statuses
  const allTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const todayTasks = tasks
    .filter(task => {
      const startD = new Date(task.date);
      const endD = task.end_date ? new Date(task.end_date) : null;
      const spansToday = startD < todayEnd && (endD ? endD >= todayStart : startD >= todayStart);
      return spansToday && !task.is_completed;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const completedTasksHistory = tasks
    .filter(task => task.is_completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Show most recent first

  const pastUncompletedTasks = tasks
    .filter(task => {
      const startD = new Date(task.date);
      const endD = task.end_date ? new Date(task.end_date) : null;
      const isPast = endD ? endD < todayStart : startD < todayStart;
      return isPast && !task.is_completed;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Show most recent first

  // Format today's header date
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTaskDateRange = (taskItem) => {
    const startD = new Date(taskItem.date);
    const hasEnd = !!taskItem.end_date;
    const endD = hasEnd ? new Date(taskItem.end_date) : null;

    const startFormattedTime = formatTime(taskItem.date);
    const startFormattedDate = formatDate(taskItem.date);

    if (!hasEnd) {
      return `${startFormattedTime}`;
    }

    const startDayStr = startD.toDateString();
    const endDayStr = endD.toDateString();
    const isSameDay = startDayStr === endDayStr;

    const endFormattedTime = formatTime(taskItem.end_date);

    if (isSameDay) {
      return `${startFormattedTime} - ${endFormattedTime}`;
    }

    const endFormattedDate = formatDate(taskItem.end_date);
    return `${startFormattedDate} ${startFormattedTime} to ${endFormattedDate} ${endFormattedTime}`;
  };

  return (
    <div className="daily-container">
      {/* Header */}
      <div className="daily-header" style={{ textAlign: 'center' }}>
        <div className="daily-day-name" style={{ letterSpacing: '2px' }}>Today's Planner</div>
        <div className="daily-date-large">{todayDateStr}</div>
      </div>

      {/* Task Status Sub-Navigation Bar (Scrollable chips prevents squishing & text clipping) */}
      <div 
        className="category-filters center-on-desktop" 
        style={{ 
          paddingBottom: '4px'
        }}
      >
        {[
          { id: 'All', name: 'All Tasks', count: allTasks.length },
          { id: 'Today', name: "Today's Tasks", count: todayTasks.length },
          { id: 'Completed', name: 'Completed Tasks', count: completedTasksHistory.length },
          { id: 'Not Completed', name: 'Not Completed', count: pastUncompletedTasks.length },
          { id: 'Drafts', name: 'Drafts', count: taskDrafts.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTaskTab(tab.id)}
            className={`filter-chip ${activeTaskTab === tab.id ? 'active' : ''}`}
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
                backgroundColor: activeTaskTab === tab.id ? 'var(--bg-secondary)' : 'var(--border)',
                color: activeTaskTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- RENDER CURRENT ACTIVE SUB-TAB LIST --- */}
      
      {/* 1. ALL TASKS TAB */}
      {activeTaskTab === 'All' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h3 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
            <ListTodo size={18} style={{ color: 'var(--accent)' }} />
            <span>All Tasks</span>
            <span className="event-count">{allTasks.length}</span>
          </h3>

          {allTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '64px 32px' }}>
              <div className="empty-icon"><Inbox size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">No Tasks Created</div>
              <div className="empty-text">Tap the "+" button to add your very first task.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`event-card ${task.is_completed ? 'completed' : ''}`}
                  style={{ 
                    padding: '14px 18px', 
                    opacity: task.is_completed ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => onToggleTaskCompletion(task.id, task.is_completed)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: task.is_completed ? 'var(--accent)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={22} style={{ fill: 'var(--accent-glow)', color: 'var(--accent)' }} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  <div 
                    className="event-card-details" 
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onClick={() => onSelectEvent(task)}
                  >
                    <span className="event-type-label" style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      color: task.is_completed ? 'var(--text-secondary)' : 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1px',
                      display: 'block'
                    }}>
                      {task.type || 'Task'}
                    </span>
                    <div 
                      className="event-card-name" 
                      style={{ 
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        color: task.is_completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}
                    >
                      {task.name}
                    </div>
                    {task.description && (
                      <div 
                        style={{ 
                          fontSize: '13px', 
                          color: 'var(--text-secondary)', 
                          marginTop: '2px',
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.description}
                      </div>
                    )}
                    <div className="meta-item" style={{ fontSize: '11px', marginTop: '4px', color: task.is_completed ? 'var(--text-secondary)' : 'var(--accent)', fontWeight: '600' }}>
                      <Clock size={12} />
                      <span>{formatDate(task.date)} at {formatTime(task.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* 2. TODAY'S TASKS TAB */}
      {activeTaskTab === 'Today' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h3 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
            <ListTodo size={18} style={{ color: 'var(--accent)' }} />
            <span>Today's Tasks</span>
            <span className="event-count">{todayTasks.length}</span>
          </h3>

          {todayTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 16px', borderRadius: 'var(--radius-lg)' }}>
              <div className="empty-icon"><ListTodo size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">All Done!</div>
              <div className="empty-text">No pending tasks for today. Tap the "+" button to add a new task.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayTasks.map(task => (
                <div 
                  key={task.id} 
                  className="event-card"
                  style={{ 
                    padding: '14px 18px', 
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => onToggleTaskCompletion(task.id, task.is_completed)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Circle size={22} />
                  </button>

                  <div 
                    className="event-card-details" 
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onClick={() => onSelectEvent(task)}
                  >
                    <span className="event-type-label" style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1px',
                      display: 'block'
                    }}>
                      {task.type || 'Task'}
                    </span>
                    <div className="event-card-name" style={{ color: 'var(--text-primary)' }}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {task.description}
                      </div>
                    )}
                    <div className="meta-item" style={{ fontSize: '11px', marginTop: '4px', color: 'var(--accent)', fontWeight: '600' }}>
                      <Clock size={12} />
                      <span>{renderTaskDateRange(task)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. COMPLETED TASKS TAB */}
      {activeTaskTab === 'Completed' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h3 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
            <span>Completed Tasks</span>
            <span className="event-count">{completedTasksHistory.length}</span>
          </h3>

          {completedTasksHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '64px 32px' }}>
              <div className="empty-icon"><Inbox size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">No Completed Tasks</div>
              <div className="empty-text">Complete tasks from your checklist to see them logs here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {completedTasksHistory.map(task => (
                <div 
                  key={task.id} 
                  className="event-card completed"
                  style={{ 
                    padding: '14px 18px', 
                    opacity: 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => onToggleTaskCompletion(task.id, task.is_completed)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle2 size={22} style={{ fill: 'var(--accent-glow)', color: 'var(--accent)' }} />
                  </button>

                  <div 
                    className="event-card-details" 
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onClick={() => onSelectEvent(task)}
                  >
                    <span className="event-type-label" style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1px',
                      display: 'block'
                    }}>
                      {task.type || 'Task'}
                    </span>
                    <div className="event-card-name" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', textDecoration: 'line-through' }}>
                        {task.description}
                      </div>
                    )}
                    <div className="meta-item" style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      <Clock size={12} />
                      <span>{formatDate(task.date)} at {renderTaskDateRange(task)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. NOT COMPLETED TASKS TAB */}
      {activeTaskTab === 'Not Completed' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h3 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px', color: '#f59e0b' }}>
            <AlertCircle size={18} />
            <span>Not Completed Tasks</span>
            <span className="event-count" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              {pastUncompletedTasks.length}
            </span>
          </h3>

          {pastUncompletedTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '64px 32px' }}>
              <div className="empty-icon"><CheckCircle2 size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">All Caught Up!</div>
              <div className="empty-text">No overdue or uncompleted tasks from previous days.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pastUncompletedTasks.map(task => (
                <div 
                  key={task.id} 
                  className="event-card"
                  style={{ 
                    padding: '14px 18px', 
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button 
                    onClick={() => onToggleTaskCompletion(task.id, task.is_completed)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Circle size={22} style={{ color: '#f59e0b' }} />
                  </button>

                  <div 
                    className="event-card-details" 
                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                    onClick={() => onSelectEvent(task)}
                  >
                    <span className="event-type-label" style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      color: '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1px',
                      display: 'block'
                    }}>
                      {task.type || 'Task'}
                    </span>
                    <div className="event-card-name" style={{ color: 'var(--text-primary)' }}>
                      {task.name}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {task.description}
                      </div>
                    )}
                    <div className="meta-item" style={{ fontSize: '11px', marginTop: '4px', color: '#f59e0b', fontWeight: '600' }}>
                      <Clock size={12} />
                      <span>Overdue: {formatDate(task.date)} at {renderTaskDateRange(task)}</span>
                    </div>
                  </div>

                  {/* Re-add uncompleted task to Today */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTaskToToday(task.id);
                    }}
                    className="btn-secondary"
                    style={{ 
                      marginLeft: 'auto', 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #f59e0b',
                      color: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.05)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      margin: 0
                    }}
                  >
                    <Calendar size={12} />
                    <span>Today</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. DRAFTS TAB */}
      {activeTaskTab === 'Drafts' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h3 className="section-title" style={{ justifyContent: 'center', gap: '8px', marginTop: '0', marginBottom: '8px' }}>
            <ListTodo size={18} style={{ color: 'var(--text-secondary)' }} />
            <span>Task Drafts</span>
            <span className="event-count" style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {taskDrafts.length}
            </span>
          </h3>

          {taskDrafts.length === 0 ? (
            <div className="empty-state" style={{ padding: '64px 32px' }}>
              <div className="empty-icon"><Inbox size={32} style={{ color: 'var(--text-secondary)' }} /></div>
              <div className="empty-title">No Drafts Stored</div>
              <div className="empty-text">Unfinished tasks will show up here if you save them as drafts.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {taskDrafts.map(draft => (
                <div 
                  key={draft.id} 
                  className="event-card"
                  style={{ 
                    padding: '14px 18px', 
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => onEditDraft(draft)}
                >
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
                      {draft.type || 'Task'} (Draft)
                    </span>
                    <div className="event-card-name" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {draft.name}
                    </div>
                    {draft.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {draft.description}
                      </div>
                    )}
                    <div className="meta-item" style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      <Clock size={12} />
                      <span>Saved: {formatDate(draft.date)} at {formatTime(draft.date)}</span>
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
      )}

    </div>
  );
}
