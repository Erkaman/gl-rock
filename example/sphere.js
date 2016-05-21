function createSphere(opt) {

    var radius = opt.radius || 1.0;
    var stacks = opt.stacks || 32;
    var slices = opt.slices || 32;

    var positions = [];
    var cells = [];
    var normals = [];
    var uvs = [];

    // keeps track of the index of the next vertex that we create.
    var index = 0;


    /*
     First of all, we create all the faces that are NOT adjacent to the
     bottom(0,-R,0) and top(0,+R,0) vertices of the sphere.

     (it's easier this way, because for the bottom and top vertices, we need to add triangle faces.
     But for the faces between, we need to add quad faces. )
     */

    // loop through the stacks.
    for (var i = 1; i < stacks; ++i){

        var u  = i / stacks;
        var phi = u * Math.PI;


        var stackBaseIndex = cells.length/2;

        // loop through the slices.
        for (var j = 0; j < slices; ++j){

            var v = j / slices;
            var theta = v * (Math.PI * 2);



            var R = radius
            // use spherical coordinates to calculate the positions.
            var x = Math.cos (theta) * Math.sin (phi);
            var y = Math.cos (phi);
            var z =Math.sin (theta) * Math.sin (phi);

            positions.push([R*x,R*y,R*z]);
            normals.push([x,y,z]);

            if((i +1) != stacks ) { // for the last stack, we don't need to add faces.

                var i1, i2, i3, i4;

                if((j+1)==slices) {
                    // for the last vertex in the slice, we need to wrap around to create the face.
                    i1 = index;
                    i2 = stackBaseIndex;
                    i3 = index  + slices;
                    i4 = stackBaseIndex  + slices;

                } else {
                    // use the indices from the current slice, and indices from the next slice, to create the face.
                    i1 = index;
                    i2 = index + 1;
                    i3 = index  + slices;
                    i4 = index  + slices + 1;

                }

                // add quad face
                cells.push([i1, i2, i3]);
                cells.push([i4, i3, i2]);
            }

            index++;
        }
    }

    /*
     Next, we finish the sphere by adding the faces that are adjacent to the top and bottom vertices.
     */

    var topIndex = index++;
    positions.push([0.0,radius,0.0]);
    normals.push([0,1,0]);


    var bottomIndex = index++;
    positions.push([0, -radius, 0 ]);
    normals.push([0,-1,0]);


    for (var i = 0; i < slices; ++i) {

        var i1 = topIndex;
        var i2 = (i+0);
        var i3 = (i+1) % slices;
        cells.push([i3, i2, i1]);

        var i1 = bottomIndex;
        var i2 = (bottomIndex-1) - slices +  (i+0);
        var i3 = (bottomIndex-1) - slices + ((i+1)%slices);
        cells.push([i1, i2, i3]);
    }

    return {positions: positions, cells: cells, normals:normals};
}

module.exports = createSphere;