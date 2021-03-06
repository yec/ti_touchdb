
var currentView = 'by_author';

var books = Alloy.createCollection("Book");
books.on('reset', function(e) {
  $.tableView.refresh(books);
});

$.tableView.refresh = function(collection) {
  var data = [];
  var section = null;
  collection.each(function(book) {
    var groupProperty;
    if (currentView === 'by_author') {
      groupProperty = book.get('author');
    }
    else if (currentView === 'by_published') {
      groupProperty = book.get('published')[0];
    }
    
    if (!section || section.headerTitle !== groupProperty) {
      if (section) {
        data.push(section);
      }
      section = Ti.UI.createTableViewSection({
        headerTitle: groupProperty
      });
    }
    
    var row = Alloy.createController('book_list_row', book);
    section.add(row.getView());
  });
  data.push(section); // last section
  
  this.setData(data);
};

Ti.App.addEventListener('books:update_from_server', function(e) {
  loadBookList();
});

Ti.App.addEventListener('books:book_changed', function(e) {
  loadBookList();
});

function loadBookList() {
  books.fetch({ view: currentView });
}

function changeGrouping(e) {
  if (OS_ANDROID) {
    if (e.source.id === 'authorSwitch') {
      if (e.source.value) {
        currentView = 'by_author';
      }
      $.publishedSwitch.value = !e.source.value;
    }
    else if (e.source.id === 'publishedSwitch') {
      if (e.source.value) {
        currentView = 'by_published';
      }
      $.authorSwitch.value = !e.source.value;
    }
  }
  else if (OS_IOS) {
    switch (e.index) {
      case 0:
        currentView = 'by_author';
        break;
      case 1:
        currentView = 'by_published';
        break;
    }
  }
  loadBookList();
}

function addBook(e) {
  Ti.App.fireEvent('books:edit_book');
}

if (OS_IOS) {
  var addButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.ADD
  });
  addButton.addEventListener('click', addBook);
  $.win.rightNavButton = addButton;
}
else if (OS_ANDROID) {
  exports.open = function() {
    $.win.open();
  };
}
