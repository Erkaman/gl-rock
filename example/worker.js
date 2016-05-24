/**
 * Created by eric on 23/05/16.
 */

var RockObj = require('./rock_obj.js');
var randomArray = require('random-array');
var createRock = require('./rock.js').createRock;

module.exports = function (self) {

    var count = 5;
    var rockObj;

    self.addEventListener('message',function (msg){

        if(count > 4) {
            
            rockObj = new RockObj();
            rockObj.varyStrength = 1.0;

            // vary scale some more:
            var V = 0.8;

            rockObj.varyArray(rockObj.scale, 0, V, SCALE_MIN, SCALE_MAX);
            rockObj.varyArray(rockObj.scale, 1, V, SCALE_MIN, SCALE_MAX);
            rockObj.varyArray(rockObj.scale, 2, V, SCALE_MIN, SCALE_MAX);

            count = 0;
        }

        // always use an unique seed.
        rockObj.seed = Math.round(randomArray(0, 1000000).oned(1)[0]);

        rockObj.varyNoise();rockObj.varyColor(); rockObj.varyMesh();

        var rock = createRock(rockObj );

        ++count;

        rockObj.varyStrength = 1.0;

        self.postMessage([msg.data, rock]);
    });
};