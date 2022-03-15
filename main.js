const uploadContainer = document.querySelector('#upload-container');
const imageContainer = document.querySelector('#image-container');
const uploadDiv = document.querySelector('#upload-div');
const canvasDiv = document.querySelector('#canvas-div');
const input = document.querySelector('#upload');
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

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

        const btnSave = document.createElement('button');
        btnSave.textContent = "Save it to the gallery";
        canvasDiv.appendChild(btnSave);

        btnSave.addEventListener('click', ev => {
            btnSave.remove();
            btnInvert.remove();
            btnContrastRed.remove();
            btnContrastInc.remove();

            canvas.toBlob(blob => {
                let images = db.transaction('images', 'readwrite').objectStore('images');
                let req = images.add({ image: blob });

                req.onsuccess = () => display();
            }, 'image/png', 1);
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientWidth);
            
        });

        const btnInvert = document.createElement('button');
        btnInvert.textContent = 'Invert';
        canvasDiv.appendChild(btnInvert);

        btnInvert.addEventListener('click', () => {
            invert();
        });

        const btnContrastRed = document.createElement('button');
        btnContrastRed.textContent = 'reduce contrast';
        canvasDiv.appendChild(btnContrastRed);

        btnContrastRed.addEventListener('click', () => {
            contrastReduce();
        });

        const btnContrastInc = document.createElement('button');
        btnContrastInc.textContent = 'Increase contrast';
        canvasDiv.appendChild(btnContrastInc);

        btnContrastInc.addEventListener('click', () => {
            contrastIncrease();
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

            let url = URL.createObjectURL(item.image);
            let img = new Image(250, 250);
            img.src = url;

            let btn = document.createElement('button');
            btn.textContent = 'Remove';

            let a = document.createElement('a');
            a.href = url;
            a.textContent = 'Download';
            a.download = "Image.png";

            div.appendChild(img);
            div.appendChild(btn);
            div.appendChild(a);

            imageContainer.appendChild(div);

            btn.addEventListener('click', e => {
                let images = db.transaction('images', 'readwrite').objectStore('images');
                let req = images.delete(item.id);

                req.onsuccess = () => display();
            });
        }
    };
}

function invert() {
    const image = ctx.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
    const data = image.data;

    for (let index = 0; index < data.length; index += 4) {
        data[index] = 255 - data[index];
        data[index + 1] = 255 - data[index + 1];
        data[index + 2] = 255 - data[index + 2];

    }
    ctx.putImageData(image, 0, 0);

}

function contrastIncrease() {
    const image = ctx.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
    const data = image.data;

    for (let index = 0; index < data.length; index += 4) {
        if (data[index] + 10 < 255) {
            data[index] += 10;
        }
        if (data[index + 1] + 10 < 255) {
            data[index + 1] += 10;
        }
        if (data[index + 2] < 255) {
            data[index + 2] += 10;
        }
    }

    ctx.putImageData(image, 0, 0);
}

function contrastReduce() {
    const image = ctx.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
    const data = image.data;
    console.log(data);
    for (let index = 0; index < data.length; index += 4) {
        if (data[index] - 10 > 0) {
            data[index] -= 10;
        }
        if (data[index + 1] - 10 > 0) {
            data[index + 1] -= 10;
        }
        if (data[index + 2] - 10 > 0) {
            data[index + 2] -= 10;
        }
    }

    ctx.putImageData(image, 0, 0);
}