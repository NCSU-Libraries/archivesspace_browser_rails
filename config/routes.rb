Rails.application.routes.draw do
  
  get 'archivesspace_browser/api_get' => 'archivesspace_browser#api_get'
  get 'archivesspace_browser/resource_search/:q' => 'archivesspace_browser#resource_search'
  get 'archivesspace_browser/tree_root_data' => 'archivesspace_browser#get_tree_root_data'
  get 'archivesspace_browser/tree_node_data' => 'archivesspace_browser#get_tree_node_data'
  get 'archivesspace_browser/repositories/:repo_id/archival_objects/:id' => 'archivesspace_browser#get_archival_object'
  get 'archivesspace_browser/*path', to: 'archivesspace_browser#api_get'
end
