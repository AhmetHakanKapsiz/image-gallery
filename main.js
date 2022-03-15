const uploadContainer = document.querySelector('#upload-container');
const imageContainer = document.querySelector('#image-container');
const uploadDiv = document.querySelector('#upload-div');
const canvasDiv = document.querySelector('#canvas-div');
const input = document.querySelector('#upload');
const canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');

const fileTypes = [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
    "image/jpg",
];

let db;
let request = indexedDB.open('gallery', 1);

request.onerror = e => {
    console.log('It cannot be allowed to use IndexedDb');
};

request.onsuccess = e => {
    db = e.target.result;
    display();
};

request.onupgradeneeded = e => {
    db = e.target.result;

    let store = db.createObjectStore("images", { keyPath: 'id', autoIncrement: true });

    store.createIndex("image", "image", { unique: false });
};

function validFileType(file) {
    return fileTypes.includes(file.type);
}

input.addEventListener('change', e => {
    const file = input.files[0];
    console.log(file)
    if (validFileType(file)) {
        let img = document.createElement('img');
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 400, 400);
        }
        img.src = URL.createObjectURL(file);

        const btn = document.createElement('button');
        btn.textContent = "Save it to the gallery";
        canvasDiv.appendChild(btn);

        btn.addEventListener('click', ev => {
            btn.remove();
            let images = db.transaction('images', 'readwrite').objectStore('images');
            let req = images.add({ image: file });

            req.onsuccess = () => display();
        });
    }

});

function display() {
    imageContainer.innerHTML = '';
    let store = db.transaction('images').objectStore('images');
    store.getAll().onsuccess = e => {
        let images = e.target.result;

        for (const item of images) {
            let div = document.createElement('div');
            div.classList.add('image-card');
/*
            let p = document.createElement('p');
            p.textContent = item.name;*/

            let img = new Image(250, 250);
            img.src = URL.createObjectURL(item.image);

            let btn = document.createElement('button');
            btn.textContent = 'Remove';

            div.appendChild(img);
            //div.appendChild(p);
            div.appendChild(btn);

            imageContainer.appendChild(div);

            btn.addEventListener('click', e => {
                let images = db.transaction('images', 'readwrite').objectStore('images');
                let req = images.delete(item.id);

                req.onsuccess = () => display();
            });
        }
    };
}