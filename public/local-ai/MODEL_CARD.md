# SmolLM2 135M Instruct, Q4_1

This app runs an open language model locally, without an inference API.

- Model author: HuggingFaceTB. Architecture: SmolLM2, 135 million parameters.
- Model: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Quantized weights: https://huggingface.co/QuantFactory/SmolLM2-135M-Instruct-GGUF/tree/ab810cf68114990406fdf996510dd3d3c6adbdf5
- Distribution: Simon Willison's Apache-2.0 `llm-smollm2` 0.1.2 package, https://github.com/simonw/llm-smollm2
- Package SHA-256 was verified against its PyPI release metadata before extracting the model. `model.json` records the package, reconstructed model, and individual-part checksums.
- Runtime: https://github.com/ngxson/wllama, MIT license. The installed version is pinned in the lockfile. Its license accompanies the runtime.

The original GGUF is split into three byte ranges so each GitHub file stays below the per-file size limit. The browser reconstructs and verifies the complete model before loading it. All runtime downloads come from this GitHub Pages site; documents and prompts are processed on the device.

This small model can produce incomplete, inaccurate, or repetitive answers. The app supplies relevant document passages and links back to those passages for checking. It does not certify comprehension, fluency, or CEFR level. Offline use of the model requires its cached files and an already loaded app; the app itself does not yet have a service worker.
