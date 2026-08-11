// Runtime application state

function cloneDefaultStory() {
  return {
    pages: DEFAULT_STORY.pages.map(function(page) {
      return {
        id: uid(),
        name: page.name,
        locked: !!page.locked,
        background: {
          type: page.background ? page.background.type : 'none',
          value: page.background ? page.background.value : ''
        },
        elements: (page.elements || []).map(function(el) {
          var copy = {};
          Object.keys(el).forEach(function(key) { copy[key] = el[key]; });
          copy.id = uid();
          return copy;
        })
      };
    }),
    currentPage: DEFAULT_STORY.currentPage || 0
  };
}

var state = cloneDefaultStory();

var adminMode = false;
var selectedPageIdx = 0;

// Touch tracking
var _touchStartX = 0;
var _touchStartY = 0;
var _touchStartT = 0;
