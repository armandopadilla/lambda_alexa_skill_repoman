/**
 * Intent: Merge a branch into a base branch.
 *
 */
const utils = require('../utils')
const gitBranches = require('../github/branches')

module.exports = function (slots, accessToken, gitHubInfo, that) {
  const fromBranch = utils.getSlotValue(slots, 'MERGE_FROM_BRANCH_NAME')
  const toBranch = utils.getSlotValue(slots, 'MERGE_TO_BRANCH_NAME')
  const repo = utils.getSlotValue(slots, 'REPO_NAME')

  const dialogState = that.event.request.dialogState
  const updatedIntent = that.event.request.intent

  if (dialogState === 'STARTED') {
    updatedIntent.slots.MERGE_FROM_BRANCH_NAME.value = fromBranch
    updatedIntent.slots.MERGE_TO_BRANCH_NAME.value = toBranch
    updatedIntent.slots.REPO_NAME.value = repo

    that.emit(':delegate', updatedIntent)
  } else if (dialogState !== 'COMPLETED') {
    that.emit(':delegate')
  } else {
    return gitBranches.merge(fromBranch, toBranch, repo, gitHubInfo.gitHubUsername, gitHubInfo.gitHubToken)
      .then(function (data) {
        return that.emit(':tell', 'Branch, '+fromBranch+' merged into '+toBranch+' successfully')
      })
      .catch(function (error) {
        console.log("MergeBranchesIntent Error", error)
        const errorMessage = JSON.parse(error.message).message
        return that.emit(':tell', 'Could not merge '+fromBranch+' into '+toBranch+ ' because '+errorMessage)
      })
  }
}