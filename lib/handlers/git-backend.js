module.exports = handler

const allow = require('./allow')
const gitInit = require('./git-init')
const gitHttpBackend = require('git-http-backend/dist/index')

const validateAllow = (maybeError, insertHandler, req, res, next) => {
  if (maybeError) {
    return next(maybeError)
  } else {
    return insertHandler(req, res, next)
  }
}

async function handler (req, res, next) {
  const ldp = req.app.locals.ldp
  const projectRoot = ldp.resourceMapper.resolveFilePath(req.hostname)
  const config = gitHttpBackend.defaultConfig('/usr/lib/git-core/git-http-backend', projectRoot)
  const gitBackendHandler = gitHttpBackend.requestHandler(config)

  if (req.url.match(/git-upload-pack$/)) {
    return allow('Read')(req, res, (e) => validateAllow(e, gitBackendHandler, req, res, next))
  } else if (req.url.match(/git-receive-pack$/)) {
    return allow('Write')(req, res, (e) => validateAllow(e, gitBackendHandler, req, res, next))
  } else {
    return next()
  }
}

