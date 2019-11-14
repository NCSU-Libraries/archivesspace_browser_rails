class ArchivesspaceBrowserController < ActionController::Base

  def api_get
    if !params[:path]
      data = { errors: ['ArchivesSpace API path was not provided'] }
    else
      path = params[:path]
      request_params = api_request_params.to_h
      request_params.delete(:path)

      [:offset, :page, :per_page].each do |x|
        if request_params[x]
          request_params[x] = request_params[x].to_i
        end
      end

      data = aspace_get(path, request_params)
    end
    render json: data
  end


  # /resource_search/:q
  def resource_search
    q = params[:q]
    query = "title:#{q} AND #{repositories_query_clause}"
    path = '/search'
    options = { page: 1, page_size: 10, q: query, type: ['resource'] }
    data = aspace_get(path, options, true)
    render json: data['results']
  end


  # /repositories/:repo_id/resources/:id/tree_level
  def get_tree_node_data
    if !params[:root_uri] || !params[:node_uri]
      @data = { errors: ['root_uri (Resource URI) and node_uri (ArchivalObject URI) are both required'] }
    else
      @root_uri = params[:root_uri]
      @node_uri = params[:node_uri]
      path = Pathname.new(@root_uri) + 'tree/node'
      request_params = { node_uri: @node_uri }
      data = aspace_get(path.to_s, request_params)
      @data = JSON.parse(data)

      if @data['precomputed_waypoints'] && @data['precomputed_waypoints'][@node_uri]
        @data['children'] = @data['precomputed_waypoints'][@node_uri]['0']
      end

      resolve_additional_waypoints
      puts @data['children'].length
    end
    render json: @data
  end


  # /repositories/:repo_id/archival_objects/:id
  def get_archival_object
    options = { resolve: ['subjects', 'linked_agents', 'linked_records', 'classifications',
        'digital_object', 'extents', 'ancestors', 'top_container'] }
    path = "/repositories/#{ params[:repo_id] }/archival_objects/#{ params[:id] }"
    data = aspace_get(path, options)
    render json: data
  end


  private


  def api_request_params
    params.permit(
      :path,
      :node_uri,
      :parent_id,
      :parent_node,
      :offset,
      :page,
      :per_page
    )
  end


  def resolve_additional_waypoints
    if @data['waypoints'] > 1
      i = 1
      while i < @data['waypoints'] do
        path = Pathname.new(@root_uri) + 'tree/waypoint'
        params = { offset: i, parent_node: @node_uri }
        response_data = aspace_get(path.to_s, params)
        waypoint_data = JSON.parse(response_data)
        if waypoint_data.is_a? Array
          @data['children'] += waypoint_data
        end
        i += 1
      end
    end
  end


  # For NCSU we only search repository 2
  # we might need to make this generic at some point in the future but for now it's just hardcoded here
  # Alternately, this could be made configurable to specify repositories to search
  def repositories_query_clause
    repo_ids = [2]
    repo_uris = repo_ids.map { |r| "\"/repositories/#{r}\"" }
    "repository:(#{repo_uris.join(' ')})"
  end


  def aspace_get(path, options={}, ruby=false)
    options[:retries] ||= 5
    @session = ArchivesspaceBrowser::ArchivesSpaceSession.new
    response = @session.get(path, options)

    if response.code.to_i == 412 && options[:retries] > 0
      options[:retries] -= 1
      aspace_get(path, options, ruby)
    else
      ruby ? JSON.parse(response.body) : response.body
    end
  end

end
