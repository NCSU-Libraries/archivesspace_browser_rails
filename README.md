# ArchivesSpace Browser
A Rails Engine gem that provides an interface for selecting an ArchivalObject record from ArchivesSpace (via search/browse or direct selection by URI). The selected record is retrieved from the ArchivesSpace API and the data can be passed into a custom javascript function to be used for any purpose.

> This project was developed as part of ***['The Animal Turn': Digitizing Animal Protection and Human-Animal Studies Collections](https://www.lib.ncsu.edu/animal-turn)***, a three-year, grant-funded project undertaken in partnership with the [American Society for the Prevention of Cruelty to Animals (ASPCA)](https://www.aspca.org/) with funding from the [Council on Library and Information Resources (CLIR)](https://www.clir.org/).

## Installation and configuration

### Gemfile

Add this line to your application's Gemfile:

```ruby
gem 'archivesspace_browser', git: 'git@github.ncsu.edu:NCSU-Libraries/archivesspace_browser_rails.git'
```

> NOTE: This will change to https when the repo moves to github.com


Then run `bundle install`

### Configure gem for your ArchivesSpace installation

The gem needs to communicate with your ArchivesSpace installation via its API.
To enable this, create a new file named `archivesspace_config.rb` in `/config/initializers` that looks like this (replacing placeholders with the correct values for your ArchivesSpace instance):

```ruby
ArchivesspaceBrowser.configure do |config|

  config.host = 'your.archivespace.host.org'
  config.port = 8089
  config.username = 'admin'
  config.password = 'admin'
  config.https = nil

end
```

If your ArchivesSpace instance uses SSL/HTTPS (with ports corresponding to each component application redirected to separate subdomains) your configuration might look more like this:

```ruby
ArchivesspaceBrowser.configure do |config|

  config.host = 'backend.archivespace.host.org'
  config.port = nil
  config.username = 'admin'
  config.password = 'admin'
  config.https = true

end
```


### Add gem assets to asset pipeline

Add this to `app/assets/javascripts/application.rb` to include required javascript:

```js
//= require archivesspace_browser/archivesspace_browser
```

And add this to `app/assets/stylesheets/application.css` to include required CSS:

```
*= require archivesspace_browser/archivesspace_browser
```


## Usage

### HTML helper

To include the ArchivesSpace browser in a view template call the included helper method like this:

```
<%= archivesspace_browser %>
```

This will generate the required HTML targeted by the javascript to generate the browser components.


### Javascript (initilize the browser)

For the most basic implmentation, add this to one of the javascript files in your asset pipeline (after `archivespace_brwoser`):

```js
document.addEventListener('DOMContentLoaded', function() {
  new ArchivesspaceBrowser();
});
```

With this added, the ArchivesSpace browser will be rendered where you added the helper above. When an ArchivesSpace record is selected, the title and container info will be displayed and ... nothing else.

To do anything useful, you will also need to pass in a callback function that accepts a single argument (the JSON data returned from ArchivesSpace). After a record is selected, the full record will be retrieved from the ArchivesSpace API and passed into the callback function.

The example below takes the returned JSON and displays it in a janky javascript alert:

```js
document.addEventListener('DOMContentLoaded', function() {
  var callback = function(data) { window.alert(data); }

  new ArchivesspaceBrowser({ callback: callback });
});
```

### Customization options

#### CSS

See [gem CSS file](./app/assets/stylesheets/archviesspace_browser/archivesspace_browser.css) for guidance. Custom CSS declarations can target descendants of `#archivesspace-browser-components` or `#archivesspace-browser` as appropriate to avoid conflicts.

#### Javscript

> Coming...


### Test Rails app

There is a bare-bones Rails app included in this repo that you can use to preview the gem. Follow the instructions below to get it running.

> NOTE: Currently, running the test app requires that you have Ruby installed locally.

1. Clone or download/unzip this repo to a directory on your computer.

2. From the terminal, `cd` into the location where you cloned/unzipped the repo.

3. Run `bundle install`.

4. Follow the [instructions above for configuring ArchviesSpace](#configure-gem-for-your-archivesspace-installation).

5. Run `rails s` to start the embedded server, then open **localhost:3000** in your browser.


## Contributing

Pull requests and issues for this repo are welcome.


## License

The gem is available as open source under the terms of the [MIT License](./MIT-LICENSE).
