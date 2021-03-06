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
	var articlesFileNames = fs.readdirSync(`${opt.argv[0]}/articles`, 'utf-8')
	var articlesStr = articlesFileNames.filter((f) => { return f.indexOf('.json') !== -1}).map((f) => {return fs.readFileSync(`${opt.argv[0]}/articles/${f}`, 'utf-8')});
	var articles = articlesStr.map((f) => {return JSON.parse(f.trim())});
	var groupsFileNames = fs.readdirSync(`${opt.argv[0]}/groups`, 'utf-8')
	var groupsStr = groupsFileNames.filter((f) => { return f.indexOf('.json') !== -1}).map((f) => {return fs.readFileSync(`${opt.argv[0]}/groups/${f}`, 'utf-8')});
	var groups = groupsStr.map((f) => {return JSON.parse(f)});
	var projectsFileNames = fs.readdirSync(`${opt.argv[0]}/projects`, 'utf-8')
	var projectsStr = projectsFileNames.filter((f) => { return f.indexOf('.json') !== -1}).map((f) => {return fs.readFileSync(`${opt.argv[0]}/projects/${f}`, 'utf-8')});
	var projects = projectsStr.map((f) => {return JSON.parse(f)});
	// 一度旧式のデータ形式に戻す
	data = JSON.stringify({ articles, groups, projects });
} catch(e) {
	console.log(e); // TODO delete
	console.log("Failed to load file: " + opt.argv[0]);
	process.exit(1);
}

var q = new Q(data, options);

q.generateHtml();

if(!opt.options['no-download']) {
	q.downloadAssets();
}
