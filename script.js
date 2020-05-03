const video = document.getElementById("video");
const glasses = loadGlasses();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"
  ),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    drawGlasses(resizedDetections, canvas);
  }, 100);
});

function loadGlasses() {
  const i = new Image();
  i.src =
    "https://raw.githubusercontent.com/ewajs/faceapi-demo/master/glasses.png";
  return i;
}

function drawGlasses(resizedDetections, canvas) {
  const ctx = canvas.getContext("2d");
  const landmarks = resizedDetections[0].landmarks;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const eyes = landmarks.getLeftEye().concat(landmarks.getRightEye());
  let y = 0,
    x = 0;
  eyes.forEach((eye) => {
    x += eye._x;
    y += eye._y;
  });
  x = x / eyes.length;
  y = y / eyes.length;
  console.log("Inferred Center @ x: ", x, ", y: ", y);
  const scale = landmarks.imageWidth / glasses.width;
  const x_image = x - (scale * glasses.width) / 2;
  const y_image = y - scale * glasses.height * 0.45;
  ctx.drawImage(
    glasses,
    x_image,
    y_image,
    scale * glasses.width,
    scale * glasses.height
  );
  console.log(resizedDetections[0].landmarks);
}
