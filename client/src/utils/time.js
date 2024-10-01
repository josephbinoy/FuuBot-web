export function timeAgo(timestamp) {
    const dateString = new Date(timestamp * 1000).toISOString();
    const createdDate = new Date(dateString);
    const now = Date.now();
    const diffInMs = now - createdDate.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} year${years == 1 ? '' : 's'} ago`;
    } else if (months > 0) {
        return `${months} month${months == 1 ? '' : 's'} ago`;
    } else if (days > 0) {
        return `${days} day${days == 1 ? '' : 's'} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours == 1 ? '' : 's'} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes == 1 ? '' : 's'} ago`;
    } else {
        return `${seconds} second${seconds == 1 ? '' : 's'} ago`;
    }
}

export function getYesterdayDate() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const options = { day: '2-digit', month: 'long', timeZone: 'UTC' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(yesterday);

    return formattedDate;
}