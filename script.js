(function(){
  var target = document.getElementById('qr-target');
  var input = document.getElementById('main-input');
  var inputArea = document.getElementById('input-area');
  var label = document.getElementById('input-label');
  var inputHint = document.getElementById('input-hint');

  var wifiExtra = document.getElementById('wifi-extra');
  var wifiPass = document.getElementById('wifi-pass');
  var wifiEnc = document.getElementById('wifi-enc');
  var wifiToggle = document.getElementById('wifi-pass-toggle');

  var vcardExtra = document.getElementById('vcard-extra');
  var vcName = document.getElementById('vc-name');
  var vcPhone = document.getElementById('vc-phone');
  var vcEmail = document.getElementById('vc-email');
  var vcOrg = document.getElementById('vc-org');

  var fgColor = '#15161A';
  var bgColor = '#ffffff';
  var ecLevel = 'M';

  var pngBtn = document.getElementById('download-png-btn');
  var svgBtn = document.getElementById('download-svg-btn');
  var copyBtn = document.getElementById('copy-btn');
  var clearBtn = document.getElementById('clear-btn');
  var charCounter = document.getElementById('char-counter');
  var printHint = document.getElementById('print-hint');
  var tabs = document.querySelectorAll('.tab');
  var currentType = 'url';
  var currentQr = null;

  var placeholders = {
    url: {label:'Website address', ph:'https://example.com'},
    email: {label:'Email address', ph:'name@example.com'},
    phone: {label:'Phone number', ph:'+1 555 123 4567'},
    wifi: {label:'Network name (SSID)', ph:'MyWiFiNetwork'}
  };

  var extraPanels = { wifi: wifiExtra, vcard: vcardExtra };
  var typesWithoutMainInput = { vcard:true };

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){t.classList.remove('active');});
      tab.classList.add('active');
      currentType = tab.dataset.type;

      inputArea.style.display = typesWithoutMainInput[currentType] ? 'none' : 'block';
      if(placeholders[currentType]){
        label.textContent = placeholders[currentType].label;
        input.placeholder = placeholders[currentType].ph;
      }
      Object.keys(extraPanels).forEach(function(k){
        extraPanels[k].style.display = (k === currentType) ? (k === 'wifi' ? 'grid' : 'block') : 'none';
      });
      input.value = '';
      input.classList.remove('invalid');
      inputHint.textContent = '';
      render();
    });
  });

  function buildPayload(){
    switch(currentType){
      case 'email': { var v = input.value.trim(); return v ? 'mailto:' + v : ''; }
      case 'phone': { var v = input.value.trim(); return v ? 'tel:' + v : ''; }
      case 'wifi': {
        var v = input.value.trim();
        if(!v) return '';
        return 'WIFI:T:' + wifiEnc.value + ';S:' + v + ';P:' + wifiPass.value + ';;';
      }
      case 'vcard': {
        if(!vcName.value.trim()) return '';
        return 'BEGIN:VCARD\nVERSION:3.0\nN:;' + vcName.value + ';;;\nFN:' + vcName.value +
          (vcPhone.value ? '\nTEL:' + vcPhone.value : '') +
          (vcEmail.value ? '\nEMAIL:' + vcEmail.value : '') +
          (vcOrg.value ? '\nORG:' + vcOrg.value : '') + '\nEND:VCARD';
      }
      default: { var v = input.value.trim(); return v; }
    }
  }

  function validate(){
    input.classList.remove('invalid');
    inputHint.textContent = '';
    inputHint.classList.remove('warn');
    var v = input.value.trim();
    if(!v) return;
    if(currentType === 'url'){
      if(!/^https?:\/\//i.test(v)){
        input.value = 'https://' + v;
      }
    } else if(currentType === 'phone'){
      var ok = /^[+]?[\d\s()-]{6,20}$/.test(v);
      if(!ok){
        input.classList.add('invalid');
        inputHint.textContent = 'Check the phone number format';
        inputHint.classList.add('warn');
      }
    }
  }
  input.addEventListener('blur', function(){ validate(); render(); });

  function eccMap(level){
    return {L:QRCode.CorrectLevel.L, M:QRCode.CorrectLevel.M, Q:QRCode.CorrectLevel.Q, H:QRCode.CorrectLevel.H}[level];
  }

  function updateCharCounter(payload){
    if(!payload){ charCounter.textContent = ''; charCounter.classList.remove('warn'); return; }
    var len = payload.length;
    charCounter.textContent = len + ' characters';
    charCounter.classList.toggle('warn', len > 300);
    if(len > 300){ charCounter.textContent += ' — very dense code, print it large'; }
  }

  function updatePrintHint(moduleCount){
    if(!moduleCount){ printHint.textContent = ''; return; }
    var cm = Math.max(2, (moduleCount * 0.35) / 10);
    printHint.textContent = 'Readable from about ' + cm.toFixed(1) + ' cm per side';
  }

  function render(){
    var payload = buildPayload();
    target.innerHTML = '';
    currentQr = null;
    if(!payload){
      target.innerHTML = '<span class="empty-hint">Your QR code will appear here</span>';
      pngBtn.disabled = true; svgBtn.disabled = true; copyBtn.disabled = true;
      updateCharCounter(''); updatePrintHint(0);
      return;
    }
    try{
      currentQr = new QRCode(target, {
        text: payload, width: 220, height: 220,
        colorDark: fgColor, colorLight: bgColor, correctLevel: eccMap(ecLevel)
      });
      pngBtn.disabled = false; svgBtn.disabled = false; copyBtn.disabled = false;
      updateCharCounter(payload);
      updatePrintHint(currentQr._oQRCode.moduleCount);
    }catch(e){
      target.innerHTML = '<span class="error-hint">Content is too long to encode</span>';
      pngBtn.disabled = true; svgBtn.disabled = true; copyBtn.disabled = true;
      updateCharCounter(''); updatePrintHint(0);
    }
  }

  wifiToggle.addEventListener('click', function(){
    var isPwd = wifiPass.type === 'text';
    wifiPass.type = isPwd ? 'password' : 'text';
    wifiToggle.textContent = isPwd ? 'show' : 'hide';
  });

  [input, wifiPass, wifiEnc, vcName, vcPhone, vcEmail, vcOrg].forEach(function(el){
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  function getQrCanvas(callback){
    var canvas = target.querySelector('canvas');
    if(canvas){ callback(canvas); return; }
    var img = target.querySelector('img');
    if(img){
      var c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      function draw(){ c.getContext('2d').drawImage(img, 0, 0); callback(c); }
      if(img.complete) draw(); else img.addEventListener('load', draw, {once:true});
    }
  }

  function buildOutputCanvas(callback){
    getQrCanvas(function(source){
      var qrSize = source.width || 220;
      var margin = Math.round(qrSize * 0.18);
      var outSize = qrSize + margin * 2;
      var out = document.createElement('canvas');
      out.width = outSize; out.height = outSize;
      var ctx = out.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outSize, outSize);
      ctx.drawImage(source, margin, margin, qrSize, qrSize);
      callback(out);
    });
  }

  pngBtn.addEventListener('click', function(){
    buildOutputCanvas(function(out){
      var a = document.createElement('a');
      a.href = out.toDataURL('image/png');
      a.download = 'qr-code.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
  });

  svgBtn.addEventListener('click', function(){
    if(!currentQr) return;
    var model = currentQr._oQRCode;
    var count = model.moduleCount;
    var moduleSize = 8;
    var margin = Math.round(count * moduleSize * 0.18);
    var size = count * moduleSize + margin * 2;
    var rects = '';
    for(var r = 0; r < count; r++){
      for(var c = 0; c < count; c++){
        if(model.isDark(r, c)){
          rects += '<rect x="' + (margin + c*moduleSize) + '" y="' + (margin + r*moduleSize) +
            '" width="' + moduleSize + '" height="' + moduleSize + '"/>';
        }
      }
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<rect width="' + size + '" height="' + size + '" fill="' + bgColor + '"/>' +
      '<g fill="' + fgColor + '">' + rects + '</g></svg>';
    var blob = new Blob([svg], {type:'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'qr-code.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyBtn.addEventListener('click', function(){
    buildOutputCanvas(function(out){
      out.toBlob(function(blob){
        if(!blob || !navigator.clipboard || !window.ClipboardItem){
          copyBtn.textContent = 'Not supported';
          setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1600);
          return;
        }
        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function(){
          copyBtn.textContent = 'Copied ✓';
          setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1600);
        }).catch(function(){
          copyBtn.textContent = 'Failed';
          setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1600);
        });
      });
    });
  });

  clearBtn.addEventListener('click', function(){
    [input, wifiPass, vcName, vcPhone, vcEmail, vcOrg].forEach(function(el){ el.value = ''; });
    input.classList.remove('invalid');
    inputHint.textContent = '';
    render();
  });
})();
