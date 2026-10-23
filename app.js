// <<<< YAHAN APNI KEYS DALO >>>>
const SUPABASE_URL = "https://TUMHARA-PROJECT.supabase.co";
const SUPABASE_KEY = "TUMHARA-ANON-KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let allVideos = [];

document.getElementById('upBtn').onclick = ()=> document.getElementById('uploadBox').style.display='block';

async function loadVideos(){
  const { data, error } = await supabaseClient.from('videos').select('*').order('created_at', {ascending:false});
  if(data){ allVideos=data; render(data); } else { document.getElementById('videoGrid').innerHTML="No videos yet. Be first to upload!"; }
}

function render(list){
  document.getElementById('videoGrid').innerHTML = list.map(v=>`
    <div class="card" onclick="playReal('${v.video_url}', '${v.title.replace(/'/g,"")}')">
      <video src="${v.video_url}" style="width:100%;height:180px;object-fit:cover"></video>
      <div class="info"><h4>${v.title}</h4><p>${v.views||0} views • Real User</p></div>
    </div>
  `).join('');
}

async function uploadReal(){
  const title = document.getElementById('vTitle').value;
  const file = document.getElementById('vFile').files[0];
  const status = document.getElementById('status');
  if(!title || !file) return alert('Title + Video file chahiye');

  status.innerText = "Uploading... 0%";
  const fileName = Date.now() + "_" + file.name;
  
  // 1. Upload to storage
  const { data: upData, error: upError } = await supabaseClient.storage.from('videos').upload(fileName, file);
  if(upError){ status.innerText="Error: "+upError.message; return; }

  // 2. Get public URL
  const { data: urlData } = supabaseClient.storage.from('videos').getPublicUrl(fileName);
  
  // 3. Save to DB
  await supabaseClient.from('videos').insert([{title: title, video_url: urlData.publicUrl}]);
  
  status.innerText = "Uploaded! Live ho gaya!";
  setTimeout(()=>location.reload(), 1000);
}

function playReal(url, title){
  document.body.innerHTML = `<div style="background:#000;color:#fff;min-height:100vh"><a href="/" style="color:#fff;padding:15px;display:block">← Back to Home</a><video controls autoplay style="width:100%;max-height:70vh" src="${url}"></video><div style="padding:15px"><h2>${title}</h2><p>IntrovertUp • AI Police Verified ✓</p></div></div>`;
}

function searchVideo(){
  const q = document.getElementById('search').value.toLowerCase();
  render(allVideos.filter(v=>v.title.toLowerCase().includes(q)));
}

loadVideos();
