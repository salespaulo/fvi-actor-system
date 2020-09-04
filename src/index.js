'use strict'

const comedy = require('comedy')
const utils = require('fvi-node-utils')

const getLoggerConfig = loggerConfig => {
    if (loggerConfig.actors) {
        return { categories: loggerConfig.actors }
    }

    const levelConverted =
        loggerConfig.level === 'fatal'
            ? 'error'
            : loggerConfig.level === 'trace'
            ? 'debug'
            : loggerConfig.level

    const level = utils.string.capitalize(levelConverted) || 'Info'

    return { categories: { Default: level } }
}

const system = loggerConfig => {
    if (!loggerConfig) {
        return comedy()
    }

    const cfg = {
        loggerConfig: getLoggerConfig(loggerConfig),
    }

    return comedy(cfg)
}

module.exports = system
