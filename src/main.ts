import * as core from '@actions/core'
import * as github from '@actions/github'

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

    // Fetch the labels on the PR and filter directly in the mapping process
    const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: prNumber
    })

    // Filter labels that start with "depends_on:" during iteration
    const dependsOnLabels = labels.reduce<string[]>((filtered, label) => {
      if (label.name.startsWith('depends_on:')) {
        filtered.push(label.name)
      }
      return filtered
    }, [])

    // Log the filtered labels
    if (dependsOnLabels.length > 0) {
      core.info(
        `Labels starting with "depends_on:": ${dependsOnLabels.join(', ')}`
      )
    } else {
      core.info('No labels starting with "depends_on:" found on this PR.')
    }

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
