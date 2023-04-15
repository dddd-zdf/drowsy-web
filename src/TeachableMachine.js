import React, { useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

const TeachableMachine = () => {
  const webcamRef = useRef(null);
  const labelContainerRef = useRef(null);

  const URL = 'https://teachablemachine.withgoogle.com/models/-TBuP1naF/';
  let model, webcam;
  let isIos = false;

  if (window.navigator.userAgent.indexOf('iPhone') > -1 ||window.navigator.userAgent.indexOf('iPad') > -1) {isIos = true;}

  const init = useCallback(async () => {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);

    const flip = true;
    const width = 200;
    const height = 200;
    webcam = new tmImage.Webcam(width, height, flip);
    await webcam.setup();

    if (isIos) {
      webcamRef.current.appendChild(webcam.webcam);
      const webCamVideo = document.getElementsByTagName('video')[0];
      webCamVideo.setAttribute('playsinline', true);
      webCamVideo.muted = 'true';
      webCamVideo.style.width = width + 'px';
      webCamVideo.style.height = height + 'px';
    } else {
      webcamRef.current.appendChild(webcam.canvas);
    }

    labelContainerRef.current.appendChild(document.createElement('div'));
    webcam.play();
    window.requestAnimationFrame(loop);
  }, []);

  const loop = useCallback(async () => {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }, []);

  const predict = useCallback(async () => {
    let prediction;
    if (isIos) {
      prediction = await model.predict(webcam.webcam);
    } else {
      prediction = await model.predict(webcam.canvas);
    }
  
    const higherClassIndex = prediction[0].probability > prediction[1].probability ? 0 : 1;  
    labelContainerRef.current.childNodes[0].innerHTML = prediction[higherClassIndex].className;
  }, []);
  

  useEffect(() => {
    init();

    return () => {
      if (webcam) {
        webcam.stop();
      }
    };
  }, [init]);

  return (
    <div>
      <div>Drowsiness Detection</div>
      <div ref={webcamRef}></div>
      <div ref={labelContainerRef}></div>
    </div>
  );
};

export default TeachableMachine;
