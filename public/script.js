const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted= true;
var shareBtn = document.querySelector("button#shareScreen");
shareBtn.onclick = shareScreen;

var recBtn = document.querySelector("button#rec");
recBtn.onclick = onBtnRecordClicked;

var stopBtn = document.querySelector("button#stop");
stopBtn.onclick = onBtnStopClicked;

var videoElement = document.querySelector("video");
videoElement.style.backgroundColor = "black";

var downloadLink = document.querySelector("a#downloadLink");

var mediaRecorder;
var localStream = null;
document.getElementById("error").innerHTML = "";

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
}); 
var peer = new Peer(undefined);
let myVideoStream 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream=>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connecToNewUser(userId,stream);
    })
    
    let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });

  socket.on('createMessage',message =>{
      console.log("Create message",message);
      $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`)
      scrollToBottom()
  })
})


peer.on('open', id =>{
    socket.emit('join-room',ROOM_ID,id);
})


const connecToNewUser = (userId,stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
}


const addVideoStream = (video,stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);
} 

const scrollToBottom=() => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }

  // function main() {
  //   const videostream = document.getElementById("videostream");
  //   const startshare = document.getElementById("startshare");
  //   const stopshare = document.getElementById("stopshare");
  
  //   var displayMediaOptions = {
  //     video: {
  //       cursor: "always",
  //     },
  //     audio: false,
  //   };
  
  //   startshare.onclick = function (e) {
  //     startSharing();
  //   };
  //   stopshare.onclick = function (e) {
  //     stopSharing();
  //   };
  
  //   async function startSharing() {
  //     try {
  //       videostream.srcObject = await navigator.mediaDevices.getDisplayMedia(
  //         displayMediaOptions
  //       );
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  
  //     function stopSharing() {
  //       let tracks = videostream.srcObject.getTracks();
  //       tracks.forEach((track) => track.stop());
  //       videostream.srcObject = null;
  //     }
  // }
  
  // main();
  // const start = document.getElementById("start");
  // const stop = document.getElementById("stop");
  // const video = document.querySelector("video");
  // let recorder, stream;
  
  // async function startRecording() {
  //   stream = await navigator.mediaDevices.getDisplayMedia({
  //     video: { mediaSource: "screen" }
  //   });
  //   recorder = new MediaRecorder(stream);
  
  //   const chunks = [];
  //   recorder.ondataavailable = e => chunks.push(e.data);
  //   recorder.onstop = e => {
  //     const completeBlob = new Blob(chunks, { type: chunks[0].type });
  //     video.src = URL.createObjectURL(completeBlob);
  //   };
  
  //   recorder.start();
  // }
  
  // start.addEventListener("click", () => {
  //   start.setAttribute("disabled", true);
  //   stop.removeAttribute("disabled");
  
  //   startRecording();
  // });
  
  // stop.addEventListener("click", () => {
  //   stop.setAttribute("disabled", true);
  //   start.removeAttribute("disabled");
  
  //   recorder.stop();
  //   stream.getVideoTracks()[0].stop();
  // });
  function shareScreen(){
    console.log("shareScreen");
    document.getElementById("error").innerHTML = "";
    var screenConstraints = { video: true, audio: true };
    navigator.mediaDevices.getDisplayMedia(screenConstraints).then(function(screenStream){
      /* use the screen & audio stream */
  
      var micConstraints = {audio:true};
      navigator.mediaDevices.getUserMedia(micConstraints).then(function(micStream) {
        /* use the microphone stream */
  
        //create a new stream in which to pack everything together
        var composedStream = new MediaStream();
  
        //add the screen video stream
        screenStream.getVideoTracks().forEach(function(videoTrack) {
          composedStream.addTrack(videoTrack);
        });
  
        //create new Audio Context
        var context = new AudioContext();
  
        //create new MediaStream destination. This is were our final stream will be.
        var audioDestinationNode = context.createMediaStreamDestination();
  
        //check to see if we have a screen stream and only then add it
        if (screenStream && screenStream.getAudioTracks().length > 0) {
          //get the audio from the screen stream
          const systemSource = context.createMediaStreamSource(screenStream);
  
          //set it's volume (from 0.1 to 1.0)
          const systemGain = context.createGain();
          systemGain.gain.value = 1.0;
  
          //add it to the destination
          systemSource.connect(systemGain).connect(audioDestinationNode);
  
        }
  
        //check to see if we have a microphone stream and only then add it
        if (micStream && micStream.getAudioTracks().length > 0) {
          //get the audio from the microphone stream
          const micSource = context.createMediaStreamSource(micStream);
  
          //set it's volume
          const micGain = context.createGain();
          micGain.gain.value = 1.0;
  
          //add it to the destination
          micSource.connect(micGain).connect(audioDestinationNode);
        }
  
        //add the combined audio stream
        audioDestinationNode.stream.getAudioTracks().forEach(function(audioTrack) {
          composedStream.addTrack(audioTrack);
        });
  
        //pass over to function that shows the stream and activates the recording controls
        onCombinedStreamAvailable(composedStream)
  
      }).catch(function(err) {
        console.log(err);
        document.getElementById("error").innerHTML = "You need a microphone to run the demo";
      });
    }).catch(function(err) {
      console.log(err);
      document.getElementById("error").innerHTML = "You need to share your screen to run the demo";
    });
  }
  
  function onCombinedStreamAvailable(stream) {
    console.log("onCombinedStreamAvailable");
    localStream = stream;
    
    videoElement.srcObject = localStream;
    videoElement.play();
    videoElement.muted = true;
    recBtn.disabled = false;
    shareBtn.disabled = true;
    stopBtn.disabled = true;
  }
  
  function onBtnRecordClicked() {
    console.log("onBtnRecordClicked");
    if (localStream != null) {
      mediaRecorder = new MediaRecorder(localStream);
      mediaRecorder.onstop = function() {
        console.log("mediaRecorder.onstop");
        
        var blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];
        var videoURL = window.URL.createObjectURL(blob);
  
        downloadLink.href = videoURL;
        videoElement.src = videoURL;
        downloadLink.innerHTML = "Download video file";
      }
      
      let chunks = [];
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      }
  
      mediaRecorder.start(2);
      console.log(mediaRecorder.state);
      
      recBtn.style.background = "red";
      recBtn.style.color = "black";
      
      recBtn.disabled = true;
      shareBtn.disabled = true;
      stopBtn.disabled = false;
    }else{
      console.log("localStream is missing");
    }
  }
  
  function onBtnStopClicked(){
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
    recBtn.style.background = "";
    recBtn.style.color = "";
  }