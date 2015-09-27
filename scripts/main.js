function getRecentEvents(callback) {
    $.get('/getrecentevents', {}, function(res) {
        callback(JSON.parse(res));
    });
};

function refreshoAuth() {
    var url = 'http://sandbox-t.olacabs.com/oauth2/authorize?response_type=token&client_id=OGU4OWFmNTYtMmIyOS00MDVhLWJkNzktMmZkZTNiZTU3Mzhk&redirect_uri=http://localhost:3000/handlequery&scope=profile%20booking&state=state123';
    window.location.href = url;
};

function renderRecentEvents() {
    getRecentEvents(function(events) {
        $('#scheduled').empty();
        for (var i = 0 ; i < events.length; i++) {
            var e = events[i];
            var title;
            if (e.crn) {
                title = "Service scheduled at :" + e.hr + ' ' + e.min;
            } else {
                title = "Service queued and will be served at :" + e.hr + ' ' + e.min;
            }
            new EventView({title:title ,status:e.status}, function(out) {
                if (e.crn) {
                    $(out).addClass('event-scheduled');
                } else {
                    $(out).addClass('event-queued');
                }
                $('#scheduled').append(out);
            });
        }
    });
};

function getAllChores(callback) {
        $.get('/getChores', {}, function(res) {
            callback(JSON.parse(res));
        });
};


function renderAllChores() {
    getAllChores(function(chores) {
        $('#chores').empty();
        for (var i = 0 ; i < chores.length; i++) {
            var c = chores[i];
            new ChoreView({title:c.title ,link:c.link},
                function(out) {
                $('#chores').append(out);
                $(out).find('.glyphicon-ok').click(function() {
                    removeChore($(out).find('.titlelink').text());
                    $(out).hide();
                });
            });
        }
    });
};

var addChore = function(title, link, duration) {
    $.get('/createchore', {
        title: title,
        link: link,
        duration: duration
    });
 };

var showAddChore = function() {
  $('#addchorebut').hide();
  $('.addchore').show();
  $('#mainform').hide();
};

var hideAddChore = function() {
  $('#addchorebut').show();
  $('.addchore').hide();
  $('#mainform').show();
};

$(function() {
    if (window.location.hash) {
        $.get('/handlequery', {
            q: window.location.hash
        });
    }
    $('#oauthrefresh').click(refreshoAuth);

    $('#submit').click(function() {
    $.get('/handlequery', {
        q: $('#task').val()
    }, function(res) {
        if (res == 'success') {
            // Show UI for success.
            console.log(res);
        }
    });
    });
    $('.addchore').hide();
    $('#addchorebut').show();
    $('#addchorebut').click(showAddChore);
    $('#doneaddchore').click(function() {
        var link = $('#addchorelink').val();
        var duration = $('#addchoreduration').val();
        var title = $('#addchoretitle').val();
        if (duration && title) {
            addChore(title, link, duration);
            hideAddChore();
        } else {
            if (!duration) {
              $('#addchoreduration').addClass('error');    
            }
            if (!title) {
              $('#addchoretitle').addClass('error');    
            }
        }
    });
    $('#discardaddchore').click(function() {
        hideAddChore();
    });
    setInterval(renderRecentEvents, 5000);
    setInterval(renderAllChores, 5000);
    setTimeout(checkAndShowToast, 10000);
});


function getCurrentRide(callback) {
    $.get('/getCurrentRideEstimate', {}, function(res) {
        if (Number(res)) {
            callback({duration: Number(res)});
        } else {
            callback(null);
        }
    });
};


function checkAndShowToast() {
    getCurrentRide(function(ride) {
        if (ride) {
           getAllChores(function(chores) {
               for (var i = 0  ; i <chores.length; i++) {
                   if (chores[i].duration < ride.duration) {
                       toastr.info('You can probably complete ' + chores[i].title);
                       break;
                       // Maybe highlight chores.
                   }
               }
           }); 
           setTimeout(checkAndShowToast, ride.duration * 60 * 1000);
        } else {
           setTimeout(checkAndShowToast, 600000);
        }
    });
};

function removeChore(title) {
    $.get('/deleteChore', {title: title});
};
