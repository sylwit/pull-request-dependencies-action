import * as core from '@actions/core'
import * as github from '@actions/github'

export async function listLabels(
  octokit,
  owner: string,
  repo: string,
  issue_number: number
) {
  return await octokit.issues.listLabelsOnIssue({
    owner,
    repo,
    issue_number
  })
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('token')

    const octokit = github.getOctokit(token)
    const context = github.context

    if (!context.payload.pull_request) {
      core.setFailed('This action can only be run on pull request events.')
      return
    }

    const { owner, repo } = context.repo
    const prNumber = context.payload.pull_request.number
    core.info(`PR Number: ${prNumber}`)
    if (!prNumber) {
      core.setFailed('No PR number found.')
      return
    }

    const labels = await listLabels(octokit, owner, repo, prNumber)
    core.info(`Labels: ${labels}`)

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
