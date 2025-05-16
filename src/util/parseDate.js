export const parseDate = (date) => {
    const now = new Date();
    const parsedDate = new Date(date);

    const minusTime = now.getTime() - parsedDate.getTime();
    if (minusTime < MINUTE) {
        return "방금 전"
    } else if (minusTime < MINUTE * 5) {
        return "5분 전"
    } else if (minusTime < HOUR) {
        return "1시간 전"
    } else if (minusTime < DAY) {
        return parsedDate.toDateString()
    } else {
        return parsedDate.toLocaleDateString()
    }
}

const SECOND = 1000 * 60
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24