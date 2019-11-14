# desc "Explaining what the task does"
# task :archivesspace_browser do
#   # Task goes here
# end


require 'rspec/core'
require 'rspec/core/rake_task'

desc "Run all specs in spec directory (excluding plugin specs)"
RSpec::Core::RakeTask.new(:spec => 'app:db:test:prepare')

task :default => :spec
