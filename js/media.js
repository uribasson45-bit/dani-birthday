// ============================================================
// CLOUD MEDIA
// ============================================================

// Converts a cloud media key such as:
//   images/image_0.jpg
// into the Netlify Function URL that serves the file.
//
// Example:
//   images/image_0.jpg
//   ↓
//   /.netlify/functions/media?key=images%2Fimage_0.jpg
function resolveCloudMediaUrl(mediaKey) {
  if (!mediaKey) return null;

  return (
    '/.netlify/functions/media?key=' +
    encodeURIComponent(mediaKey)
  );
}


// ============================================================
// BUILD VIEW ELEMENT
// ============================================================

function buildViewElement(e) {
  var wrap = document.createElement('div');
  var st = ensureStyle(e);

  // ----------------------------------------------------------
  // HEADING
  // ----------------------------------------------------------

  if (e.type === 'heading') {
    wrap.className = 'el-text';

    var h1 = document.createElement('h1');

    h1.textContent = e.value;

    wrap.appendChild(h1);

    applyElementStyle(
      wrap,
      h1,
      st
    );
  }


  // ----------------------------------------------------------
  // SUBHEADING
  // ----------------------------------------------------------

  else if (e.type === 'subheading') {
    wrap.className = 'el-text';

    var h2 = document.createElement('h2');

    h2.textContent = e.value;

    wrap.appendChild(h2);

    applyElementStyle(
      wrap,
      h2,
      st
    );
  }


  // ----------------------------------------------------------
  // TEXT
  // ----------------------------------------------------------

  else if (e.type === 'text') {
    wrap.className = 'el-text';

    var p = document.createElement('p');

    p.innerHTML = escHtml(e.value)
      .replace(/\n/g, '<br>');

    wrap.appendChild(p);

    applyElementStyle(
      wrap,
      p,
      st
    );
  }


  // ----------------------------------------------------------
  // SUBTITLE
  // ----------------------------------------------------------

  else if (e.type === 'subtitle') {
    wrap.className = 'el-text';

    var sd = document.createElement('div');

    sd.className = 'subtitle';
    sd.textContent = e.value;

    wrap.appendChild(sd);

    applyElementStyle(
      wrap,
      sd,
      st
    );
  }


  // ==========================================================
  // IMAGE
  // ==========================================================

  else if (e.type === 'image') {
    wrap.className = 'el-image';

    var size = e.size || 'medium';
    var s = IMG_SIZES[size] || IMG_SIZES.medium;

    wrap.style.maxWidth = s.maxW;
    wrap.style.maxHeight = s.maxH;

    applyElementStyle(
      wrap,
      null,
      st
    );

    var imgHolder = document.createElement('div');

    /*
     * Media priority:
     *
     * 1. mediaKey → Netlify Cloud
     * 2. mediaId  → local IndexedDB
     * 3. src      → normal external URL
     */

    if (
      e.mediaKey ||
      e.mediaId ||
      e.src
    ) {
      var img = document.createElement('img');

      img.loading = 'lazy';
      img.alt = e.alt || '';

      imgHolder.appendChild(img);

      // CLOUD MEDIA
      if (e.mediaKey) {
        var cloudImageUrl =
          resolveCloudMediaUrl(e.mediaKey);

        if (cloudImageUrl) {
          img.src = cloudImageUrl;
        }
      }

      // LOCAL INDEXEDDB MEDIA
      else if (e.mediaId) {
        resolveMediaUrl(
          e.mediaId
        ).then(function(url) {
          if (url) {
            img.src = url;
          }
        });
      }

      // NORMAL URL
      else if (e.src) {
        img.src = e.src;
      }
    }

    else {
      imgHolder.innerHTML =
        '<div class="img-placeholder">' +

          '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
            '<rect x="3" y="3" width="18" height="18" rx="3"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<path d="m21 15-5-5L5 21"/>' +
          '</svg>' +

          '<span>תמונה</span>' +

        '</div>';
    }

    wrap.appendChild(imgHolder);


    // --------------------------------------------------------
    // IMAGE SIZE CONTROLS
    // --------------------------------------------------------

    var bar = document.createElement('div');

    bar.className = 'img-resize-bar';

    var sizeOrder = [
      'small',
      'medium',
      'large',
      'full'
    ];

    var curIdx = sizeOrder.indexOf(size);


    // Minus

    var btnMinus = document.createElement('button');

    btnMinus.className = 'img-resize-btn';
    btnMinus.textContent = '−';
    btnMinus.title = 'הקטן';

    btnMinus.disabled =
      (curIdx === 0);

    (function(eRef, idx) {

      btnMinus.addEventListener(
        'click',
        function() {

          var p =
            state.pages[
              state.currentPage
            ];

          var target =
            p &&
            p.elements.find(
              function(x) {
                return x.id === eRef.id;
              }
            );

          if (
            target &&
            idx > 0
          ) {
            target.size =
              sizeOrder[idx - 1];

            renderViewer();
          }
        }
      );

    })(e, curIdx);


    // Label

    var lbl =
      document.createElement('span');

    lbl.className =
      'img-size-label';

    lbl.textContent =
      s.label;


    // Plus

    var btnPlus =
      document.createElement('button');

    btnPlus.className =
      'img-resize-btn';

    btnPlus.textContent = '+';
    btnPlus.title = 'הגדל';

    btnPlus.disabled =
      (
        curIdx ===
        sizeOrder.length - 1
      );

    (function(eRef, idx) {

      btnPlus.addEventListener(
        'click',
        function() {

          var p =
            state.pages[
              state.currentPage
            ];

          var target =
            p &&
            p.elements.find(
              function(x) {
                return x.id === eRef.id;
              }
            );

          if (
            target &&
            idx <
            sizeOrder.length - 1
          ) {
            target.size =
              sizeOrder[idx + 1];

            renderViewer();
          }
        }
      );

    })(e, curIdx);


    bar.appendChild(btnMinus);
    bar.appendChild(lbl);
    bar.appendChild(btnPlus);

    wrap.appendChild(bar);
  }


  // ==========================================================
  // AUDIO
  // ==========================================================

  else if (e.type === 'audio') {
    wrap.className = 'el-audio';

    applyElementStyle(
      wrap,
      null,
      st
    );

    var aid =
      'audio_' + e.id;

    wrap.innerHTML =

      '<div class="audio-title">' +
        '♪ ' +
        escHtml(
          e.label || 'מוזיקה'
        ) +
      '</div>' +

      '<audio id="' +
        aid +
        '" preload="metadata">' +
      '</audio>' +

      '<div class="audio-controls">' +

        '<button class="audio-btn" ' +
          'data-aid="' + aid + '" ' +
          'data-action="playpause">' +

          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:var(--navy-deep)">' +
            '<polygon points="5,3 19,12 5,21"/>' +
          '</svg>' +

        '</button>' +

        '<div class="audio-progress-wrap">' +

          '<input ' +
            'type="range" ' +
            'class="audio-track" ' +
            'data-aid="' + aid + '" ' +
            'min="0" ' +
            'max="100" ' +
            'value="0" ' +
            'step="0.1">' +

          '<div class="audio-time">' +

            '<span class="audio-cur" data-aid="' +
              aid +
              '">' +
              '0:00' +
            '</span>' +

            '<span class="audio-dur" data-aid="' +
              aid +
              '">' +
              '0:00' +
            '</span>' +

          '</div>' +

        '</div>' +

        '<div class="audio-volume-wrap">' +

          '🔊' +

          '<input ' +
            'type="range" ' +
            'class="audio-volume" ' +
            'data-aid="' + aid + '" ' +
            'min="0" ' +
            'max="100" ' +
            'value="' +
              (
                e.volume != null
                  ? e.volume
                  : 100
              ) +
            '">' +

        '</div>' +

        '<button ' +
          'class="audio-restart" ' +
          'data-aid="' + aid + '" ' +
          'data-action="restart">' +
          '↺' +
        '</button>' +

      '</div>';


    var audioTag =
      wrap.querySelector(
        '#' + aid
      );


    // CLOUD MEDIA
    if (e.mediaKey) {

      var cloudAudioUrl =
        resolveCloudMediaUrl(
          e.mediaKey
        );

      if (cloudAudioUrl) {
        audioTag.src =
          cloudAudioUrl;
      }

      setTimeout(
        function() {
          initAudioElement(
            aid,
            e.autoplay,
            e.volume
          );
        },
        60
      );
    }


    // LOCAL INDEXEDDB MEDIA
    else if (e.mediaId) {

      resolveMediaUrl(
        e.mediaId
      ).then(function(url) {

        if (url) {

          audioTag.src = url;

          initAudioElement(
            aid,
            e.autoplay,
            e.volume
          );
        }
      });
    }


    // NORMAL URL
    else if (e.src) {

      audioTag.src =
        e.src;

      setTimeout(
        function() {

          initAudioElement(
            aid,
            e.autoplay,
            e.volume
          );

        },
        60
      );
    }


    // EMPTY PLAYER
    else {

      setTimeout(
        function() {

          initAudioElement(
            aid,
            false,
            e.volume
          );

        },
        60
      );
    }
  }


  // ==========================================================
  // VIDEO / YOUTUBE
  // ==========================================================

  else if (e.type === 'video') {
    wrap.className =
      'el-video';

    applyElementStyle(
      wrap,
      null,
      st
    );


    /*
     * src is checked specifically for YouTube.
     *
     * Cloud mediaKey is always handled as a native
     * video file, not as YouTube.
     */

    var srcVal =
      e.src || '';

    var ytId =
      getYouTubeId(
        srcVal
      );


    // --------------------------------------------------------
    // YOUTUBE
    // --------------------------------------------------------

    if (ytId) {

      var ytWrap =
        document.createElement(
          'div'
        );

      ytWrap.className =
        'yt-wrap';


      var params =
        'rel=0&modestbranding=1' +
        (
          e.autoplay
            ? '&autoplay=1&mute=1'
            : ''
        );


      var iframe =
        document.createElement(
          'iframe'
        );

      iframe.src =
        'https://www.youtube.com/embed/' +
        ytId +
        '?' +
        params;


      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      );

      iframe.setAttribute(
        'allowfullscreen',
        ''
      );

      iframe.setAttribute(
        'loading',
        'lazy'
      );

      iframe.frameBorder = '0';


      ytWrap.appendChild(
        iframe
      );

      wrap.appendChild(
        ytWrap
      );


      if (e.label) {

        var td =
          document.createElement(
            'div'
          );

        td.className =
          'video-title';

        td.textContent =
          '▶ ' +
          e.label;

        wrap.appendChild(
          td
        );
      }
    }


    // --------------------------------------------------------
    // NATIVE VIDEO
    // Cloud / IndexedDB / URL
    // --------------------------------------------------------

    else if (
      e.mediaKey ||
      e.mediaId ||
      e.src
    ) {

      var vid =
        document.createElement(
          'video'
        );

      vid.controls = true;
      vid.playsInline = true;

      vid.setAttribute(
        'playsinline',
        ''
      );

      vid.setAttribute(
        'webkit-playsinline',
        ''
      );

      vid.setAttribute(
        'x5-playsinline',
        ''
      );

      vid.preload =
        'metadata';


      if (e.autoplay) {

        vid.autoplay = true;
        vid.muted = true;

        vid.setAttribute(
          'muted',
          ''
        );
      }


      wrap.appendChild(
        vid
      );


      // CLOUD MEDIA
      if (e.mediaKey) {

        var cloudVideoUrl =
          resolveCloudMediaUrl(
            e.mediaKey
          );

        if (cloudVideoUrl) {
          vid.src =
            cloudVideoUrl;
        }
      }


      // LOCAL INDEXEDDB MEDIA
      else if (e.mediaId) {

        resolveMediaUrl(
          e.mediaId
        ).then(function(url) {

          if (url) {
            vid.src = url;
          }

        });
      }


      // NORMAL URL
      else if (e.src) {

        vid.src =
          e.src;
      }


      if (e.label) {

        var tdv =
          document.createElement(
            'div'
          );

        tdv.className =
          'video-title';

        tdv.textContent =
          '▶ ' +
          e.label;

        wrap.appendChild(
          tdv
        );
      }
    }


    // --------------------------------------------------------
    // EMPTY VIDEO
    // --------------------------------------------------------

    else {

      wrap.innerHTML =

        '<div class="video-placeholder">' +

          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +

            '<rect x="2" y="4" width="20" height="16" rx="3"/>' +

            '<polygon points="10,9 10,15 15,12" fill="currentColor"/>' +

          '</svg>' +

          '<span>וידאו / YouTube</span>' +

        '</div>';
    }
  }


  return wrap;
}


