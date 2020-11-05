#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var Getopt = require('node-getopt');
var Q = require(__dirname + '/../src/quiita-team.js');

getopt = new Getopt([
	['o', 'outdir=DIR', 'specify output directory (default: quiita-team-html).'],
	['c', 'cookie=FILE', 'specify cookie file to login qiita.com.'],
	['n', 'no-download', "Don't download image resources."],
	['h', 'help', 'show this help.'],
]).bindHelp();

getopt.setHelp("Usage: quiita-team JSON_FILE [OPTION]\n[[OPTIONS]]");

var opt = getopt.parseSystem();
var options = {};

function printUsageAndExit() {
	getopt.showHelp();
	process.exit(0);
}

if(opt.argv.length==0) {
	printUsageAndExit();
}

if(opt.options.cookie) {
	try {
		options.cookie = fs.readFileSync(opt.options.cookie);
	} catch(e) {
		console.log("Failed to load cookie file: " + opt.options.cookie);
		process.exit(1);
	}
}

if(opt.options.outdir) {
	options.outdir = opt.options.outdir;
}

var data;
try {
	var articles = fs.readdirSync(`${opt.argv[0]}/articles`, 'utf-8')
	var groups = fs.readdirSync(`${opt.argv[0]}/groups`, 'utf-8')
	var projects = fs.readdirSync(`${opt.argv[0]}/projects`, 'utf-8')
	data = { articles, groups, projects };
} catch(e) {
	console.log("Failed to load file: " + opt.argv[0]);
	process.exit(1);
}

var q = new Q(data, options);

q.generateHtml();

if(!opt.options['no-download']) {
	q.downloadAssets();
}
