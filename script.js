const video = document.getElementById("video");
const glasses = loadGlasses();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("https://raw.githubusercontent.com/ewajs/faceapi-demo/master/models"),
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
  i.src = "glasses.png";
  return i;
}

function drawGlasses(resizedDetections, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const eyes = resizedDetections[0].landmarks
    .getLeftEye()
    .concat(resizedDetections[0].landmarks.getRightEye());
  let y = 0,
    x = 0;
  eyes.forEach((eye) => {
    x += eye._x;
    y += eye._y;
  });
  x = x / eyes.length;
  y = y / eyes.length;
  console.log("Drawing Circle at x: ", x, ", y: ", y);
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
}
