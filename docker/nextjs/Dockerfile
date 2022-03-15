FROM node:16.13.1

LABEL maintainer="takimotok"

# install libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
  vim && \
  # clear cached binaries
  apt-get clean && rm -rf /var/cache/apt

# WORKDIR /usr/src
WORKDIR /usr/src/app
