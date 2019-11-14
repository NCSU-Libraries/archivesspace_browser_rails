function ArchivesspaceBrowser(options) {
  options = options || {};

  this.apiRootPath = rootPath() + '/archivesspace'
  this.rootSelector = '#archivesspace-browser';
  this.rootElement = document.querySelector(this.rootSelector);
  this.callback = options.callback;
  if (!this.rootElement) {
    throw "No element exists matching " + this.rootSelector;
  }
  else {
    this.generate();
  }
}


ArchivesspaceBrowser.prototype.generate = function() {
  this.generateHeading();
  this.generateResourceTreeComponent();
  this.generateResourceSearchComponent();
}


ArchivesspaceBrowser.prototype.generateHeading = function() {
  var heading = generateElement('h2');
  heading.innerHTML = "Select record from ArchivesSpace";
  this.rootElement.appendChild(heading);
}


ArchivesspaceBrowser.prototype.generateResourceSearchComponent = function() {
  var _this = this;
  var element = generateElement('div');
  element.setAttribute('id', 'resource-search');

  var label = generateElement('label', 'block');
  label.setAttribute('for','resource-search-input');
  label.innerHTML = 'Search resources by title, then select from results';

  var input = generateElement('input');
  setElementAttributes(input, { type: 'text', id: 'resource-search-input', placeholder: 'begin typing to see matching titles' });

  var results = generateElement('div');
  results.setAttribute('id', 'resource-search-results');

  var loading = generateElement('div', ['loading', 'hidden']);
  var loadingMessage = generateElement('div', ['message']);
  loadingMessage.innerHTML = 'LOADING';
  loading.appendChild(loadingMessage);
  results.appendChild(loading);

  appendChildren(element, [ label, input, results ]);
  this.resourceSearchLoading = loading;
  this.resourceSearchResults = results;
  this.resourceSearchInput = input;
  this.resourceSearch = element;
  this.resourceSearchInput.addEventListener('input', function(e) {
    _this.performResourceSearch(this.value);
  });
  this.rootElement.appendChild(this.resourceSearch);
}


ArchivesspaceBrowser.prototype.generateResourceTreeComponent = function() {
  var _this = this;
  var element = generateElement('div', 'hidden');
  element.setAttribute('id', 'resource-tree');

  var label = generateElement('label', 'block');
  label.setAttribute('for','resource-tree');
  label.innerHTML = 'Browse contents to find the correct record';

  var backToSearchWrap = generateElement('div');
  backToSearchWrap.setAttribute('id','back-to-search');
  backToSearch = generateBackLink("Back to search");

  backToSearch.addEventListener('click', function(e) {
    _this.clearResourceTreeContent();
    hide(_this.resourceTree);
    show(_this.resourceSearch);
  });

  backToSearchWrap.appendChild(backToSearch);

  var content = generateElement('div', 'resource-tree-content');
  var loading = generateElement('div', ['loading', 'hidden']);
  var loadingMessage = generateElement('div', ['message']);
  loadingMessage.innerHTML = 'LOADING';
  loading.appendChild(loadingMessage);
  // content.appendChild(loading);

  appendChildren(element, [ backToSearchWrap, label, content, loading ]);

  this.resourceTree = element;
  this.resourceTreeContent = content;
  this.resourceTreeLoading = loading;
  this.rootElement.appendChild(this.resourceTree);
}


ArchivesspaceBrowser.prototype.performResourceSearch = function(q) {
  var _this = this;
  q = q.replace(/[\.\/\\\?\&]/,' ');
  var url = this.apiRootPath + '/resource_search/' + q;

  this.clearResourceSearchResults();

  if (q.length >= 3) {
    show(this.resourceSearchLoading);

    getUrl(url, function(results) {
      hide(_this.resourceSearchLoading);
      var results = JSON.parse(results);
      _this.updateSearchResults(results);
    });
  }
}


