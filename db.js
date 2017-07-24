const AWS = require('aws-sdk')

const DB_TABLE_NAME = 'Repoman_Users'

const DynamoDB = new AWS.DynamoDB()


/**
 * Fetch the user's github token and username.
 *
 * @param accessToken
 * @returns {Promise.<TResult>}
 */
module.exports.getGithubInfo = function (accessToken) {
  return DynamoDB.scan({
    TableName: DB_TABLE_NAME,
    FilterExpression: 'accessToken = :accessToken',
    ExpressionAttributeValues: {
      ':accessToken': { 'S' : accessToken },
    }
  }).promise()
    .then(function (results) {
      const gitHubToken =  results.Items[0].githubToken.S
      const gitHubUsername = results.Items[0].githubUsername.S

      return { gitHubToken, gitHubUsername }
    })
}


/**
 * Find a user by a AWS provided access token.
 *
 * @param accessToken
 * @returns {Promise.<TResult>}
 */
module.exports.findUserByAccessToken = function (accessToken) {
  return DynamoDB.scan({
    TableName: DB_TABLE_NAME,
    FilterExpression: 'accessToken = :accessToken',
    ExpressionAttributeValues: {
      ':accessToken': { 'S' : accessToken },
    }
  }).promise()
    .then(function (results) {
      return results.Items[0]
    })
}