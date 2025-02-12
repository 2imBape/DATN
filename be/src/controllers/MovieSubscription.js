import Movie from "../models/Movie.js";
import MovieSubscription from "../models/MovieSubscription.js";
import Notification from "../models/Notification.js";
import { sendEmailNotification } from "../utils/sendVerificationEmail.js";
import moment from "moment-timezone";

const checkAndUpdateMovieStatus = async () => {
  try {
    const movies = await Movie.find({ status: "Sắp ra mắt" });

    const currentDate = moment().startOf("second");

    for (let movie of movies) {
      const expirationDate = moment(movie.releaseDate).startOf("second");

      if (expirationDate.isSameOrBefore(currentDate)) {
        movie.status = "Đã xuất bản";
        movie.releaseDate = null;
        await movie.save();

        const users = await getUsersSubscribedToMovie(movie._id);
        if (users.length > 0) {
          const validUsers = users.filter((user) => user.email);
          if (validUsers.length === 0) {
            console.warn(`Không có email hợp lệ cho phim "${movie.name}".`);
            continue;
          }

          const subject = `Phim "${movie.name}" đã được phát hành!`;
          const message = `Chào bạn, phim "${movie.name}" đã được phát hành. Bạn có thể xem phim ngay bây giờ!`;

          await Promise.all(
            validUsers.map((user) =>
              sendEmailNotification(user.email, subject, message)
            )
          );
        }

        await MovieSubscription.deleteMany({ movie: movie._id });
        console.log(
          `Phim "${movie.name}" đã được cập nhật và thông báo đã được gửi.`
        );
      }
      const secondsDifference = expirationDate.diff(currentDate, "seconds");

      // Kiểm tra nếu còn 5 ngày nữa
      if (secondsDifference === 5 * 24 * 60 * 60) {
        const users = await getUsersSubscribedToMovie(movie._id);
        if (!users || users.length === 0) {
          console.warn(
            `Không tìm thấy người dùng nào đăng ký phim "${movie.name}".`
          );
          continue;
        }

        const validUsers = users.filter((user) => user.email);
        if (validUsers.length === 0) {
          console.warn(`Không có email hợp lệ cho phim "${movie.name}".`);
          continue;
        }

        await Promise.all(
          validUsers.map((user) =>
            Notification.create({
              userId: user._id,
              title: `Phim "${movie.name}" sắp được phát hành!`,
              message: `Chỉ còn 5 ngày nữa, phim "${movie.name}" sẽ được phát hành. Hãy chuẩn bị sẵn sàng để xem phim nhé!`,
              type: "reminder",
            })
          )
        );

        console.log(`Thông báo nhắc nhở đã được gửi cho phim "${movie.name}".`);
      }
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra và cập nhật trạng thái phim:", error);
  }
};

const getUsersSubscribedToMovie = async (movieId) => {
  try {
    const subscriptions = await MovieSubscription.find({ movie: movieId });

    const users = subscriptions.map((sub) => sub.user);
    return users;
  } catch (error) {
    console.error("Lỗi khi lấy người dùng đã đăng ký:", error);
    return [];
  }
};
// check 5 ngày trước khi đến lịch xuất bản để cho vào thông báo

export default checkAndUpdateMovieStatus;
