import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatUpdatedAt(date: string) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function formatUpdatedAtRelative(date: string) {
  return dayjs(date).fromNow();
}
