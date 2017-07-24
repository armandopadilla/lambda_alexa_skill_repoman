/**
 * Handles all PR specific functionality.
 *
 */

var github = require('../conn')

module.exports = {

  /**
   * Get the count of PRS.
   * Can be filtered by status.
   *
   * @param status
   * @param cb
   */
  countPrs: function (state, repo, owner, gitHubToken) {
    return new Promise(function (resolve, reject) {
      return github(gitHubToken).pullRequests.getAll({
        owner,
        repo,
        state,
        per_page: 100
      }, function(err, resp) {
        if (err) return reject(err)
        return resolve(resp.data.length)
      })
    })
  },


  /**
   * Fetch the status of a PR.
   *
   * @param number
   * @param cb
   */
  getPRStatus: function (number, repo, owner, gitHubToken) {
    return new Promise(function(resolve, reject) {
      return github(gitHubToken).pullRequests.get({
        owner,
        repo,
        number
      }, function(err, resp) {
        if (err) return reject(err)

        const state = (resp.data) ? resp.data.state : null
        return resolve(state)
      })
    })
  },


  /**
   * Close a specific PR.
   *
   * @param number
   * @param cb
   */
  closePR: function (number, repo, owner, gitHubToken) {
    return new Promise(function (resolve, reject) {
      return github(gitHubToken).pullRequests.update({
        owner,
        repo,
        number,
        state: 'closed'
      }, function(err, resp) {
        if (err) return reject(err)
        return resolve(resp)
      })
    })
  }
}