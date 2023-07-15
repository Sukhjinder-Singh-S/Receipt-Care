require("dotenv").config();
const cron = require("node-cron");
const User = require("../models/user");
const moment = require("moment-timezone");

exports.userTrack = cron.schedule("0 0 * * * ", async (next) => {
  try {
    console.log(">>>>>>>> Running Cron job >>>>>>>>");
    const currentDate = moment();
    // console.log(currentDate.format("YYYY-MM-DD"));
    const userData = await User.find();
    userData.map(async (obj) => {
      const loginDate = moment(obj.loginDate);
      // console.log(loginDate.format("YYYY-MM-DD"));
      const userId = obj._id;
      let difference = currentDate.diff(loginDate, "days");
      let data = { difference: difference, userId: userId };
      if (data.difference > process.env.DAY_TO_LOCK_USER) {
        await User.findByIdAndUpdate(data.userId, { activeStatus: false });
      }
      console.log(data);
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});
