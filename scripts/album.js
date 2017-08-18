var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
}

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    // #1
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        // #2
        formats: [ 'mp3' ],
        preload: true
});
         setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSOundFile) {
    currentSoundFile.setTime(time);
  }
}

var setVolume = function(volume) {
     if (currentSoundFile) {
         currentSoundFile.setVolume(volume);
     }
 };


var setCurrentTimeInPlayerBar = function(currentTime){
  var $currentTime = filterTimeCode(currentTime);
  var $songTime = $('.current-time').html($currentTime);
};

var SetTotalTimeInPlayer = function(totalTime){
  totalTime = $('.song-item-duration').html();
  var $fullSongTime = $(".total-time").html(totalTime);

  filterTimeCode($fullSongTime);
};

var filterTimeCode = function(timeInSeconds) {
timeInSeconds = parseFloat(timeInSeconds);
var minutes = Math.floor(timeInSeconds / 60);
var seconds = Math.floor(timeInSeconds % 60);
return minutes + ":" + seconds;
};

var getSongNumberCell = function(number){
  return $('.song-item-number [data-song-number=" '+ number +'"]');
};

var createSongRow = function(songNumber, songName, songLength) {
    var $songLength = filterTimeCode(songLength);

      var template =
         '<tr class="album-view-song-item">'
       +       + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
       + '  <td class="song-item-title">' + songName + '</td>'
       + '  <td class="song-item-duration">' + songLength + '</td>'
       + '</tr>'
       ;
       var $row = $(template);

       var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
          var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

          currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
          currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }


        if (currentlyPlayingSongNumber !== songNumber) {
          setSong(songNumber);
          currentSoundFile.play();
          updateSeekBarWhileSongPlays();
          currentSongFromAlbum = currentAlbum.songs[songNumber -1];

          var $volumeFill = $('.volume .fill');
          var $volumeThumb = $('.volume .thumb');
          $volumeFill.width(currentVolume+ '%');
          $volumeThumb.css({left: currentVolume + '%'});

          $(this).html(pauseButtonTemplate);
          updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {

          if (currentSoundFile.isPaused()) {
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentSoundFile.play()
          } else {
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentSoundFile.pause();
          }
        }
};

   var onHover = function(event) {
        //  function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = songNumberCell.attr('data-song-number');

        if (songNumber !== setSong) {
          songNumberCell.html(playButtonTemplate);
        }
    };

    var offHover = function(event) {
        //  function logic
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = songNumberCell.attr('data-song-number');

        if (songNumber !== setSong) {
            songNumberCell.html(songNumber);
          }
    };


       $row.find('.song-item-number').click(clickHandler);
       $row.hover(onHover, offHover);
       return $row;

  };

  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');
  var $controls = $('.main-controls .play-pause');


  var setCurrentAlbum = function(album){
    currentAlbum = album;

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    // #4
    for (var i = 0; i < album.songs.length; i++) {
      var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
               $albumSongList.append($newRow);
                 }
};

var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         // #10
         currentSoundFile.bind('timeupdate', function(event) {
             // #11
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
             updateSeekPercentage($seekBar, seekBarFillRatio);

             var playTime = this.getTime();
             setCurrentTimeInPlayerBar(playTime);
         });
     }
 };

 var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
     var offsetXPercent = seekBarFillRatio * 100;
     // #1
     offsetXPercent = Math.max(0, offsetXPercent);
     offsetXPercent = Math.min(100, offsetXPercent);

     // #2
     var percentageString = offsetXPercent + '%';
     $seekBar.find('.fill').width(percentageString);
     $seekBar.find('.thumb').css({left: percentageString});
  };

  var setupSeekBars = function() {
       var $seekBars = $('.player-bar .seek-bar');

       $seekBars.click(function(event) {
           // #3
           var offsetX = event.pageX - $(this).offset().left;
           var barWidth = $(this).width();
           // #4
           var seekBarFillRatio = offsetX / barWidth;

           // #5
           updateSeekPercentage($(this), seekBarFillRatio);
       });

       $seekbars.find('thumb').mousedown(function(event) {

       var $seekBar = $(this).parent();

       $(document).bind('mousemove.thumb', function(event){
           var offsetX = event.pageX - $seekBar.offset().left;
           var barWidth = $seekBar.width();
           var seekBarFillRatio = offsetX / barWidth;

           if ($seekBar.parent().attr("class") === "seek-control"){
              seek(seekBarFillRatio * currentSoundFile.getDuration());
           } else {
              setVolume(seekBarFillRatio);
           }

           updateSeekPercentage($seekBar, seekBarFillRatio);
       });

       $(document).bind('mouseup.thumb', function() {
           $(document).unbind('mousemove.thumb');
           $(document).unbind('mouseup.thumb');
       });
   });
};


var trackIndex = function(album, song){
  return album.songs.indexof(song);
};


 var nextSong = function() {
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     currentSongIndex++;

     if (currentSongIndex >= currentAlbum.songs.length) {
         currentSongIndex = 0;
     }

     var lastSongNumber = setSong;

     setSong(currentSongIndex +1);
     currentSoundFile.play();
     currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

     updatePlayerBarSong();

     var $nextSongNumberCell = getSongNumberCell(setSong);
     var $lastSongNumberCell = getSongNumberCell(setSongNumber);

     $nextSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
 };

 var previousSong = function() {
     var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
     currentSongIndex--;

     if (currentSongIndex < 0) {
         currentSongIndex = currentAlbum.songs.length - 1;
     }

     var lastSongNumber = setSong;

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

     updatePlayerBarSong();

     $('.main-controls .play-pause').html(playerBarPauseButton);

     var $previousSongNumberCell = getSongNumberCell(setSong);
     var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

     $previousSongNumberCell.html(pauseButtonTemplate);
     $lastSongNumberCell.html(lastSongNumber);
 };


var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);

SetTotalTimeInPlayer();

};


var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var currentSongLength = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
var songRows = document.getElementsByClassName('album-view-song-item');

// code below chcekd through assignment 32

var togglePlayFromPlayerBar = function(){
  if (currentSoundFile.isPaused()) {
    $(this).html(pauseButtonTemplate);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    currentSoundFile.play();

  } else {
      $(this).html(playButtonTemplate);
      $('.main-controls .play-pause').html(playerBarPauseButton);
      currentSoundFile.pause();
  }
};

var albums = [albumPicasso, albumMarconi, albumCher];

$(document).ready(function() {
  var n = 1;
  setCurrentAlbum(albums[0]);
  setupSeekBars();

  $previousButton.click(previousSong);
  $nextButton.click(nextSong);

  $controls.click(togglePlayFromPlayerBar);

  $albumImage.click(function(){
    setCurrentAlbum(albums[n]);
    n++;
    if (n == albums.length){
      n = 0;
    }
  });
