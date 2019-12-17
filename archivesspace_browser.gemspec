$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "archivesspace_browser/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "archivesspace_browser"
  spec.version     = ArchivesspaceBrowser::VERSION
  spec.authors     = ["Trevor Thornton"]
  spec.email       = ["trthorn2@ncsu.edu"]
  spec.homepage    = "https://lib.ncsu.edu"
  spec.summary     = "A Rails Engine gem that provides an interface to browse records in ArchivesSpace from within
      a Ruby on Rails application."
  spec.description = "A Rails Engine gem that provides an interface to browse records in ArchivesSpace from within
      a Ruby on Rails application."
  spec.license     = "MIT"

  spec.require_paths = ["lib", "app", "config"]

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  spec.test_files = Dir["spec/**/*"]

  spec.add_dependency "rails", "~> 5.2", ">= 5.2.2.1"

  spec.add_development_dependency "sqlite3"
  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "rspec"
end