ArchivesspaceBrowser.prototype.clearResourceSearchResults = function() {
  var _this = this;
  var oldResults = this.resourceSearchResults.querySelectorAll('.results');
  if (oldResults.length > 0) {
    oldResults.forEach(function(r) {
      _this.resourceSearchResults.removeChild(r);
    });
  }
}


ArchivesspaceBrowser.prototype.updateSearchResults = function(results) {
  this.clearResourceSearchResults();
  var content;
  if (results.length == 0) {
    content = generateElement('div', ['results', 'no-results']);
    content.innerHTML = "No results";
  }
  else {
    content = this.searchResultsList(results);
  }

  this.resourceSearchResults.appendChild(content);
}


ArchivesspaceBrowser.prototype.searchResultsList = function(results) {
  var _this = this;
  var list = generateElement('ul', 'results');
  results.forEach(function(r) {
    var item = generateElement('li', 'row');
    var link = generateElement('span', 'link');
    link.setAttribute('data-uri', r.uri);
    link.innerHTML = r['title'];
    link.addEventListener('click', function(e) {
      hide(_this.resourceSearch);
      show(_this.resourceTree);
      var uri = this.getAttribute('data-uri');
      _this.loadResourceTree(uri);
    });
    item.appendChild(link);
    list.appendChild(item);
  });
  return list;
}


/* RESOURCE TREE */

ArchivesspaceBrowser.prototype.leafInnerHTML = function(data) {
  var html;
  var title = data['title'];

  function addDates() {
    if (data['dates'] && Array.isArray(data['dates']) && data['dates'][0]) {
      var date = data['dates'][0];
      var dateText;

      if (date['expression']) {
        dateText = date['expression'];
      }
      else if (date['begin'] || date['end']) {
        dateText = date['begin'] || '';
        dateText = dateText + '-'
        dateText = dateText + (date['end'] || '')
      }

      if (dateText) {
        title = title + ', ' + dateText;
      }
    }
  }

  function containerText(container) {
    var text;

    if (container['top_container_type']) {
      text = container['top_container_type'] + ' ' + container['top_container_indicator'];
    }
    if (container['type_2']) {
      text = text + ', ' + container['type_2'] + ' ' + container['indicator_2'];
    }
    return text;
  }

  function addContainers() {
    var text;

    if (data['containers'] && Array.isArray(data['containers'])) {
      var containers = [];
      data['containers'].forEach(function(c) {
        var cText = containerText(c);
        if (cText && cText.length > 0) {
          containers.push(containerText(c));
        }
      });
      if (containers.length > 0) {
        text = containers.join('; ');
      }
    }

    if (text) {
      html = html + '<br><span class="container">' + text + '</span>';
    }
  }

  addDates();
  html = '<span class="title">' + title + '</span>';
  addContainers();
  return html;
}


ArchivesspaceBrowser.prototype.leafHasContainers = function(data) {
  var hasContainers = false;
  if (data['containers'] && Array.isArray(data['containers'])) {
    for (var i = 0; i < data['containers'].length; i++) {
      var c = data['containers'][i];
      if (c['top_container_type']) {
        hasContainers = true;
        break;
      }
    }
  }
  return hasContainers;
}


ArchivesspaceBrowser.prototype.leafIsFile = function(data) {
  return data['level'] == 'file';
}


ArchivesspaceBrowser.prototype.generateLeafElement = function(data, level) {
  var _this = this;
  var levelClass = 'level-' + level;
  var leaf = generateElement('div', [levelClass, 'tree-level', 'tree-level-leaf']);
  var html = this.leafInnerHTML(data);

  if (data['child_count'] > 0) {
    var leafLink = generateElement('span', 'link');
    leafLink.innerHTML = html;

    leafLink.addEventListener('click', function(e) {
      _this.getResourceTreeLevel(data['uri']);
    });

    leaf.appendChild(leafLink);
  }
  else {
    leaf.innerHTML = html;
    if (this.leafHasContainers(data) || this.leafIsFile(data)) {
      var select = generateElement('span', 'select-record');
      var selectLink = generateElement('span', 'link');
      selectLink.setAttribute('data-uri', data['uri']);
      selectLink.innerHTML = 'Select this record';

      selectLink.addEventListener('click', function(e) {
        _this.getArchivalObjectRecord(data['uri']);
      });

      select.appendChild(selectLink);
      leaf.appendChild(select);
    }
  }

  return leaf;
}


