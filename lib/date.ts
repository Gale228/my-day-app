const RU_MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayKey = () => formatDateKey(new Date());

export const formatLongDate = (date = new Date()) =>
  new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

export const formatShortDate = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export const monthTitle = (date: Date) =>
  `${RU_MONTHS[date.getMonth()]} ${date.getFullYear()}`;

export const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const mondayIndex = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayIndex + last.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - mondayIndex + 1;
    const cellDate = new Date(year, month, dayOffset);
    return {
      date: cellDate,
      key: formatDateKey(cellDate),
      isCurrentMonth: cellDate.getMonth() === month,
    };
  });
};
