'use strict'

// @todo replace with dialog directive.
// @todo look into LaunchRequest
// @todo look into setting this up for multiple repos.

const Alexa = require('alexa-sdk')

const createRepoIntent = require('./intents/createRepoIntent')
const createBranchIntent = require('./intents/createBranchIntent')
const mergeBranchesIntent = require('./intents/mergeBranchesIntent')
const closePRIntent = require('./intents/closePRIntent')
const getPRStatusIntent = require('./intents/getPRStatusIntent')
const getPRCountIntent = require('./intents/getPRCountIntent')
const utils = require('./utils')
const Db = require('./db')

const APP_ID = 'amzn1.ask.skill.6eeb8557-5bea-4ae8-b96c-4b5ba3008017'
const HELP_MESSAGE = 'What should I do on your repos?'
const HELP_REPROMPT = 'What should I do on your repos?'
const STOP_MESSAGE = 'Talk to you later.'
const ACCOUNT_NOT_LINKED_MESSAGE = 'You have not linked your account. Please do so to continue.'
const INVALID_REQUEST_MESSAGE = 'Invalid request'
const ERROR_MESSAGE = 'Sorry there was a problem with that request. '

let SLOTS
let accessToken
let userId
let deviceId
let dialogState
let intent


/**
 * WorkFlow
 * 1.  Checks that the access token is valid
 * 2.  Returns github token to use in calls.
 * 3.  Runs the desired function.
 *
 * @param func
 * @param that
 * @returns {Promise.<TResult>}
 */
const doWorkflow = function doWorkflow (func, that) {
  return utils.isValidRequest(accessToken)
    .then(function (isValid) {
      if (isValid == 2) throw Error(ACCOUNT_NOT_LINKED_MESSAGE)
      if (isValid == 3) throw Error(INVALID_REQUEST_MESSAGE)
    })
    .then(function () {
      return Db.getGithubInfo(accessToken)
    })
    .then(function (gitHubInfo) {
      if (!gitHubInfo) throw Error('Invalid Git hub token.')
      return func(SLOTS, accessToken, gitHubInfo, that)
    }.bind(that))
    .catch(function (error) {
      console.log("doWorkFlow Error:", error)
      that.emit(':tell', ERROR_MESSAGE + error.message)
    }.bind(that));
}

exports.handler = function (event, context, callback) {
  console.log('event', event)

  SLOTS = event.request.intent.slots
  accessToken = event.session.user.accessToken || null
  userId = event.context.System.user.userId || null
  deviceId = event.context.System.device.deviceId || null
  dialogState = event.request.dialogState
  intent = event.request.intent

  // Debug
  console.log("slots", SLOTS)
  console.log('user', event.session.user)
  console.log('System.user', event.context.System.user)
  console.log('System.device', event.context.System.device)
  console.log("dialogState", dialogState)
  console.log("intent", intent)

  var alexa = Alexa.handler(event, context)
  alexa.APP_ID = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}

var handlers = {
  'Unhandled': function () {
    this.emit(':tell', HELP_REPROMPT)
  },
  'LaunchRequest': function () {
    this.emit('CreateRepoIntent')
  },
  'CreateRepoIntent': function () {
    return doWorkflow(createRepoIntent, this)
  },
  'CreateBranchIntent': function () {
    return doWorkflow(createBranchIntent, this)
  },
  'MergeBranchesIntent': function () {
    return doWorkflow(mergeBranchesIntent, this)
  },
  'ClosePRIntent': function () {
    return doWorkflow(closePRIntent, this)
  },
  'GetPRStatusIntent': function () {
    return doWorkflow(getPRStatusIntent, this)
  },
  'GetPRCountIntent': function () {
    return doWorkflow(getPRCountIntent, this)
  },
  'AMAZON.HelpIntent': function () {
    const speechOutput = HELP_MESSAGE
    const reprompt = HELP_REPROMPT
    this.emit(':ask', speechOutput, reprompt)
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', STOP_MESSAGE)
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', STOP_MESSAGE)
  }
}