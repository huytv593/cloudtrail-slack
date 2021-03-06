#!/usr/bin/env node

var watcher = require('lib/watcher');

var all_regions = ['ap-northeast-1',
                   'ap-southeast-1',
                   'ap-southeast-2',
                   'eu-central-1',
                   'eu-west-1',
                   'sa-east-1',
                   'us-east-1',
                   'us-west-1',
                   'us-west-2'];

var regions =  process.env.REGIONS ? process.env.REGIONS.split(',') : all_regions;

regions.forEach(function (region) {
  watcher.watch(region);
});