const res = require("express/lib/response");

class profilesController {

    // [GET] /profiles
    index(req, res) {
      
        res.render('profiles');
    }

    // // [GET] /profiles/:updateprofile
    // show(req, res){
    //     res.send('UPDATE PROFILE!!!');
    // }



}

module.exports = new profilesController;