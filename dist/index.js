'use strict';

var comedy = require('comedy');

var utils = require('fvi-node-utils');

var getLoggerConfig = function getLoggerConfig(loggerConfig) {
  if (loggerConfig.actors) {
    return {
      categories: loggerConfig.actors
    };
  }

  var levelConverted = loggerConfig.level === 'fatal' ? 'error' : loggerConfig.level === 'trace' ? 'debug' : loggerConfig.level;
  var level = utils.string.capitalize(levelConverted) || 'Info';
  return {
    categories: {
      Default: level
    }
  };
};

var system = function system(loggerConfig) {
  if (!loggerConfig) {
    return comedy();
  }

  var cfg = {
    loggerConfig: getLoggerConfig(loggerConfig)
  };
  return comedy(cfg);
};

module.exports = system;