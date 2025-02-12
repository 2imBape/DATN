import moment from "moment";

export const formatTime = (date: string) => {
  const duration = moment.duration(moment().diff(moment(date)));
  if (duration.asSeconds() < 60) {
    return `${Math.floor(duration.asSeconds())} giây trước`;
  } else if (duration.asMinutes() < 60) {
    return `${Math.floor(duration.asMinutes())} phút trước`;
  } else if (duration.asHours() < 24) {
    return `${Math.floor(duration.asHours())} giờ trước`;
  } else if (duration.asDays() < 7) {
    return `${Math.floor(duration.asDays())} ngày trước`;
  } else if (duration.asWeeks() < 4) {
    return `${Math.floor(duration.asWeeks())} tuần trước`;
  } else if (duration.asMonths() < 12) {
    return `${Math.floor(duration.asMonths())} tháng trước`;
  } else {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }
};

const getGreeting = () => {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 0 && hours < 12) {
    return `Chào buổi sáng`;
  } else if (hours >= 12 && hours < 18) {
    return `Chào buổi chiều`;
  } else {
    return `Chào buổi tối`;
  }
};

export default getGreeting;
