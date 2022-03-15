const uploadContainer = document.querySelector('#upload-container');
const imageContainer = document.querySelector('#image-container');
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
        imageContainer.appendChild(btn);

        btn.addEventListener('click', ev => {
            document.body.appendChild(img);
        });
    }

});
