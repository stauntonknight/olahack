var ChoreView = function(choreDetail, callback) {
   dust.render('choreview',
           {title: choreDetail.title, link: choreDetail.link},
           function(err, out) {
               callback($('<div></div>').html(out));
           }); 
};
