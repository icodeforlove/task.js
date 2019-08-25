"use strict";

module.exports = function generateTaskFactoryMethod(defaults, WorkerProxy, WorkerManager) {
  return function ($config, WorkerProxyOverride) {
    var config = {}; // clone defaults

    Object.keys(defaults).forEach(function (key) {
      return config[key] = defaults[key];
    }); // apply user settings

    Object.keys($config).forEach(function (key) {
      return config[key] = $config[key];
    });
    return new WorkerManager(config, WorkerProxyOverride || WorkerProxy);
  };
};