const gulp = require('gulp')
const git = require('gulp-git')
const fs = require('fs')
const { execSync } = require('child_process')

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
          try {
            json.thulemeier = readGitInfo('-C ../thulemeier log -n 1 --pretty="%ai%n%an%n%s%n%H%n"')
            json.thulemeier.branch = execSync('git -C ../thulemeier rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
          } catch (thulemeierErr) {
            json.thulemeier = null
          }
          fs.writeFile(file, JSON.stringify(json, null, 2), function () {
            console.log(json, 'fertig')
          })
        }
      )
    }
  )
}

gulp.task('gitlog', gitlog('dist/version.json'))
gulp.task('gitlogdev', gitlog('public/version.json'))
