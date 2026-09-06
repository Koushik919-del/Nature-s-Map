var map;
function openMap() {
    document.getElementById('map-section').style.display = 'block';
    if (!map) {
        map = L.map('map').setView([20.0, 0.0], 2);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri', maxZoom: 18
        }).addTo(map);
        
        var animals = [
            { name: 'Bengal Tiger', lat: 25.0, lon: 80.0, region: 'India', icon: '🐯' },
            { name: 'African Elephant', lat: -2.0, lon: 36.0, region: 'Kenya', icon: '🐘' },
            { name: 'Giant Panda', lat: 30.0, lon: 102.0, region: 'China', icon: '🐼' },
            { name: 'Grizzly Bear', lat: 44.0, lon: -110.0, region: 'Yellowstone, USA', icon: '🐻' },
            { name: 'Polar Bear', lat: 75.0, lon: -40.0, region: 'Arctic', icon: '🐻‍❄️' },
            { name: 'Kangaroo', lat: -25.0, lon: 135.0, region: 'Australia', icon: '🦘' },
            { name: 'Jaguar', lat: -10.0, lon: -60.0, region: 'Amazon Rainforest', icon: '🐆' },
            { name: 'Mountain Gorilla', lat: -1.0, lon: 29.0, region: 'Rwanda', icon: '🦍' },
            { name: 'Giraffe', lat: -3.0, lon: 37.0, region: 'Tanzania', icon: '🦒' },
            { name: 'African Lion', lat: -2.0, lon: 35.0, region: 'Serengeti', icon: '🦁' }
        ];

        for (var i = 0; i < animals.length; i++) {
            var a = animals[i];
            L.marker([a.lat, a.lon], {
                icon: L.divIcon({
                    html: '<div style="font-size: 28px;">' + a.icon + '</div>',
                    className: 'animal-marker', iconSize: [30, 30], iconAnchor: [15, 15]
                })
            }).addTo(map).bindPopup('<b>' + a.name + '</b><br>Region: ' + a.region);
        }
    } else {
        setTimeout(function() { map.invalidateSize(); }, 100);
    }
}
function closeMap() { document.getElementById('map-section').style.display = 'none'; }

function switchCam(animalName, youtubeId) {
    var iframe = document.getElementById('live-cam-iframe');
    var title = document.getElementById('cam-title');
    iframe.src = "https://www.youtube.com/embed/" + youtubeId + "?autoplay=1";
    title.innerText = "Now Watching: " + animalName;
    var btns = document.getElementsByClassName('animal-btn');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); }
    event.currentTarget.classList.add('active');
}

var OR_KEY = "YOUR_OPENROUTER_API_KEY";
var AI_MODELS = ['openai/gpt-oss-120b:free', 'openai/gpt-oss-20b:free', 'google/gemma-3-27b-it:free', 'meta-llama/llama-3.3-8b-instruct:free'];

function callAI(messages, cb) {
    var lastErr = 'Request failed';
    var modelIndex = 0;
    function tryNext() {
        if (modelIndex >= AI_MODELS.length) { cb(null, lastErr); return; }
        var model = AI_MODELS[modelIndex]; modelIndex++;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "https://openrouter.ai/api/v1/chat/completions", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + OR_KEY);
        xhr.setRequestHeader('HTTP-Referer', window.location.href);
        xhr.setRequestHeader('X-Title', 'Natures Map');
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.choices && data.choices[0] && data.choices[0].message) { cb(data.choices[0].message.content, null); return; }
                } catch (e) {}
            }
            tryNext();
        };
        xhr.onerror = function() { tryNext(); };
        xhr.send(JSON.stringify({ model: model, messages: messages }));
    }
    tryNext();
}

var jHistory = [];
var jSys = "You are MrBunny, an AI assistant made by Koushik Tummepalli for Nature's Map. Help people learn about animals, biomes, and conservation. Stay focused on wildlife, nature, and geography. Be warm, concise, and practical. ALWAYS BE PG_13!";

function scrollJ() { var m = document.getElementById('bmsgs'); m.scrollTop = m.scrollHeight; }
function addJBub(role, text) {
    var mDiv = document.getElementById('bmsgs');
    var row = document.createElement('div');
    row.className = role === 'user' ? 'bwu' : 'bwb';
    var lbl = document.createElement('div');
    lbl.className = role === 'user' ? 'blu' : 'blb';
    lbl.innerText = role === 'user' ? 'You' : 'MrBunny';
    var bub = document.createElement('div');
    bub.className = role === 'user' ? 'busr' : 'bbot';
    bub.innerText = text;
    row.appendChild(lbl); row.appendChild(bub);
    mDiv.appendChild(row);
    scrollJ();
}
function setJTyping(on) {
    var mDiv = document.getElementById('bmsgs');
    var ex = document.getElementById('btyp');
    if (on && !ex) {
        var t = document.createElement('div');
        t.id = 'btyp'; t.className = 'btyp';
        t.innerText = 'MrBunny is processing...';
        mDiv.appendChild(t); scrollJ();
    } else if (!on && ex) { ex.remove(); }
}

document.getElementById('mrbunny-fab').addEventListener('click', function() {
    var panel = document.getElementById('mrbunny-panel');
    panel.classList.toggle('bopen');
    if (panel.classList.contains('bopen')) {
        document.getElementById('binp').focus();
    }
});

function sendMsg() {
    var inp = document.getElementById('binp');
    var btn = document.getElementById('bbtn');
    var text = inp.value.trim();
    if (!text) return;

    inp.value = ''; inp.disabled = true; btn.disabled = true;
    addJBub('user', text);

    var messages = [{role: 'system', content: jSys}];
    for (var i = 0; i < jHistory.length; i++) {
        messages.push({role: jHistory[i].role, content: jHistory[i].content});
    }
    messages.push({role: 'user', content: text});

    setJTyping(true);

    if (!OR_KEY || OR_KEY === "YOUR_OPENROUTER_API_KEY") {
        setJTyping(false);
        addJBub('assistant', 'I require an OpenRouter API key to connect to the mainframe.');
        inp.disabled = false; btn.disabled = false; inp.focus();
        return;
    }

    callAI(messages, function(reply, err) {
        setJTyping(false);
        if (err) {
            addJBub('assistant', 'My apologies. The network is experiencing interference.');
        } else {
            addJBub('assistant', reply);
            jHistory.push({role: 'user', content: text});
            jHistory.push({role: 'assistant', content: reply});
        }
        inp.disabled = false; btn.disabled = false; inp.focus();
    });
}

document.getElementById('bbtn').addEventListener('click', sendMsg);
document.getElementById('binp').addEventListener('keydown', function(e){ if(e.key === 'Enter') sendMsg(); });
