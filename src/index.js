import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const search = document.querySelector('#search-form');
const searchBtn = document.querySelector('.search-btn');
const gallery = document.querySelector('.gallery');
const clear = elems => [...elems.children].forEach(div => div.remove());
const loadBtn = document.querySelector('.load-more');
let perPage = 40;
let page = 0;

async function fetchImages(name, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=23580980-4f75151f85975025bb6074227&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`,
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
  page = 1;
  const {
    elements: { searchQuery },
  } = event.currentTarget;
  console.log(searchQuery.value);
  let name = searchQuery.value;
  console.log(name);
  fetchImages(name, page)
    .then(name => {
      console.log(`Number of arrays: ${name.hits.length}`);
      console.log(`Total hits: ${name.totalHits}`);
      let totalPages = name.totalHits / perPage;
      console.log(`Total pages: ${totalPages}`);

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
        loadBtn.style.display = 'block';
        renderGallery(name);
        console.log(`Current page: ${page}`);
        const lightbox = new SimpleLightbox('.gallery a', {});

        if (page < totalPages) {
          loadBtn.addEventListener('click', () => {
            let name = searchQuery.value;
            console.log('load more images');
            page += 1;
            fetchImages(name, page).then(name => {
              renderGallery(name);
              lightbox.refresh();
              console.log(`Current page: ${page}`);
              if (page > totalPages) {
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
                loadBtn.style.display = 'none';
              }
            });
          });
        }
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
        clear(gallery);
      }
    })
    .catch(error => console.log(error));
  loadBtn.style.display = 'none';
}

search.addEventListener('submit', eventHandler);

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
