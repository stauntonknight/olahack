var EventView = function(eventDetail, callback) {
   dust.render('event',
           {title: eventDetail.title, status: eventDetail.status},
           function(err, out) {
               callback($('<div></div>').html(out));
           }); 
};
