/***
 * Handles all branch specific functionality.
 *
 */

var github = require('../conn')

module.exports = {

  /**
   * Create a new branch.
   *
   * @param branchName
   * @param baseBranch
   * @param cb
   */
  create: function(branchName, baseBranch, repo, owner, gitHubToken) {
    return new Promise(function (resolve, reject) {
      return github(gitHubToken).repos.getBranch({
        owner,
        branch: baseBranch,
        repo: repo
      }, function(err, data) {
        if (err) return reject(err)
        const sha = data.data.commit.sha

        if (!sha) return reject(new Error("Commit SHA not found."))

        // Create the branch
        return github(gitHubToken).gitdata.createReference({
          ref: 'refs/heads/'+branchName,
          sha,
          owner,
          repo
        }, function (err, data) {
          if (err) return reject(err)
          return resolve(data)
        })
      })
    })
  },

  /**
   * Merge a a branch into another branch.
   * @param fromBranch
   * @param toBranch
   * @param cb
   */
  merge: function(fromBranch, toBranch, repo, owner, gitHubToken) {
    return new Promise(function (resolve, reject) {
      return github(gitHubToken).repos.merge({
        owner,
        repo,
        base: toBranch,
        head: fromBranch
      }, function(err, resp) {
        if (err) return reject(err)
        return resolve(resp)
      })
    })
  }
}