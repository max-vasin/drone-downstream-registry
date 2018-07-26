module.exports = (storage) => {
  return {
    createPackageEntry: (name, version, repositories, success, failure, server) => {
      storage.setEntry(name, version, {
        package: name,
        version: version,
        repositories,
        builds: {},
        handlers: {
          success: Object.assign({}, success, { server }),
          failure: Object.assign({}, failure, { server }),
          executedHandler: ''
        }
      });
    },
    registerDownstreamBuild: (name, version, repo, status, number) => {
      const entry = storage.getEntry(name, version);
      entry.builds[repo] = { status, number };
      storage.setEntry(name, version, entry);
    },
    currentPackageStatus: (name, version, log) => {
      const entry = storage.getEntry(name, version);

      const buildsMap = {};

      entry.repositories.forEach((repo) => buildsMap[repo] = 'waiting');
      Object.keys(entry.builds).forEach((repo) => {
        buildsMap[repo] = entry.builds[repo].status;
      });

      const priority = [
        'failure',
        'waiting',
        'success'
      ];

      if (log)
        log.info(`Current downstream repositories statuses:`);

      return Object.keys(buildsMap).reduce((result, repo) => {
        const status = buildsMap[repo];
        if (log)
          log.info(`\t${repo}:${status}`);
        if (priority.indexOf(result) < priority.indexOf(status))
          return result;
        return status;
      }, 'success');
    },
    getHandlers: (name, version) => {
      return storage.getEntry(name, version).handlers;
    },
    registerHandlerExecution: (name, version, status) => {
      const entry = storage.getEntry(name, version);
      entry.handlers.executedHandler = status;
      storage.setEntry(name, version, entry);
    }
  }
};