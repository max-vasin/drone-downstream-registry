# drone-downstream-registry

[![Build Status](http://ci.resolve.sh/api/badges/max-vasin/drone-downstream-registry/status.svg)](http://ci.resolve.sh/max-vasin/drone-downstream-registry)

Drone plugin to register builds statuses in shared registry and trigger operations based on cumulative result.

## Docker

Build the Docker image with the following commands:

```
docker build --rm -t maxvasin/drone-downstream-registry
```

## .drone.yml

Base repository pipeline:

```yaml
pipeline:
  # .downstream
  # build, test, publish, generate .entry file in workspace
  # REGISTRY_DOWNSTREAM=true
  # REGISTRY_PACKAGE=drone-playground
  # REGISTRY_VERSION=10.0.1
  register:
    image: maxvasin/drone-downstream-plugin
    # attached host volume
    registry_path: /data/registry 
    action: package-build
    params: .entry
    # repositories must be same as for downstream plugin (without branch)
    repositories:
      - maxvasin/drone-playground-sub1
    volumes:
      - /srv/ecs/downstream-registry:/data/registry
      
  downstream:
    image: plugins/downstream
    server: http://ci.resolve.sh
    fork: true
    wait: true
    repositories:
      - max-vasin/drone-playground-sub1@master
    
    secrets: [ downstream_token ]
    # should pass vars to downstream builds
    params:
      - .entry
      
   
```

Every downstream repository pipeline:

```yaml
pipeline:
  # build, test, publish
  # drone does not expose DRONE_BUILD_STATUS during processing pipeline
  # workaround
  build_success:
    image: node:9
    commands:
      - echo REGISTRY_BUILD_STATUS=success >> .entry
    when:
      status: [ success ]
  
  build_failure:
    image: node:9
    commands:
      - echo REGISTRY_BUILD_STATUS=failure >> .entry
    when:
      status: [ failure ]
  
  register:
    image: maxvasin/drone-downstream-plugin
    # attached host volume
    registry_path: /data/registry 
    action: downstream-build
    params: .entry
    when:
      status: [ success, failure ]
    volumes:
      - /srv/ecs/downstream-registry:/data/registry
```