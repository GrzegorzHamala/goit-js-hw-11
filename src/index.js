import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const search = document.querySelector('input[name="searchQuery"]');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const clear = elems => [...elems.children].forEach(div => div.remove());
const loadBtn = document.querySelector('.load-more');
const lightbox = () => new SimpleLightbox('.gallery a', {});
let perPage = 40;
let page = 0;

async function fetchImages(name, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=23580980-4f75151f85975025bb6074227&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function eventHandler(event) {
  event.preventDefault();
  clear(gallery);
  loadBtn.style.display = 'none';
  page = 1;
  let name = search.value;
  console.log(name);
  fetchImages(name, page)
    .then(name => {
      console.log(`Number of arrays: ${name.hits.length}`);
      console.log(`Total hits: ${name.totalHits}`);
      let totalPages = Math.ceil(name.totalHits / perPage);
      console.log(`Total pages: ${totalPages}`);

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
        renderGallery(name);
        console.log(`Current Page: ${page}`);
        lightbox();

        if (page < totalPages) {
          loadBtn.style.display = 'block';
        }   

      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
        clear(gallery);
      }
    })
    .catch(error => console.log(error));
}

searchForm.addEventListener('submit', eventHandler);

function renderGallery(name) {
  const markup = name.hits
    .map(hit => {
      return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <p><b>Likes</b> <br>${hit.likes}</br></p>
        </p>
        <p class="info-item">
          <p><b>Views</b> <br>${hit.views}</br></p>
        </p>
        <p class="info-item">
          <p><b>Comments</b> <br>${hit.comments}</br></p>
        </p>
        <p class="info-item">
          <p><b>Downloads</b> <br>${hit.downloads}</br></p>
        </p>
      </div>
    </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

loadBtn.addEventListener(
  'click',
  () => {
    let name = search.value;
    console.log('LOAD MORE IMAGES');
    page += 1;
    fetchImages(name, page).then(name => {
      let totalPages = Math.ceil(name.totalHits / perPage);
      renderGallery(name);

      lightbox().refresh();
      console.log(`Current Page: ${page}`);

      if (page >= totalPages) {
        loadBtn.style.display = 'none';
        console.log('There are no more images');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
    });
  }
);