module.exports = (storage) => {
  return {
    createPackageEntry: (name, version, repositories) => {
      storage.setEntry(name, version, {
        package: name,
        version: version,
        repositories,
        builds: {}
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
    }
  }
};