// ============================================================
// STATE (in-memory)
// ============================================================
function defaultStyle() {
  return {
    fontFamily: '', fontSize: '', bold: false, italic: false, color: '',
    align: '', letterSpacing: '', lineHeight: '',
    bg: '', opacity: 100, borderWidth: 0, borderColor: '', radius: '',
    shadow: false, rotate: 0
  };
}
var state = {
  pages: [{
    id: uid(), name: 'עמוד 1', locked: false,
    background: { type: 'none', value: '', value2:'', angle:135, position:'center', fit:'cover', overlayColor:'#000000', overlayOpacity:0 },
    elements: [
      { id: uid(), type: 'heading',    value: 'יום הולדת שמח! 🎂', style: defaultStyle() },
      { id: uid(), type: 'subheading', value: 'לך, האהוב שלי',      style: defaultStyle() },
      { id: uid(), type: 'text',       value: 'זה הסיפור שלנו. לחץ → כדי להמשיך...', style: defaultStyle() }
    ]
  }],
  currentPage: 0
};
var adminMode       = false;
var selectedPageIdx = 0;

// Touch tracking (viewer swipe)
var _touchStartX = 0, _touchStartY = 0, _touchStartT = 0;

// Media object-URL runtime cache: mediaId -> blobURL
var _mediaUrlCache = {};
