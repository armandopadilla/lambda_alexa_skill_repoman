/**
 * Handles all repo specific functionality.
 *
 */
const github = require('../conn')

module.exports = {

  /**
   * Create a new repo.
   *
   * @param name
   * @param privacy
   * @return Promise
   */
  create: (name, privacy, gitHubToken) => {
    return new Promise(function (resolve, reject) {
      //default to public
      var private = false
      if (privacy === 'private') private = true
      return github(gitHubToken).repos.create({ name, private }, function (err, data) {
        if (err) return reject(err)
        return resolve(data)
      });
    })
  }
}