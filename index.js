const getAccessBtn = document.getElementById('get-feed-btn');
const videoEle = document.getElementById('video-feed');
const canvasEle = document.getElementById('segmented-feed');

const personContext = canvasEle.getContext('2d');

let camAnimation;
let net;


getAccessBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            videoEle.srcObject = stream;
            videoEle.play();
            initBodyPix();
            videoEle.addEventListener('loadedmetadata', () => {
                initBodyPix();
            })
        });
})

const initBodyPix = () => {
    bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 1.0,
        quantBytes: 2
    })
        .then(netObject => {
            net = netObject;
            startSegmentation();
        })
        .catch(err => {
            console.log('Error', err);
        });
}

const drawPerson = (personSegmentation) => {
    personContext.drawImage(videoEle, 0, 0, 250, 250);
    const imageData = personContext.getImageData(0, 0, 250, 250);
    var pixel = imageData.data;
    for (var p = 0; p < pixel.length; p += 4) {
        if (personSegmentation.data[p / 4] === 0) {
            pixel[p + 3] = 0;
        }
    }
    personContext.imageSmoothingEnabled = true;
    personContext.putImageData(imageData, 0, 0);
}

const startSegmentation = () => {
    net.segmentPerson(videoEle, {
        flipHorizontal: true,
        internalResolution: 'full',
        segmentationThreshold: 0.7
    })
        .then(segmentationData => {
            // console.log("Segmentation Data", segmentationData);
            drawPerson(segmentationData);
        })
        .catch(err => {
            console.log("Segmentation error", err);
        })
    cameraAnimation = requestAnimationFrame(startSegmentation);
}