/**
 * Intent: Count the number of PRs in a repo.
 *
 */
const utils = require('../utils')
const gitPR = require('../github/pullrequests')

const ERROR_MESSAGE = 'There was a problem while requesting info from Git hub. '

module.exports = function (slots, accessToken, gitHubInfo, that) {
  const PRStatus = utils.getSlotValue(slots, 'PR_STATUS') || 'all'
  const repoName = utils.getSlotValue(slots, 'REPO_NAME')
  const updatedIntent = that.event.request.intent
  const dialogState = that.event.request.dialogState

  // Confirm the repo name
  if (dialogState === 'STARTED') {
    updatedIntent.slots.REPO_NAME.value = repoName
    that.emit(':delegate', updatedIntent)
  }
  // If user did not agree to what Alexa said, let the user name the repo.
  else if (dialogState !== 'COMPLETED') {
    that.emit(':delegate')
  }
  // Everything looks ok...get the count.
  else {
    return gitPR.countPrs(PRStatus, repoName, gitHubInfo.gitHubUsername, gitHubInfo.gitHubToken)
      .then(function (total) {
        let response = 'There are ' + total + ' ' + PRStatus + ' pull requests in repo '+repoName+'.'
        if (PRStatus === 'all') response = 'There are ' + total + ' pull requests in repo '+repoName+'.'
        that.emit(':tell', response)
      })
      .catch(function (error) {
        console.log("GetPRCountIntent Error ", error)
        return that.emit(':tell', ERROR_MESSAGE + utils.getErrorMessage(error))
      })
  }
}