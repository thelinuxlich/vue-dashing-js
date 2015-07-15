# vue-dashing-js

This is a fork of [nuvo-dashing-js](https://github.com/lokulin/nuvo-dashing-js) replacing Batman.js with Vue.js

## Getting Started

1. Install from npm

```shell
$ npm install -g vue-dashing-js
```

2. Generate a new project

```shell
$ dashing-js new sweet_dashboard_project
```

3. Change your directory to sweet_dashboard_project and install required modules

```shell
$ sudo npm install -g browserify watchify
$ cd sweet_dashboard_project && npm install
```

4. Start the automatic asset compilation task:

```shell
$ npm run watch
```

5. Start the server!

```shell
$ dashing-js start
```

5. Point your browser at http://localhost:3030/ and have fun!

***

Every new Dashing project comes with sample widgets & sample dashboards for you to explore. The directory is setup as follows:

* Assets — All your images, fonts, and js/coffeescript libraries. Uses <del>[Sprockets](https://github.com/sstephenson/sprockets)</del> [Mincer](http://nodeca.github.io/mincer/).
* Dashboards — One .jade file for each dashboard that contains the layout for the widgets.
* Jobs — Your js/coffee jobs for fetching data (e.g for calling third party APIs like twitter). Name them *\*.job.js/\*.job.coffee*
* Lib — Optional js/coffee files to help out your jobs.
* Public — Static files that you want to serve. A good place for a favicon or a custom 404 page.
* Widgets — All the vue templates for individual widgets.

Run `dashing-js` from command line to find out what command line tools are available to you.

## TODO

* Implement all the basic widgets
* Add a websocket option
* Refactoring

