import { useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useProgress } from '../hooks/useLocalStorage';
import { milestones, weeks } from '../data/onboardingData';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay
} from 'date-fns';
import { de } from 'date-fns/locale';

export default function Calendar() {
  const { progress } = useProgress();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const startDate = progress.startDate ? new Date(progress.startDate) : new Date();

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const startDayOfWeek = getDay(start);
    const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const paddedStart = addDays(start, -paddingDays);
    const allDays = eachDayOfInterval({ start: paddedStart, end: addDays(end, 42 - days.length - paddingDays) });
    
    return allDays.slice(0, 42);
  }, [currentMonth]);

  const getDayInfo = (date) => {
    if (!progress.startDate) return null;
    
    const dayNumber = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (dayNumber < 1 || dayNumber > 90) return null;
    
    const milestone = milestones.find(m => m.day === dayNumber);
    const week = weeks.find(w => {
      const [start, end] = w.days.split('-').map(Number);
      return dayNumber >= start && dayNumber <= end;
    });
    
    const weekTasks = week?.tasks || [];
    const completedTasks = weekTasks.filter(t => progress.tasks[t.id]).length;
    
    return {
      dayNumber,
      milestone,
      week,
      completedTasks,
      totalTasks: weekTasks.length
    };
  };

  const selectedDayInfo = selectedDay ? getDayInfo(selectedDay) : null;

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kalender</h1>
          <p className="text-white/60">Deine Meilensteine und Fortschritt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm text-white/50 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayInfo = getDayInfo(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    aspect-square p-1 rounded-xl transition-all relative
                    ${isCurrentMonth ? 'text-white' : 'text-white/30'}
                    ${isSelected ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'hover:bg-white/10'}
                    ${today ? 'ring-2 ring-amber-500/50' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm ${today ? 'font-bold text-amber-400' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayInfo?.milestone && (
                      <Flag className="w-3 h-3 text-amber-400 mt-0.5" />
                    )}
                    {dayInfo && !dayInfo.milestone && dayInfo.completedTasks > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-0.5" />
                    )}
                  </div>
                  {dayInfo && (
                    <div className="absolute top-0.5 right-0.5 text-[10px] text-white/40">
                      {dayInfo.dayNumber}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 rounded-full ring-2 ring-amber-500/50" />
              Heute
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Flag className="w-3 h-3 text-amber-400" />
              Meilenstein
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              Fortschritt
            </div>
          </div>
        </div>

        {/* Day Details / Milestones */}
        <div className="space-y-4">
          {/* Selected Day Info */}
          {selectedDayInfo ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold">{format(selectedDay, 'dd. MMMM yyyy', { locale: de })}</p>
                  <p className="text-sm text-white/50">Tag {selectedDayInfo.dayNumber} von 90</p>
                </div>
              </div>

              {selectedDayInfo.milestone && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-amber-400">{selectedDayInfo.milestone.title}</span>
                  </div>
                  <p className="text-sm text-white/70">{selectedDayInfo.milestone.description}</p>
                </div>
              )}

              {selectedDayInfo.week && (
                <div>
                  <p className="text-sm text-white/50 mb-2">Woche {selectedDayInfo.week.id}: {selectedDayInfo.week.name}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${(selectedDayInfo.completedTasks / selectedDayInfo.totalTasks) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white/50">
                      {selectedDayInfo.completedTasks}/{selectedDayInfo.totalTasks}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-white/50">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Wähle einen Tag aus</p>
            </div>
          )}

          {/* Upcoming Milestones */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Kommende Meilensteine</h3>
            <div className="space-y-3">
              {milestones.map((milestone, index) => {
                const milestoneDate = addDays(startDate, milestone.day - 1);
                const isPast = milestoneDate < new Date();
                const isUpcoming = !isPast && milestone.day <= (progress.startDate ? Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 14 : 14);

                if (!isUpcoming && !isPast) return null;
                if (isPast && index > 2) return null;

                return (
                  <div 
                    key={milestone.day}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isPast ? 'bg-green-500/10' : 'bg-white/5'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/30 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isPast ? 'text-white/50' : ''}`}>
                        {milestone.title}
                      </p>
                      <p className="text-xs text-white/40">
                        Tag {milestone.day} • {format(milestoneDate, 'dd.MM.', { locale: de })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
