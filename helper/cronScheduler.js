"use strict";

require("dotenv").config();
const cron = require("node-cron");
const User = require("../models/user");
const moment = require("moment-timezone");
const { SENDMAIL } = require("./sendMail");

exports.userTrack = cron.schedule("0 0 * * * ", async (next) => {
  try {
    console.log(">>>>>>>> Running Cron job >>>>>>>>");
    const currentDate = moment();
    const userData = await User.find();

    const bulkUpdates = [];

    for (const obj of userData) {
      const loginDate = moment(obj.loginDate);
      const userId = obj._id;
      let difference = currentDate.diff(loginDate, "days");
      let data = { difference: difference, userId: userId };
      if (data.difference > process.env.DAY_TO_LOCK_USER) {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: data.userId },
            update: { activeStatus: false },
          },
        });
      } else if (data.difference == process.env.DAY_TO_SEND_EMAIL) {
        SENDMAIL(obj, (mailType = 1));
      }
    }

    if (bulkUpdates.length > 0) {
      await User.bulkWrite(bulkUpdates);
    }
  } catch (err) {
    next(err);
  }
});