ArchivesspaceBrowser.prototype.updateActiveResourceTreePath = function(parentUri) {
  var index = this.activeResourceTreePath.indexOf(parentUri);
  if (index > 0) {
    this.activeResourceTreePath.splice(index, this.activeResourceTreePath.length);
  }
  else if (index < 0) {
    this.activeResourceTreePath.push(parentUri);
  }
  else if (index == 0) {
    this.activeResourceTreePath = [parentUri];
  }
}


ArchivesspaceBrowser.prototype.updateRecordPane = function(data) {
  data = JSON.parse(data);
  var recordPane = document.querySelector('#record-pane');
  // remove old content
  recordPane.innerHTML = '';
  var content = generateElement('div', 'record-pane-content');
  var label = htmlToElement('<div class="heading">Selected record:</div>');
  content.appendChild(label);
  var branches = document.querySelectorAll('#resource-tree-level-content .tree-level-branch');
  var leafIndex = branches.length;
  for (var i = 0; i < branches.length; i++) {
    var branch = branches[i];
    var levelClass = 'level-' + i;
    var e = generateElement('div', [levelClass, 'tree-level-branch']);
    e.innerText = branch.innerText;
    content.appendChild(e);
  }
  var leafLevelClass = 'level-' + leafIndex;
  var leaf = generateElement('div', [leafLevelClass, 'tree-level-leaf']);
  leaf.innerText = data['display_string'];
  content.appendChild(leaf);
  recordPane.appendChild(content);
}


ArchivesspaceBrowser.prototype.getArchivalObjectRecord = function(uri) {
  var _this = this;
  var url = this.apiRootPath + uri;
  url = url.replace(/\/{2}/,'/');

  getUrl(url, function(data) {
    _this.updateRecordPane(data);

    if (_this.callback) {
      _this.callback(data);
    }
  });
}


/* RESOURCE TREE REQUESTS */

ArchivesspaceBrowser.prototype.clearResourceTreeContent = function() {
  this.resourceTreeContent.innerHTML = '';
}


ArchivesspaceBrowser.prototype.getFromAspaceApi = function(path, params, callback) {
  var url = rootPath() + '/archivesspace_api';
  var getParams = params || {};
  getParams['path'] = path;
  getUrlWithParams(url, getParams, callback);
}


ArchivesspaceBrowser.prototype.getTreeRootData = function(callback) {
  var _this = this;
  var path = this.resourceUri + '/tree/root';
  this.getFromAspaceApi(path, null, callback);
}


ArchivesspaceBrowser.prototype.getTreeNodeData = function(archivalObjectUri, callback) {
  var _this = this;
  var params = { root_uri: this.resourceUri, node_uri: archivalObjectUri };
  var url = rootPath() + '/archivesspace/tree_node_data';
  getUrlWithParams(url, params, callback);
}


ArchivesspaceBrowser.prototype.loadResourceTree = function(resourceUri) {
  var _this = this;
  this.resourceUri = resourceUri;
  this.activeResourceTreePath = [resourceUri];
  this.resourceTreeMap = {};
  this.getResourceTreeLevel();
}


ArchivesspaceBrowser.prototype.resourceTreeUpdateInProgress = function() {
  var branches = document.querySelector('#resource-tree-level-content .tree-leaves');
  if (branches) {
    hide(branches);
  }
  show(this.resourceTreeLoading);
}


ArchivesspaceBrowser.prototype.resourceTreeUpdateComplete = function() {
  var branches = document.querySelector('#resource-tree-level-content .tree-leaves');
  hide(this.resourceTreeLoading);
  if (branches) {
    show(branches);
  }
}


