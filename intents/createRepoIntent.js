/**
 * Intent: Create a new repo
 *
 */

const utils = require('../utils')
const gitRepos = require('../github/repos')

module.exports = function(slots, accessToken, gitHubInfo, that) {
  var repoName = utils.getSlotValue(slots, 'REPO_NAME')
  var privacy = utils.getSlotValue(slots, 'REPO_PRIVACY_SETTING') || 'public'
  const updatedIntent = that.event.request.intent
  const dialogState = that.event.request.dialogState


  if (dialogState === 'STARTED') {
    updatedIntent.slots.REPO_NAME.value = repoName
    updatedIntent.slots.REPO_PRIVACY_SETTING.value = privacy

    that.emit(':delegate', updatedIntent)
  } else if (dialogState !== 'COMPLETED') {
    that.emit(':delegate')
  } else {
    repoName  = repoName
      .replace(' underscore ', '_')
      .replace(' dash ', '-')
      .replace(' hyphen ', '-')
      .replace(' forward slash ', '/')

    return gitRepos.create(repoName, privacy, gitHubInfo.gitHubToken)
      .then(function (resp) {
        if (resp.meta.status === '201 Created') {
          return that.emit(':tell', 'I created '+privacy+' repo '+repoName+ ' successfully.')
        }

        return that.emit(':tell', 'Something went wrong')
      })
      .catch(function (error) {
          const errorMessages = JSON.parse(error.message)
          const errorDetails = errorMessages.errors[0].message
          return that.emit(':tell', 'Could not create the '+privacy+ ' repo '+repoName+' because '+errorDetails)
        }
      )
  }
}