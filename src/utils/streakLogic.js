import { format, subDays, parseISO, differenceInCalendarDays, isToday, isYesterday } from 'date-fns';

export const formatDate = (date) => format(date, 'yyyy-MM-dd');

export const getLast12Days = (offset = 0) => {
  const days = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    days.push(subDays(today, i + offset * 12));
  }
  return days;
};

export const calculateStreaks = (logs, habitId) => {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId)
    .map((l) => l.date)
    .sort();

  if (habitLogs.length === 0) return { current: 0, longest: 0, total: 0 };

  const total = habitLogs.length;

  // Longest streak
  let longest = 1;
  let tempLongest = 1;
  for (let i = 1; i < habitLogs.length; i++) {
    const prev = parseISO(habitLogs[i - 1]);
    const curr = parseISO(habitLogs[i]);
    if (differenceInCalendarDays(curr, prev) === 1) {
      tempLongest++;
      longest = Math.max(longest, tempLongest);
    } else if (differenceInCalendarDays(curr, prev) > 1) {
      tempLongest = 1;
    }
  }

  // Current streak — count backwards from today (or yesterday)
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(subDays(today, 1));
  const lastLog = habitLogs[habitLogs.length - 1];

  let current = 0;
  if (lastLog === todayStr || lastLog === yesterdayStr) {
    current = 1;
    for (let i = habitLogs.length - 2; i >= 0; i--) {
      const next = parseISO(habitLogs[i + 1]);
      const curr = parseISO(habitLogs[i]);
      if (differenceInCalendarDays(next, curr) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, longest, total };
};

export const isLoggedOnDate = (logs, habitId, dateStr) => {
  return logs.some((l) => l.habitId === habitId && l.date === dateStr);
};
