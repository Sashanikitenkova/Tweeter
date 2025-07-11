const tweetModul = require('../models/tweetModul');
const userModul = require('../models/userModul');

const dashboard = (req, res) => {
  tweetModul.find()
    .sort({ createdAt: -1 })
    .populate('author', 'firstName _id')
    .then(result => {
      const userId = res.locals.userId;

      const userTweetCount = result.filter(tweet => {
        return tweet.author && tweet.author._id.toString() === userId.toString();
      }).length;

      res.render('user-dashboard', { 
        title: 'User dashboard', 
        tweets: result, 
        errorMessage: null,
        userId: userId, 
        username: res.locals.username,
        tweetCount: userTweetCount 
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Could not load posts. Please try again later.'
      });
    });
};

const addTweetPage = (req, res) => {
  res.render('addTweetPage', { title: 'Add Tweet', errorMessage: '' });
};

const addTweetForm = (req, res) => {
  const { title: tweetTitle, tweet: tweetText } = req.body;
  const userId = res.locals.userId;
  console.log(userId);

  if (!tweetTitle || tweetTitle.trim().length < 20) {
    return res.render('addTweetPage', {
      title: 'Add Tweet',
      errorMessage: 'Title must be at least 20 characters long.',
      username: res.locals.username,
      userId,
    });
  }

  if (!tweetText || tweetText.trim().length < 50) {
    return res.render('addTweetPage', {
      title: 'Add Tweet',
      errorMessage: 'Tweet must be at least 50 characters long.',
      username: res.locals.username,
      userId,
    });
  }

  const newTweet = new tweetModul({
    title: tweetTitle.trim(),
    tweet: tweetText.trim(),
    author: userId,
  });

  newTweet.save()
    .then(savedTweet => userModul.findById(userId))
    .then(user => {
      if (!user) return res.status(404).send('User not found');
      user.tweets.push(newTweet._id);
      return user.save();
    })
    .then(() => res.redirect('/tweet'))
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
};

const showTweet = (req, res) => {
  const tweetId = req.params.id;
  
  tweetModul.findById(tweetId)
       .then(result => {
         res.render('tweet', { title: 'Tweet', tweet: result, errorMessage: null });
       })
       .catch(err => {
          console.log(arr);
          res.status(500).render('error', {
            title: 'Error',
            message: 'Could not load tweet. Please try again later.'
          });
        })
};

const deleteTweet = async (req, res) => {
  const tweetId = req.params.id;

  try {
    const tweet = await tweetModul.findById(tweetId);

    if (!tweet) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Tweet not found.'
      });
    }

    await tweetModul.findByIdAndDelete(tweetId);

    await userModul.findByIdAndUpdate(tweet.author, {
      $pull: { tweets: tweetId }
    });

    res.redirect('/tweet');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Could not delete tweet. Please try again later.'
    });
  }
};

const editTweetPage = (req, res) => {
  const tweetId = req.params.id;

  tweetModul.findById(tweetId)
    .then(result => {
      if (!result) {
        return res.status(404).render('error', {
          title: 'Error',
          message: 'Tweet not found.'
        });
      }

      res.render('editTweet', {
        title: 'Edit Tweet',
        tweet: result,
        errorMessage: null,
        username: res.locals.username,
        userId: res.locals.userId
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Could not load tweet for editing.'
      });
    });
};

const editTweetForm = (req, res) => {
  const { title: tweetTitle, tweet: tweetText } = req.body;
  const tweetId = req.params.id;

  if (!tweetTitle || tweetTitle.trim().length < 20) {
    return res.render('editTweet', {
      title: 'Edit Tweet',
      errorMessage: 'Title must be at least 20 characters long.',
      tweet: { _id: tweetId, title: tweetTitle, tweet: tweetText }
    });
  }

  if (!tweetText || tweetText.trim().length < 50) {
    return res.render('editTweet', {
      title: 'Edit Tweet',
      errorMessage: 'Tweet must be at least 50 characters long.',
      tweet: { _id: tweetId, title: tweetTitle, tweet: tweetText }
    });
  }

  tweetModul.findByIdAndUpdate(
    tweetId,
    {
      title: tweetTitle.trim(),
      tweet: tweetText.trim(),
      updatedAt: new Date()
    },
    { new: true }
  )
  .then(() => {
    res.redirect('/tweet');
  })
  .catch(err => {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Could not update post. Please try again later.'
    });
  });
};

const notFoundPage = (req,res) => {
  res.send('404, Page not found');
}

 module.exports = { 
  dashboard,
  addTweetPage,
  addTweetForm,
  showTweet,
  deleteTweet,
  editTweetPage,
  editTweetForm,
  notFoundPage,
};