// ============================================================
// AUDIO INIT
// play/pause, progress, time, volume, restart
// ============================================================

function initAudioElement(
  aid,
  autoplay,
  initialVolume
) {

  var audio =
    document.getElementById(
      aid
    );

  if (!audio) return;


  var playBtn =
    document.querySelector(
      '[data-aid="' +
      aid +
      '"][data-action="playpause"]'
    );


  var track =
    document.querySelector(
      'input.audio-track[data-aid="' +
      aid +
      '"]'
    );


  var volumeCtl =
    document.querySelector(
      'input.audio-volume[data-aid="' +
      aid +
      '"]'
    );


  var curEl =
    document.querySelector(
      '.audio-cur[data-aid="' +
      aid +
      '"]'
    );


  var durEl =
    document.querySelector(
      '.audio-dur[data-aid="' +
      aid +
      '"]'
    );


  var restartBtn =
    document.querySelector(
      '[data-aid="' +
      aid +
      '"][data-action="restart"]'
    );


  var playIcon =

    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:var(--navy-deep)">' +

      '<polygon points="5,3 19,12 5,21"/>' +

    '</svg>';


  var pauseIcon =

    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:var(--navy-deep)">' +

      '<rect x="6" y="4" width="4" height="16"/>' +

      '<rect x="14" y="4" width="4" height="16"/>' +

    '</svg>';


  var fmt =
    function(s) {

      return (
        Math.floor(s / 60) +
        ':' +
        String(
          Math.floor(s % 60)
        ).padStart(
          2,
          '0'
        )
      );
    };


  audio.volume =
    (
      initialVolume != null
        ? initialVolume
        : 100
    ) / 100;


  // ----------------------------------------------------------
  // METADATA
  // ----------------------------------------------------------

  audio.addEventListener(
    'loadedmetadata',
    function() {

      if (durEl) {

        durEl.textContent =
          fmt(
            audio.duration
          );
      }
    }
  );


  // ----------------------------------------------------------
  // TIME UPDATE
  // ----------------------------------------------------------

  audio.addEventListener(
    'timeupdate',
    function() {

      if (!audio.duration) {
        return;
      }

      if (track) {

        track.value =
          (
            audio.currentTime /
            audio.duration
          ) * 100;
      }

      if (curEl) {

        curEl.textContent =
          fmt(
            audio.currentTime
          );
      }
    }
  );


  // ----------------------------------------------------------
  // PLAY
  // ----------------------------------------------------------

  audio.addEventListener(
    'play',
    function() {

      if (playBtn) {
        playBtn.innerHTML =
          pauseIcon;
      }
    }
  );


  // ----------------------------------------------------------
  // PAUSE
  // ----------------------------------------------------------

  audio.addEventListener(
    'pause',
    function() {

      if (playBtn) {
        playBtn.innerHTML =
          playIcon;
      }
    }
  );


  // ----------------------------------------------------------
  // ENDED
  // ----------------------------------------------------------

  audio.addEventListener(
    'ended',
    function() {

      if (playBtn) {
        playBtn.innerHTML =
          playIcon;
      }

      if (track) {
        track.value = 0;
      }

      if (curEl) {
        curEl.textContent =
          '0:00';
      }
    }
  );


  // ----------------------------------------------------------
  // PLAY / PAUSE BUTTON
  // ----------------------------------------------------------

  if (playBtn) {

    playBtn.addEventListener(
      'click',
      function() {

        if (audio.paused) {

          audio.play()
            .catch(
              function() {}
            );

        } else {

          audio.pause();
        }
      }
    );
  }


  // ----------------------------------------------------------
  // SEEK
  // ----------------------------------------------------------

  if (track) {

    track.addEventListener(
      'input',
      function() {

        if (audio.duration) {

          audio.currentTime =
            (
              track.value / 100
            ) *
            audio.duration;
        }
      }
    );
  }


  // ----------------------------------------------------------
  // VOLUME
  // ----------------------------------------------------------

  if (volumeCtl) {

    volumeCtl.addEventListener(
      'input',
      function() {

        audio.volume =
          volumeCtl.value / 100;

      }
    );
  }


  // ----------------------------------------------------------
  // RESTART
  // ----------------------------------------------------------

  if (restartBtn) {

    restartBtn.addEventListener(
      'click',
      function() {

        audio.currentTime = 0;

        audio.play()
          .catch(
            function() {}
          );
      }
    );
  }


  // ----------------------------------------------------------
  // AUTOPLAY
  // ----------------------------------------------------------

  if (autoplay) {

    setTimeout(
      function() {

        audio.play()
          .catch(
            function() {}
          );

      },
      300
    );
  }
}