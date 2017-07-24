/**
 * Intent: Create a new branch inside a repo.
 *
 */
const utils = require('../utils')
const gitBranches = require('../github/branches')

module.exports = function(slots, accessToken, gitHubInfo, that) {
  const branchName =  utils.getSlotValue(slots, 'BRANCH_NAME')
  const baseBranchName = utils.getSlotValue(slots, 'BASE_BRANCH_NAME')
  const repoName = utils.getSlotValue(slots, 'REPO_NAME')


  const dialogState = that.event.request.dialogState
  const updatedIntent = that.event.request.intent

  if (dialogState === 'STARTED') {
    updatedIntent.slots.BRANCH_NAME.value = branchName
    updatedIntent.slots.BASE_BRANCH_NAME.value = baseBranchName
    updatedIntent.slots.REPO_NAME.value = repoName

    that.emit(':delegate')

  } else if (dialogState !== 'COMPLETED') {
    console.log("setting updated Intent")
    that.emit(':delegate', updatedIntent)
  } else {
    console.log("branchName", branchName)
    console.log("baseBranchName", baseBranchName)
    console.log('reponame: ', repoName)

    return gitBranches.create(branchName, baseBranchName, repoName, gitHubInfo.gitHubUsername, gitHubInfo.gitHubToken)
      .then(function () {
        return that.emit(':tell', 'Branch, '+branchName+' created successfully')
      })
      .catch(function (error) {
        const errorMessage = JSON.parse(error.message).message
        return that.emit(':tell', 'Could not create the branch '+branchName+' because '+errorMessage)
      })
  }
}