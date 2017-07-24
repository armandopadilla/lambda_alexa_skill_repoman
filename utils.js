const Db = require('./db')

/**
 * Return specific variable from passes in slot
 *
 * @param slots
 * @param slotId
 */
module.exports.getSlotValue = function getSlotValue(slots, slotId) {
  console.log('utils.getSlotValue.slots', slots)
  return slots[slotId].value
}


/**
 * Fetch the error message from the AWS response.
 *
 * @param err
 */
module.exports.getErrorMessage = function getErrorMessage(err) {
  return JSON.parse(err.message).message
}


/**
 * Main validator. Checks - access token.
 *
 * Error Codes
 * 2 = User has not linked account.
 * 3 = Invalid request.
 *
 * @param that
 * @param accessToken
 * @param clientId
 * @returns {number}
 */
module.exports.isValidRequest = function isValidRequest(accessToken) {
    if (!accessToken) return Promise.resolve(2)

    // Check if the accessToken is present in the db.
    return Db.findUserByAccessToken(accessToken)
    .then(function(user) {
      if (!user) return Promise.resolve(3)
      return Promise.resolve(true)
    })
}

