export const parseDate = (date) => {
    const now = new Date();

    const minusTime = now.getTime() - date.getTime();
    if (minusTime < MINUTE) {
        return "방금 전"
    } else if (minusTime < MINUTE * 5) {
        return "5분 전"
    } else if (minusTime < HOUR) {
        return "1시간 전"
    } else if (minusTime < DAY) {
        return date.getHours() + " : " + date.getMinutes() + " : " + date.getSeconds()
    } else {
        return date.getFullYear() + '.' + date.getMonth() + '.' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
    }
}

const SECOND = 1000 * 60
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24