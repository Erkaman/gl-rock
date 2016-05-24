# Procedural Rock Generation using WebGL

In this project, a simple technique for procedurally generating rocks is showcased.

![1000rocks](images/1000rocks.png)

## Demo

Two demos of the technique are provided.

## Explanation.

In this section, our technique for procedurally generating rocks is outlined.

The general idea of simple: If you look at rocks in nature, you will notice that they are round at some places, and flat at other places. We can reproduce this shape by first starting with a sphere mesh:

<img src="images/c1.png" width="300" height="300" />

and then randomly scraping off parts(flattening) off this mesh, while leaving other parts untouched:

<img src="images/c2.png" width="300" height="300" />

This is easy to implement. To randomly scrape a certain part of the sphere, we first randomly define a plane:

<img src="images/c3.png" width="300" height="300" />

Now, all vertices that are on one side of the plane are left untouched, but the vertices on the other side are projected onto the plane:

<img src="images/c4.png" width="300" height="300" />

And we can easily project vertices onto a plane by using some elementary linear algebra. For more details, see the source code in `example/scrape.ks`.

Once we have randomly scraped the sphere mesh, we use a Perlin noise to randomly move distort the vertices a little bit. Finally, the rock mesh is then generated with a Perlin noise in a fragment shader. This means that are basically generating the texture in real time, which also means that it is very taxing on lower-end GPUs.


## Images

Some images of rocks made with this technique are shown:




