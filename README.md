# Zodiac

In this project, we question the subtle difference between "learning to classification" and "learning to recognition" though the use of deep learning on a hand shadow dataset.

## Motivation

The de facto standard for image classification is the supervisedly trained convolutional neural networks. Every machine learning practitioner knows about this. They have one major flaw however --- adding or changing object classes involves retraining. Not just this domain but the majority of supervised learning algorithms seem to lean toward bootstrapping or pre-hardwired to be versed at their tasks, not that much different from being programmed to do something. The machines do not actually "learn to do classification" via experience, but rather "learn to recognize." Is this truly what we want?

The word "classification" implies that the machine should be able to perform classification according to any given class examples. If I ask the machine to classify the sun into the shape classes, it should report "sphere". But if I suddenly change to the color classes instead, it should be able to report "yellow" without retraining.

This scheme calls for learning to learn or one-shot learning where the heart of these algorithms relies on knowledge transfer or explicit model with memory augmented respectively. But we are looking for a more direct method. Why don't we design a model that can compare the input with given set of classes as the templates, to see which one is most similar?

### Learn to compare

Humans are more or less capable dealing with classification problem. Given a new object and a list of categorial examples to compare with, we can immediately identify to which category that object belongs. Given a new example set, we can do it again without fail, though the results may vary depending on personal learned metric of similarity. That's right. We want the model to establish a metric of similarity from a set of training examples. 

A metric implies a distance function, $d : S \times S \to R$, working on a closed set of features $S$ to compare a pair of two of such members. The model is a function parameterized by a set of weights $\vec{w}$ that converts an example into this feature space, $f : D \to S$ where $D$ is the space of input and example data. 
   
![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/compare.png)

Though this technique is [hardly novel](https://arxiv.org/abs/1711.06025). It surprisingly has not been much explored over the years of deep learning research despite that it's a straightforward way for doing classification. 

### Training paradigm

Provided with a set of exemplary objects categorized into classes, the training will then go like this:
 - Take a sample data and another sample data from the *same* class.
   Adjust the model so that the comparison result of these two examples
   has *high* similarity. 
 - Take a sample data and another sample data
   from a *different* class. Adjust the model so that the comparison
   result of these two examples has *low* similarity.

## The shadow projection dataset

The dataset contains many binary shadow projection images not unlike those of [MNIST](http://yann.lecun.com/exdb/mnist/). But it is of varied resolutions, and the informational content of each shadow image mostly clusters at the position of the hands in the image. Due to these natures, a dynamic model like RNN or data preprocessing is required to transform the image into a fixed-dimension feature vector for direct comparison. High variance models like RNN, however, requires more data or we risk overfitting. That is why we choose the later approach.

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/gen.png)

Despite the difference in dimension, all we really need is the shape of the hand shadow in each image. So we extract shadow contour from the image, and resample the contour in the polar coordinate to have a fixed length of a regular angular interval. Doing this has many benefits:

### Translation and scale invariant

Translation invariant is automatically achieved when converting the contour to the polar coordinate using the mean location as the pivot. The difference in scale can be removed immediately by normalizing the radial part of the polar coordinate to a fixed mean. This method preserves the overall shape of the shadow and should not affect the classification results by design. 

### But not already rotation invariant

The rotation invariant must be expressed in the feature vectors. In classical computer vision, the general sets of features that allow rotation invariant include those in the forms of statistical "moments", or the [powered sums of all data values](https://en.wikipedia.org/wiki/Image_moment). We hope to train a model to extract somewhat similar statistics, especial to our given dataset. That's why during the training we extract the contours from the image data, perform normalization, and rotate each randomly, before feeding them into the training pipeline. 


## The network

We use a residue network to transform a fixed-length contour to a fixed dimension feature vector.

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/extraction.png)

As previously mentioned, we directly compare the features to those of the class examples. For the comparison metric, we use the negative gaussian as it has bounded edge preventing exploding of gradients. Here is the final model.

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/full.png)

## Implementation

### Tensorflow with GPU support
We trained the model on google cloud virtual machine with nvidia Tesla P100. We wrote a network graph that takes the after-normalized contours as the input. The network performs internal random sampling, randomly rotate the data, and train the model on GPU. The code can be found [here](https://github.com/PVirie/zodiac).

### TPU
TPU offers an increasing speed for training. But we can no longer perform internal random sampling and rotate on TPU at the moment due to API limitation. The code for TPU can be found in the `tpu` branch of the same repository.

## Results

A shadowplay system that we can change class examples on the fly. Want to add or change label? Simply update the example and that's it. The system can't recognize a hand gesture correctly? Simply take a snapshot of that gesture and add it to the examples to refine the results.

### Visualize the feature space

If we want to see what's going on in the top most level of our network, the most convenient way is to project the result feature space onto a 2D plane (via [t-SNE](https://lvdmaaten.github.io/tsne/)) ( where each of the color dots represents a shadow data point.)

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/COMP.png)

When we compare it to the similar projections from using just the raw data and from using [variational autoencoder](https://en.wikipedia.org/wiki/Autoencoder#Variational_autoencoder_(VAE)) as the encoding network.

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/RAW.png)

![enter image description here](https://github.com/PVirie/zodiac/raw/master/artifacts/VAE.png)

Clearly, we can see a benefit of using our model for data clustering because that's what it has been designed to do from start.

## Installation

### With GPU supports

Install CUDA then:
`pip3 install tensorflow-gpu opencv-python matplotlib pillow tornado`

### Without GPU supports
`pip3 install tensorflow opencv-python matplotlib pillow tornado`

## Usages

### Training
`python3 train.py --list <directory name> --iter <iterations> --name <weight set name>`

### Start server
`python3 server.py`

### Start via launcher
`python3 launch.py`