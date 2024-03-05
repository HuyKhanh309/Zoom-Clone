const APP_ID = "a4bd2dffbe8a488eb483d089977602aa";
const TOKEN =
  "007eJxTYPj+NubjPIXE2rW/vTL87yzNe2w4c0Fs2/8kiclh8ndM+EoUGBJNklKMUtLSklItEk0sLFKTTCyMUwwsLC3Nzc0MjBIT/3s/T20IZGQQCTnDysgAgSA+C0NuYmYeAwMA6xkhNg==";
const CHANNEL = "main";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

const joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  const UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="video-player" id="user-${UID}"><div>
                <div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

const joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};
const handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"><div>
                <div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

const handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

const leaveAndRemoteLocalStream = async () => {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }
  await client.leave();
  document.getElementById("join-btn").style.display = "block";
  document.getElementById("stream-controls").style.display = "none";
  document.getElementById("video-streams").innerHTML = "";
};

const toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style.backgroundColor = "cadeblue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "Mic off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

const toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Camera on";
    e.target.style.backgroundColor = "cadeblue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Camera off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

document.getElementById("join-btn").addEventListener("click", joinStream);
document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoteLocalStream);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);
