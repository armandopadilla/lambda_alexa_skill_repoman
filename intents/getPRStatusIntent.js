/**
 * Intent: Get the status of a specific PR.
 *
 */
const utils = require('../utils')
const gitPR = require('../github/pullrequests')

const ERROR_MESSAGE = 'There seems to be an issue. '

module.exports = function (slots, accessToken, gitHubInfo, that) {
  const PRNumber = utils.getSlotValue(slots, 'PR_NUMBER')
  const repo = utils.getSlotValue(slots, 'REPO_NAME')
  const updatedIntent = that.event.request.intent
  const dialogState = that.event.request.dialogState

  if (dialogState === 'STARTED') {
    updatedIntent.slots.REPO_NAME.value = repo
    updatedIntent.slots.PR_NUMBER.value = PRNumber

    that.emit(':delegate', updatedIntent)
  }
  else if (dialogState !== 'COMPLETED') {
    that.emit(':delegate')
  }
  else {
    return gitPR.getPRStatus(PRNumber, repo, gitHubInfo.gitHubUsername, gitHubInfo.gitHubToken)
      .then(function(status) {
        that.emit(':tell', 'P R '+PRNumber+' is currently '+status)
      })
      .catch(function (error) {
        console.log("GetPRStatusIntent Error ", error)

        let response = ERROR_MESSAGE+utils.getErrorMessage(error)
        if (error.code === 404) response = 'PR '+PRNumber+ ' does not exist on repo '+repo
        return that.emit(':tell', response)
      })
  }
}