import dayjs from "dayjs";


function diffTime (start: Date, end: Date): number {
  return dayjs(end).diff(dayjs(start), 'second');
}

function formatTime (time: number): string {
  return dayjs(time * 1000).format('HH:mm:ss');
}


export {
    diffTime,
    formatTime,
    };