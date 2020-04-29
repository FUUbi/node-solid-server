module.exports = handler

const error = require('../http-error')
const allow = require('./allow')
const index = require('./index')
const get = require('./get')
const post = require('./post')
const header = require('../header')
const gitHttpBackend = require('git-http-backend/dist/index')

const validateAllow = (maybeError, next, req, res) => {
  if (maybeError) {
    return next(maybeError)
  } else {
    next(req, res)
  }
}

async function handler (req, res, next) {
  const ldp = req.app.locals.ldp
  const projectRoot = ldp.resourceMapper.resolveFilePath()
  const config = gitHttpBackend.defaultConfig('/usr/lib/git-core/git-http-backend', projectRoot)
  const gitBackendHandler = gitHttpBackend.requestHandler(config)

  if (req.url.match(/git-upload-pack$/)) {
    return allow('Read')(req, res, (e) => validateAllow(e, gitBackendHandler, req, res))
  } else if (req.url.match(/git-receive-pack$/)) {
    return allow('Write')(req, res, (e) => validateAllow(e, gitBackendHandler, req, res))
  } else {
    if (req.method === 'GET') {
      return index(req, res,
        () => allow('Read')(req, res,
          (e) => validateAllow(e, () => header.addPermissions(req, res, () =>
            get(req, res)))))
    } else if (req.method === 'POST') {
      return allow('Append')(req, res, (e) => validateAllow(e, post, req, res))
    }
  }

  return next(error(404, 'Unsupported git service. Only GET and POST method are supported.'))
}

