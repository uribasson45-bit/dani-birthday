// Default story content.
// Keeping the birthday content outside the application logic makes it easier
// to edit or replace later without touching the core code.
var DEFAULT_STORY = {
  pages: [
    {
      name: 'עמוד 1',
      locked: false,
      background: { type: 'none', value: '' },
      elements: [
        { type: 'heading', value: 'יום הולדת שמח! 🎂' },
        { type: 'subheading', value: 'לך, האהוב שלי' },
        { type: 'text', value: 'זה הסיפור שלנו. לחץ → כדי להמשיך...' }
      ]
    }
  ],
  currentPage: 0
};
