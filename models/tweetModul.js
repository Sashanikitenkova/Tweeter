const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
      title : {
        type: String,
        required: true,
        minlength :[20, "Title should be minimum 25 character "],
        trim: true
      },
      tweet : {
        type: String,
        required: true,
        minlength :[50, "Tweet should be minimum 50 character "],
        trim: true
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    },
  {timestamps: true}
  )

  module.exports = mongoose.model('tweet', tweetSchema);