import * as core from '@actions/core'
import * as github from '@actions/github'

import { wait } from './wait.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const token = core.getInput('token')

    const octokit = github.getOctokit(token)
    const context = github.context

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    const checkRun = await octokit.rest.checks.create({
      ...context.repo,
      name: 'My Custom Check',
      head_sha: context.sha,
      status: 'completed',
      conclusion: 'success',
      output: {
        title: 'Check Run Results',
        summary: 'This is a custom check run created by our action.'
      }
    })

    core.info(`Check run created with ID: ${checkRun.data.id}`)
    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
