/**
 * Intent: Close a specific PR.
 *
 */

const utils = require('../utils')
const gitPR = require('../github/pullrequests')

module.exports = function (slots, accessToken, gitHubInfo, that) {
  const PRNumber = utils.getSlotValue(slots, 'PR_NUMBER')
  const repo = utils.getSlotValue(slots, 'REPO_NAME')
  const updatedIntent = that.event.request.intent
  const dialogState = that.event.request.dialogState

  if (dialogState === 'STARTED') {
    updatedIntent.slots.PR_NUMBER.value = PRNumber
    updatedIntent.slots.REPO_NAME.value = repo
    that.emit(':delegate', updatedIntent)
  }
  else if (dialogState !== 'COMPLETED') {
    that.emit(':delegate')
  }
  else {
    return gitPR.closePR(PRNumber, repo, gitHubInfo.gitHubUsername, gitHubInfo.gitHubToken)
      .then(function (resp) {
        return that.emit(':tell', 'PR '+PRNumber+' has been closed on repo '+repo)
      })
      .catch(function(error) {
        let response = 'Sorry but I could not close P R '+PRNumber+ ' on repo '+repo+' because '+utils.getErrorMessage(error)
        if (error.code === 404) response = 'Sorry but I could not close P R '+PRNumber+ ' on repo '+repo+' because it does not exist'
        return that.emit(':tell', response)
      })
  }
}