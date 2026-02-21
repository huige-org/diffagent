# ML Enhancement for DiffAgent

This directory contains the machine learning enhancement for DiffAgent.

## Components

- **data-loader.js**: Loads and processes training data
- **feature-engineer.js**: Extracts features from code diffs
- **simple-ml.js**: Statistical ML model implementation
- **model-integrator.js**: Integrates ML model with DiffAgent
- **train.js**: Model training script
- **test-ml.js**: ML model testing script

## Usage

1. Collect training data from open source projects
2. Train the ML model using `node ml/train.js`
3. Test the model using `node ml/test-ml.js`
4. The model will automatically enhance DiffAgent analysis