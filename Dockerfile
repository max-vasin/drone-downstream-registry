FROM node:10

ADD ./src /plugin
ADD ./node_modules /plugin/node_modules
ADD ./package.json /plugin/package.json

ENTRYPOINT ["/plugin/main"]