ArchivesspaceBrowser.prototype.getResourceTreeLevel = function(parentUri) {
  var _this = this;
  var params = parentUri ? { parent_uri: parentUri } : {};
  var target = parentUri ? 'node' : 'root';
  parentUri = parentUri || this.resourceUri;
  var treeLevelData;

  // If tree level has already been loaded show loaded content
  if (this.resourceTreeMap[parentUri]) {
    treeLevelData = this.resourceTreeMap[parentUri];
    this.updateResourceTree(treeLevelData, parentUri);
  }
  // If tree level has not been loaded then go get it
  else {
    this.resourceTreeUpdateInProgress();

    var callback = function(response) {
      treeLevelData = JSON.parse(response);
      _this.resourceTreeMap[parentUri] = treeLevelData;
      _this.updateResourceTree(treeLevelData, parentUri);
      _this.resourceTreeUpdateComplete();
    }

    if (target == 'root') {
      this.getTreeRootData(callback);
    }
    else {
      this.getTreeNodeData(parentUri, callback);
    }
  }
}


ArchivesspaceBrowser.prototype.setTreeParams = function(treeLevelData, parentUri) {
  var parent = (!parentUri || parentUri == this.resourceUri) ? '' : parentUri;
  var newContent = generateElement('div');
  newContent.setAttribute('id','resource-tree-level-content');

  if (!treeLevelData.children && treeLevelData['precomputed_waypoints']) {
    treeLevelData.children = treeLevelData['precomputed_waypoints'][parent][0]
  }

  var params = {
    waypointsParent: parent,
    parentUri: parentUri || this.resourceUri,
    children: treeLevelData.children,
    newContent: newContent,
    treeHead: generateElement('div', 'tree-branches'),
    treeLeaves: generateElement('div', 'tree-leaves'),
    oldContent: this.resourceTreeContent.querySelector('#resource-tree-level-content')
  }

  return params;
}


ArchivesspaceBrowser.prototype.updateResourceTree = function(treeLevelData, parentUri) {
  var _this = this;

  treeParams = this.setTreeParams(treeLevelData, parentUri);
  treeLevelData['children'] = treeParams.children;
  this.resourceTreeMap[parentUri] = treeLevelData;
  if (parentUri) {
    this.updateActiveResourceTreePath(parentUri);
  }
  var treeLeavesData;
  var treeLevel;

  // Iterate through this.activeResourceTreePath to build heading and determine level
  for (var i = 0; i < this.activeResourceTreePath.length; i++) {
    var isCurrentLevel = (i == this.activeResourceTreePath.length - 1);
    var uri = this.activeResourceTreePath[i];
    var data = this.resourceTreeMap[uri];
    var levelClass = 'level-' + i;
    var heading = generateElement('div', [levelClass, 'tree-level', 'tree-level-branch']);
    if (!isCurrentLevel) {
      var levelLink = generateElement('span', 'link');
      levelLink.innerHTML = data['title'];
      levelLink.addEventListener('click', function(e) {
        _this.getResourceTreeLevel(uri);
      });
      heading.appendChild(levelLink);
    }
    else {
      heading.innerHTML = data['title'];
    }

    treeParams.treeHead.appendChild(heading);

    if (isCurrentLevel) {
      treeLevel = i + 1;
      treeLeavesData = data['children'];
    }
  }

  treeParams.newContent.appendChild(treeParams.treeHead);
  treeParams.newContent.appendChild(treeParams.treeLeaves);
  this.addLeaves(treeParams.treeLeaves, treeLeavesData, treeLevel);

  if (treeParams.oldContent) {
    this.resourceTreeContent.replaceChild(treeParams.newContent, treeParams.oldContent);
  }
  else {
    this.resourceTreeContent.appendChild(treeParams.newContent);
  }
}


ArchivesspaceBrowser.prototype.addLeaves = function(leavesWrapper, leavesData, level) {
  var _this = this;

  leavesData.forEach(function(data) {
    var leaf = _this.generateLeafElement(data, level);
    leavesWrapper.appendChild(leaf);
  });
}
