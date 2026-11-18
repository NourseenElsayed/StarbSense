// Local camera framing and image-quality guidance.
// Technical setup support only; not a medical screening or diagnostic tool.
const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

export function inspectFaceGeometry(landmarks, matrixData = null) {
  if (!Array.isArray(landmarks) || landmarks.length < 478) {
    return { face_detected: 0, face_center_x: null, face_center_y: null,
      face_width_norm: null, face_height_norm: null, head_yaw_proxy_deg: null,
      head_pitch_proxy_deg: null, head_roll_proxy_deg: null,
      both_iris_landmarks_available: 0 };
  }
  const xs = landmarks.map(p => finite(p?.x)).filter(v => v !== null);
  const ys = landmarks.map(p => finite(p?.y)).filter(v => v !== null);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const matrix = Array.isArray(matrixData) && matrixData.length >= 16
    ? matrixData.slice(0, 16).map(finite) : null;
  let yaw = null, pitch = null, roll = null;
  if (matrix && matrix.every(v => v !== null)) {
    const cols = [[matrix[0],matrix[1],matrix[2]],[matrix[4],matrix[5],matrix[6]],[matrix[8],matrix[9],matrix[10]]];
    const lengths = cols.map(c => Math.hypot(...c));
    if (lengths.every(v => Number.isFinite(v) && v > 1e-8)) {
      const r00=cols[0][0]/lengths[0], r10=cols[0][1]/lengths[0], r20=cols[0][2]/lengths[0];
      const r21=cols[1][2]/lengths[1], r22=cols[2][2]/lengths[2];
      yaw=Math.atan2(-r20,Math.hypot(r00,r10))*180/Math.PI;
      pitch=Math.atan2(r21,r22)*180/Math.PI;
      roll=Math.atan2(r10,r00)*180/Math.PI;
    }
  }
  return {
    face_detected: 1,
    face_center_x: Number(((minX+maxX)/2).toFixed(6)),
    face_center_y: Number(((minY+maxY)/2).toFixed(6)),
    face_width_norm: Number((maxX-minX).toFixed(6)),
    face_height_norm: Number((maxY-minY).toFixed(6)),
    head_yaw_proxy_deg: yaw===null?null:Number(yaw.toFixed(3)),
    head_pitch_proxy_deg: pitch===null?null:Number(pitch.toFixed(3)),
    head_roll_proxy_deg: roll===null?null:Number(roll.toFixed(3)),
    both_iris_landmarks_available: landmarks[468] && landmarks[473] ? 1 : 0
  };
}

export function startCameraQualityMonitor({ video, landmarker, canvas, onUpdate }) {
  const ctx=canvas?.getContext("2d");
  const lightCanvas=document.createElement("canvas");
  lightCanvas.width=48; lightCanvas.height=27;
  const lightCtx=lightCanvas.getContext("2d",{willReadFrequently:true});
  let raf=null, lastRun=0, stable=0, stopped=false;
  let latest={ready:false,stable_frames:0,code:"waiting"};

  function draw(landmarks, geometry, ready) {
    if (!ctx || !canvas) return;
    const w=video.videoWidth||640, h=video.videoHeight||360;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(w,0); ctx.scale(-1,1);
    ctx.strokeStyle=ready?"#22c55e":"#f59e0b"; ctx.lineWidth=Math.max(2,w/420);
    ctx.setLineDash([10,7]); ctx.strokeRect(w*.24,h*.12,w*.52,h*.76); ctx.setLineDash([]);
    if(landmarks&&geometry.face_detected){
      const x=geometry.face_center_x*w-geometry.face_width_norm*w/2;
      const y=geometry.face_center_y*h-geometry.face_height_norm*h/2;
      ctx.strokeRect(x,y,geometry.face_width_norm*w,geometry.face_height_norm*h);
      for (const contour of [[33,160,158,133,153,144],[362,385,387,263,373,380]]) {
        ctx.beginPath();
        contour.forEach((index, position) => {
          const point = landmarks[index];
          if (!point) return;
          if (position === 0) ctx.moveTo(point.x * w, point.y * h);
          else ctx.lineTo(point.x * w, point.y * h);
        });
        ctx.closePath();
        ctx.stroke();
      }
      for(const i of [468,473]){const p=landmarks[i];if(!p)continue;ctx.beginPath();ctx.arc(p.x*w,p.y*h,Math.max(5,w/100),0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
  }

  function tick(now) {
    if(stopped)return;
    raf=requestAnimationFrame(tick);
    if(!video||video.readyState<2||now-lastRun<180)return;
    lastRun=now;
    let landmarks=null,matrix=null,brightness=null;
    try{
      const result=landmarker.detectForVideo(video,now);
      landmarks=result.faceLandmarks?.[0]??null;
      const raw=result.facialTransformationMatrixes?.[0]?.data;
      matrix=raw?Array.from(raw):null;
      if(lightCtx){
        lightCtx.drawImage(video,0,0,48,27);
        const pixels=lightCtx.getImageData(0,0,48,27).data;
        let sum=0,n=0;
        for(let i=0;i<pixels.length;i+=16){sum+=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];n++;}
        brightness=n?sum/n:null;
      }
    }catch(error){
      stable=0;latest={ready:false,stable_frames:0,code:"processing_error"};onUpdate?.(latest);return;
    }
    const g=inspectFaceGeometry(landmarks,matrix);
    let code="ready";
    if(!landmarks)code="no_face";
    else if(g.face_width_norm<.24)code="too_far";
    else if(g.face_width_norm>.78)code="too_close";
    else if(g.face_center_x<.32||g.face_center_x>.68||g.face_center_y<.22||g.face_center_y>.78)code="center_face";
    else if(!g.both_iris_landmarks_available)code="eyes_not_clear";
    else if((g.head_yaw_proxy_deg!==null&&Math.abs(g.head_yaw_proxy_deg)>20)||(g.head_pitch_proxy_deg!==null&&Math.abs(g.head_pitch_proxy_deg)>20)||(g.head_roll_proxy_deg!==null&&Math.abs(g.head_roll_proxy_deg)>15))code="head_straight";
    else if(brightness!==null&&(brightness<35||brightness>228))code="lighting";
    stable=code==="ready"?stable+1:0;
    latest={...g,ready:stable>=6,stable_frames:stable,code,mean_brightness:brightness===null?null:Number(brightness.toFixed(2))};
    draw(landmarks,g,latest.ready);onUpdate?.(latest);
  }
  raf=requestAnimationFrame(tick);
  return {
    stop(){stopped=true;if(raf!==null)cancelAnimationFrame(raf);if(ctx&&canvas)ctx.clearRect(0,0,canvas.width,canvas.height);},
    getLatest(){return latest;}
  };
}
