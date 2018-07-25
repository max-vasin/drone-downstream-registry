FROM node:10

ADD ./src /plugin
ADD ./package.json /plugin/
ADD ./yarn.lock /plugin/
RUN npm install -g yarn
RUN cd /plugin && yarn install

ENTRYPOINT ["/plugin/main"]