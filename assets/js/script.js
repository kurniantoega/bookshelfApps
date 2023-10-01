const books = [];
const RENDER_EVENT = "render-buku";

document.addEventListener('DOMContentLoaded', function() {
  const submitForm = document.getElementById('inputBuku');
  submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
    tambahBuku();
    submitForm.reset();
  });

  const inputSearchForm = document.getElementById('cariJudulBuku');
  inputSearchForm.addEventListener('input', function(event) {
    event.preventDefault();
    search();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
})

function tambahBuku() {
  const title = document.getElementById('judulBuku').value;
  const author = document.getElementById('penulisBuku').value;
  const year = parseInt(document.getElementById('tahunBuku').value);
  const isComplete = document.getElementById('bukuSelesaiDibaca');
  const id = generateId();
  
  if (isComplete.checked) {
    const bookObject = generateBookObject(id, title, author, year, true);
    books.push(bookObject);
  } else {
    const bookObject = generateBookObject(id, title, author, year, false);
    books.push(bookObject);
  };
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert('Data buku berhasil ditambahkan');
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id, title, author, year, isComplete
  }
}

document.addEventListener(RENDER_EVENT, function() {
  const listBelumSelesai = document.getElementById('listBukuBelumSelesai');
  listBelumSelesai.innerHTML = '';
  const listSelesai = document.getElementById('listBukuSelesai');
  listSelesai.innerHTML = '';

  for (const index of books) {
    const elementBuku = makeBook(index);
    if (!index.isComplete) {
      listBelumSelesai.append(elementBuku);
    } else {
      listSelesai.append(elementBuku);
    };
  };
})

function makeBook(bookObject) {
  const judulBuku = document.createElement('h3');
  judulBuku.innerText = bookObject.title;

  const penulisBuku = document.createElement('p');
  penulisBuku.innerText = "Penulis: " + bookObject.author;

  const tahunBuku = document.createElement('p');
  tahunBuku.innerText = "Tahun: " + bookObject.year;

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('action');

  const container = document.createElement('div');
  container.classList.add('detailBuku');
  container.append(judulBuku, penulisBuku, tahunBuku, btnContainer);
  container.setAttribute('id', `buku-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoBtn = document.createElement('button');
    undoBtn.classList.add('undo');
    undoBtn.innerHTML = '<i class="fa-solid fa-rotate-left">';
    undoBtn.setAttribute('title', 'Belum Selesai Dibaca');

    undoBtn.addEventListener('click', function() {
      pindahkanKeBelumSelesai(bookObject.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.setAttribute('title', 'Hapus Buku');

    deleteBtn.addEventListener('click', function() {
      hapusBuku(bookObject.id);
    });
    btnContainer.append(undoBtn, deleteBtn);
  } else {
    const checkBtn = document.createElement('button');
    checkBtn.classList.add('done');
    checkBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    checkBtn.setAttribute('title', 'Selesai Dibaca');

    checkBtn.addEventListener('click', function() {
      pindahkanKeSelesai(bookObject.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.setAttribute('title', 'Hapus Buku');

    deleteBtn.addEventListener('click', function() {
      hapusBuku(bookObject.id);
    });
    btnContainer.append(checkBtn, deleteBtn);
  };
  return container;
}

function pindahkanKeSelesai(bookId) {
  if (confirm('Pindahkan ke rak selesai dibaca?')) {
    const target = cariBuku(bookId);

    if (target == null) return;

    target.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function cariBuku(bookId) {
  for (const buku of books) {
    if (buku.id === bookId) {
      return buku;
    }
  }
  return null;
}

function hapusBuku(bookId) {
  if (confirm('Apakah yakin ingin menghapus data buku ini?')) {
    const indexBuku = cariIndexBuku(bookId);

    if (indexBuku == -1) return;

    books.splice(indexBuku, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  } else {
    return;
  }
}

function pindahkanKeBelumSelesai(bookId) {
  if (confirm('Pindahkan ke rak belum selesai dibaca?')){
    const target = cariBuku(bookId);

    if (target == null) return;
  
    target.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function cariIndexBuku(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function search() {
  const search = document.getElementById('cariJudulBuku').value;
  console.log(search);

  const listBelumSelesai = document.getElementById('listBukuBelumSelesai');
  listBelumSelesai.innerHTML = '';
  const listSelesai = document.getElementById('listBukuSelesai');
  listSelesai.innerHTML = '';

  for (const index of books) {
    if (index.title.toLowerCase().includes(search.toLowerCase())) {
      const elementBuku = makeBook(index);
      if (!index.isComplete) {
        listBelumSelesai.append(elementBuku);
      } else {
        listSelesai.append(elementBuku);
      }
    }
  }
}

/////////////////////////////////////
////////     WEB STORAGE     ////////
/////////////////////////////////////
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookshelf-apps';

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    alert('Maaf browser tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
