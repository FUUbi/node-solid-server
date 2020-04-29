module.exports = gitInit

const fsUtils = require('../common/fs-utils')

function gitInit (templatePath, gitInitPath) {
  return async function handler (req, res, next) {
    await fsUtils.copyTemplateDir(templatePath, gitInitPath)
    res.status(201)
    res.end()
  }
}

