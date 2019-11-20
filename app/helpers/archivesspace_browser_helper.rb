module ArchivesspaceBrowserHelper

  def archivesspace_browser
    html = '<div id="archivesspace-browser-components">'
    browser = '<div id="archivesspace-browser"></div>'
    post = '<div id="archivesspace-browser-post">'
    post << '<div id="record-pane" class="hidden"></div>'
    post << '</div>'
    html << browser
    html << post
    html << '<div>'
    html.html_safe
  end

end
