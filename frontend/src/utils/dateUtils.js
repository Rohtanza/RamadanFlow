// Simple date utilities
export const getCurrentDate = () => {
  return new Date();
};

export const formatDate = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

export const isToday = (dateString) => {
  const today = formatDate();
  return formatDate(new Date(dateString)) === today;
};

export const getNDaysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}; 