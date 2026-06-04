const gulp = require('gulp')
const git = require('gulp-git')
const fs = require('fs')
const { execSync } = require('child_process')
const { Octokit } = require('@octokit/rest')

const readGitInfo = args => {
  const stdout = execSync(`git ${args}`, { encoding: 'utf8' })
  const v = stdout.split('\n')

  return {
    version: stdout,
    date: v[0],
    author: v[1],
    subject: v[2],
    commit: v[3]
  }
}

const readGitHubInfo = async (owner, repo, ref) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined
  })
  const commitResp = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref
  })
  const branchResp = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch: ref
  })
  const commit = commitResp.data

  return {
    version: [
      commit.commit.author?.date || '',
      commit.commit.author?.name || '',
      commit.commit.message || '',
      commit.sha || '',
      ''
    ].join('\n'),
    date: commit.commit.author?.date || '',
    author: commit.commit.author?.name || '',
    subject: commit.commit.message || '',
    commit: commit.sha || '',
    branch: branchResp.data.name || ref,
    html_url: commit.html_url
  }
}

const readThulemeierInfo = async () => {
  try {
    const info = readGitInfo('-C ../thulemeier log -n 1 --pretty="%ai%n%an%n%s%n%H%n"')
    info.branch = execSync('git -C ../thulemeier rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    return info
  } catch (localErr) {
    try {
      return await readGitHubInfo('BeethovensWerkstatt', 'thulemeier', 'dev')
    } catch (githubErr) {
      return null
    }
  }
}

const gitlog = file => async function () {
  const json = {}
  git.exec(
    {
      args: 'log -n 1 --pretty="%ai%n%an%n%s%n%H%n"',
      log: false
    },
    function (err, stdout) {
      if (err) throw err
      // store in config/version.json
      json.version = stdout
      const v = json.version.split('\n')
      json.date = v[0]
      json.author = v[1]
      json.subject = v[2]
      json.commit = v[3]
      git.exec(
        {
          args: 'rev-parse --abbrev-ref HEAD',
          log: false
        },
        function (err, stdout) {
          if (err) throw err
          json.branch = stdout.trim()
          readThulemeierInfo().then(thulemeier => {
            json.thulemeier = thulemeier
            fs.writeFile(file, JSON.stringify(json, null, 2), function () {
              console.log(json, 'fertig')
            })
          })
        }
      )
    }
  )
}

gulp.task('gitlog', gitlog('dist/version.json'))
gulp.task('gitlogdev', gitlog('public/version.json'))
